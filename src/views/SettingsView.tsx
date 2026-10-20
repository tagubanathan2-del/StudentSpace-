import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Bell, User, Clock, Volume2, Save, Download, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { UserSettings, Task, StudyBlock } from '../types';
import { exportJsonBackup, clearAllData } from '../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onDataImported: (tasks: Task[], blocks: StudyBlock[]) => void;
}

const AVATARS = ['🎓', '📚', '⚡', '💻', '🔬', '🎨', '🚀', '🧠', '☀️'];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onDataImported,
}) => {
  const [studentName, setStudentName] = useState(settings.studentName);
  const [avatarIcon, setAvatarIcon] = useState(settings.avatarIcon);
  const [workDuration, setWorkDuration] = useState(settings.workSessionDuration.toString());
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration.toString());
  const [soundEffects, setSoundEffects] = useState(settings.soundEffectsEnabled);
  const [quoteInterval, setQuoteInterval] = useState(settings.quoteRotationInterval);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const [savedFeedback, setSavedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('StudySpace Notifications Enabled', {
          body: 'You will receive reminders for upcoming study sessions and deadlines.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      ...settings,
      studentName: studentName.trim() || 'Student Planner',
      avatarIcon,
      workSessionDuration: Math.max(1, parseInt(workDuration, 10) || 25),
      shortBreakDuration: Math.max(1, parseInt(shortBreak, 10) || 5),
      soundEffectsEnabled: soundEffects,
      quoteRotationInterval: quoteInterval,
    };
    onSaveSettings(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks || json.blocks) {
          onDataImported(json.tasks || [], json.blocks || []);
          if (json.settings) {
            onSaveSettings(json.settings);
          }
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your tasks and study schedules? This cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <SettingsIcon className="w-3.5 h-3.5" />
          PREFERENCES & SYSTEM INTEGRATIONS
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your student identity, background device notifications, timers, and data backups.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Background Device Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Background Device Notifications</h2>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {notificationPermission === 'granted'
                ? 'Granted'
                : notificationPermission === 'denied'
                ? 'Blocked'
                : 'Default'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Stay updated on upcoming output deadlines, due today reminders, and morning study briefings even when StudySpace is closed or minimized. System notifications pop up directly on your desktop or mobile lock screen.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRequestNotification}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center gap-2 transition-all active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Device Notifications</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Requires browser notification permission
            </p>
          </div>
        </div>

        {/* Section 2: Student Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Student Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Student Name / Workspace Title
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Student Planner"
                className="w-full max-w-md px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Choose Avatar Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarIcon(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                      avatarIcon === emoji
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Pomodoro Focus Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Pomodoro Focus Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Session Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={workDuration}
                onChange={(e) => setWorkDuration(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Break Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={shortBreak}
                onChange={(e) => setShortBreak(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Audio & Experience */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Audio & Experience</h2>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Study Space Sound Effects</span>
              <span className="text-[11px] text-slate-500">Play subtle chimes on task completion and Pomodoro bell ring.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Quote Rotation */}
          <div className="max-w-xs space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Motivational Quote Rotation Interval
            </label>
            <select
              value={quoteInterval}
              onChange={(e) => setQuoteInterval(e.target.value as UserSettings['quoteRotationInterval'])}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            >
              <option value="10">Every 10 seconds</option>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 1 minute</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {savedFeedback && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Note: 'Download App Files' (standalone HTML & ZIP) has been completely removed as requested */}

      {/* Data Management & Local Storage (Note: 'Reset to Sample Data' removed as requested) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Data Management & Local Storage</h2>
        <p className="text-xs text-slate-500">
          All your tasks, study schedules, and activities are saved securely in this browser (localStorage). You can back them up or transfer to another device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportJsonBackup}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Workspace Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
