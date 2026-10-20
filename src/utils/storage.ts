import { Task, StudyBlock, ActivityItem, UserSettings, NotificationItem } from '../types';

const TASKS_KEY = 'studyspace_tasks';
const BLOCKS_KEY = 'studyspace_blocks';
const SETTINGS_KEY = 'studyspace_settings';
const ACTIVITY_KEY = 'studyspace_activity';
const NOTIFICATIONS_KEY = 'studyspace_notifications';
const FOCUS_COUNT_KEY = 'studyspace_focus_count';

export const defaultSettings: UserSettings = {
  studentName: 'Student Planner',
  avatarIcon: '🎓',
  notificationsEnabled: false,
  workSessionDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEffectsEnabled: true,
  quoteRotationInterval: '10',
};

// Initial welcome notifications that match the "3" badge in the screenshots
const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to StudySpace',
    message: 'Your clean academic workspace is ready. Add your courses, assignments, and study sessions.',
    timestamp: 'Just now',
    read: false,
    type: 'tip',
  },
  {
    id: 'notif-2',
    title: 'Cognitive Tip #1',
    message: 'Break high-priority tasks into 25-minute Pomodoro focus blocks to maximize retention.',
    timestamp: '1 hour ago',
    read: false,
    type: 'tip',
  },
  {
    id: 'notif-3',
    title: 'Focus Timer Ready',
    message: 'Try ambient rain audio in your next deep work focus session.',
    timestamp: '2 hours ago',
    read: false,
    type: 'reminder',
  },
];

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return []; // Clean empty start, NO sample data
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function getStoredBlocks(): StudyBlock[] {
  try {
    const raw = localStorage.getItem(BLOCKS_KEY);
    if (!raw) return []; // Clean empty start, NO sample data
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredBlocks(blocks: StudyBlock[]): void {
  try {
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  } catch (e) {
    console.error('Failed to save study blocks:', e);
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addActivityItem(action: string, target: string, type: ActivityItem['type']): ActivityItem[] {
  try {
    const items = getStoredActivity();
    const newItem: ActivityItem = {
      id: 'act-' + Date.now(),
      action,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    const updated = [newItem, ...items].slice(0, 30);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return defaultNotifications;
    return JSON.parse(raw);
  } catch {
    return defaultNotifications;
  }
}

export function saveStoredNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

export function getCompletedFocusCount(): number {
  try {
    const raw = localStorage.getItem(FOCUS_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementFocusCount(): number {
  try {
    const current = getCompletedFocusCount() + 1;
    localStorage.setItem(FOCUS_COUNT_KEY, current.toString());
    return current;
  } catch {
    return 1;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(BLOCKS_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(FOCUS_COUNT_KEY);
}

/**
 * Export JSON backup
 */
export function exportJsonBackup(): void {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks: getStoredTasks(),
    blocks: getStoredBlocks(),
    settings: getStoredSettings(),
    activity: getStoredActivity(),
    focusCount: getCompletedFocusCount(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Tasks CSV
 */
export function exportCsvReport(): void {
  const tasks = getStoredTasks();
  if (tasks.length === 0) {
    const emptyCsv = 'ID,Title,Subject,Deadline,Time Needed,Priority,Status,Created At\n';
    const blob = new Blob([emptyCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyspace-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const header = ['ID', 'Title', 'Subject', 'Deadline', 'Time Needed', 'Priority', 'Status', 'Created At'];
  const rows = tasks.map((t) => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.subject.replace(/"/g, '""')}"`,
    t.deadline,
    t.timeNeeded,
    t.priority,
    t.status,
    t.createdAt,
  ]);

  const csvContent = [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyspace-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
