export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string; // ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  timeNeeded: string; // e.g. "1.5h", "45m"
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface StudyBlock {
  id: string;
  day: DayOfWeek;
  title: string;
  subject: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  notes: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'task_created' | 'task_completed' | 'task_deleted' | 'study_block' | 'focus_session';
}

export interface UserSettings {
  studentName: string;
  avatarIcon: string;
  notificationsEnabled: boolean;
  workSessionDuration: number; // in minutes, default 25
  shortBreakDuration: number;  // in minutes, default 5
  longBreakDuration: number;   // in minutes, default 15
  soundEffectsEnabled: boolean;
  quoteRotationInterval: '10' | '30' | '60' | 'manual';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'tip' | 'achievement';
}
