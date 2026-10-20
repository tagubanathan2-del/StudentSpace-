import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { FocusModal } from './components/FocusModal';
import { TaskModal } from './components/TaskModal';
import { StudyBlockModal } from './components/StudyBlockModal';
import { NotificationDrawer } from './components/NotificationDrawer';

import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { CalendarView } from './views/CalendarView';
import { StudyPlanView } from './views/StudyPlanView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

import { Task, StudyBlock, ActivityItem, UserSettings, NotificationItem, DayOfWeek } from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredBlocks,
  saveStoredBlocks,
  getStoredSettings,
  saveStoredSettings,
  getStoredActivity,
  addActivityItem,
  getStoredNotifications,
  saveStoredNotifications,
  getCompletedFocusCount,
  incrementFocusCount,
} from './utils/storage';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks());
  const [blocks, setBlocks] = useState<StudyBlock[]>(() => getStoredBlocks());
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(() => getStoredActivity());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());
  const [completedFocusCount, setCompletedFocusCount] = useState<number>(() => getCompletedFocusCount());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>(undefined);

  const [isStudyBlockModalOpen, setIsStudyBlockModalOpen] = useState(false);
  const [studyBlockInitialDay, setStudyBlockInitialDay] = useState<DayOfWeek | undefined>(undefined);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync tasks to storage
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Sync study blocks to storage
  useEffect(() => {
    saveStoredBlocks(blocks);
  }, [blocks]);

  // Task Handlers
  const handleOpenAddTask = (dateStr?: string) => {
    setTaskToEdit(null);
    setTaskModalInitialDate(dateStr);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Task) => {
    if (taskToEdit) {
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? taskData : t)));
      const updatedAct = addActivityItem('Updated task', taskData.title, 'task_created');
      setActivityLog(updatedAct);
    } else {
      setTasks((prev) => [taskData, ...prev]);
      const updatedAct = addActivityItem('Created new task', taskData.title, 'task_created');
      setActivityLog(updatedAct);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const updatedAct = addActivityItem('Deleted task', task.title, 'task_deleted');
    setActivityLog(updatedAct);
  };

  const handleToggleTaskDone = (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'Completed' ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
    const actionDesc = nextStatus === 'Completed' ? 'Completed task' : 'Marked task pending';
    const updatedAct = addActivityItem(actionDesc, task.title, 'task_completed');
    setActivityLog(updatedAct);
  };

  // Study Block Handlers
  const handleOpenAddBlock = (day?: DayOfWeek) => {
    setStudyBlockInitialDay(day || 'Monday');
    setIsStudyBlockModalOpen(true);
  };

  const handleSaveBlock = (block: StudyBlock) => {
    setBlocks((prev) => [...prev, block]);
    const updatedAct = addActivityItem('Scheduled study session', `${block.day}: ${block.title}`, 'study_block');
    setActivityLog(updatedAct);
  };

  const handleToggleBlockComplete = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, isCompleted: !b.isCompleted } : b))
    );
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      const updatedAct = addActivityItem(
        block.isCompleted ? 'Unchecked study block' : 'Finished study block',
        block.title,
        'study_block'
      );
      setActivityLog(updatedAct);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Focus Session Handlers
  const handleFocusSessionComplete = (targetTaskTitle: string) => {
    const nextCount = incrementFocusCount();
    setCompletedFocusCount(nextCount);
    const updatedAct = addActivityItem('Completed focus session', targetTaskTitle, 'focus_session');
    setActivityLog(updatedAct);

    // Add achievement notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Focus Session Completed!',
      message: `Great job! You wrapped up a 25-minute focus session on "${targetTaskTitle}".`,
      timestamp: 'Just now',
      read: false,
      type: 'achievement',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveStoredNotifications(updatedNotifs);
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const updated = { ...settings, soundEffectsEnabled: !settings.soundEffectsEnabled };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Notification actions
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  // Backup data imported
  const handleDataImported = (importedTasks: Task[], importedBlocks: StudyBlock[]) => {
    setTasks(importedTasks);
    setBlocks(importedBlocks);
    saveStoredTasks(importedTasks);
    saveStoredBlocks(importedBlocks);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-800">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        settings={settings}
        onToggleSound={handleToggleSound}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onOpenAddTask={() => handleOpenAddTask()}
              onOpenFocusModal={() => setIsFocusModalOpen(true)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleTaskDone={handleToggleTaskDone}
              onNavigate={(tab) => setActiveTab(tab)}
              activityLog={activityLog}
              soundEffectsEnabled={settings.soundEffectsEnabled}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              searchTerm={searchTerm}
              onOpenAddTask={() => handleOpenAddTask()}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleTaskDone={handleToggleTaskDone}
              soundEffectsEnabled={settings.soundEffectsEnabled}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onOpenAddTaskForDate={(dateStr) => handleOpenAddTask(dateStr)}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'study_plan' && (
            <StudyPlanView
              blocks={blocks}
              onOpenAddBlock={(day) => handleOpenAddBlock(day)}
              onToggleBlockComplete={handleToggleBlockComplete}
              onDeleteBlock={handleDeleteBlock}
              soundEffectsEnabled={settings.soundEffectsEnabled}
            />
          )}

          {activeTab === 'reports' && <ReportsView tasks={tasks} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                saveStoredSettings(newSettings);
              }}
              onDataImported={handleDataImported}
            />
          )}
        </main>
      </div>

      {/* Slide-out Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFocusModal={() => setIsFocusModalOpen(true)}
        taskCount={tasks.length}
        studyBlockCount={blocks.length}
      />

      {/* Focus Session Pomodoro Modal */}
      <FocusModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        tasks={tasks}
        settings={settings}
        completedFocusCount={completedFocusCount}
        onFocusSessionComplete={handleFocusSessionComplete}
      />

      {/* Task Modal (Add / Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        taskToEdit={taskToEdit}
        initialDate={taskModalInitialDate}
      />

      {/* Study Block Modal */}
      <StudyBlockModal
        isOpen={isStudyBlockModalOpen}
        onClose={() => setIsStudyBlockModalOpen(false)}
        onSaveBlock={handleSaveBlock}
        initialDay={studyBlockInitialDay}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onClearNotifications={handleClearNotifications}
      />
    </div>
  );
}
