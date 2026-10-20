import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Timer,
  Filter,
  Calendar as CalendarIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Task, TaskStatus, ActivityItem } from '../types';
import { ActiveTab } from '../components/Sidebar';
import { playChime } from '../utils/audio';

interface DashboardViewProps {
  tasks: Task[];
  onOpenAddTask: () => void;
  onOpenFocusModal: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskDone: (task: Task) => void;
  onNavigate: (tab: ActiveTab) => void;
  activityLog: ActivityItem[];
  soundEffectsEnabled: boolean;
}

const MOTIVATIONAL_QUOTES = [
  {
    quote: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
  },
  {
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    quote: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
  },
  {
    quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    author: 'Mahatma Gandhi',
  },
  {
    quote: 'Focus is a muscle. The more you practice deep work, the more effortless it becomes.',
    author: 'Cal Newport',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onOpenAddTask,
  onOpenFocusModal,
  onEditTask,
  onDeleteTask,
  onToggleTaskDone,
  onNavigate,
  activityLog,
  soundEffectsEnabled,
}) => {
  const [filter, setFilter] = useState<'All' | TaskStatus>('All');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Calendar widget state (October 2026 as shown in screenshot)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressRate = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const handleCheckboxClick = (task: Task) => {
    if (soundEffectsEnabled && task.status !== 'Completed') {
      playChime();
    }
    onToggleTaskDone(task);
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }
  // Next month padding to reach 35 or 42 cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl p-6 sm:p-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-indigo-600 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              ✨ YOUR PERSONAL WORKSPACE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Plan your next win.
            </h1>
            <p className="text-sm text-slate-300">
              Add a task whenever you have something to do. One step at a time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
            <button
              onClick={onOpenFocusModal}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Timer className="w-4 h-4 text-blue-300" />
              <span>Focus Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL TASKS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              TOTAL TASKS
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-800 tracking-tight">{totalTasks}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            {totalTasks === 0 ? 'Ready when you are' : `${totalTasks} active tracked`}
          </div>
        </div>

        {/* Card 2: COMPLETED */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              COMPLETED
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 tracking-tight">{completedTasks}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            — {completionRate}% completion
          </div>
        </div>

        {/* Card 3: IN PROGRESS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              IN PROGRESS
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-600 tracking-tight">{inProgressTasks}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            — {inProgressRate}% in progress
          </div>
        </div>

        {/* Card 4: OVERDUE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              OVERDUE
            </span>
          </div>
          <div className="text-3xl font-bold text-rose-600 tracking-tight">{overdueTasks}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            — {overdueTasks === 0 ? '0% overdue' : `${overdueTasks} need attention`}
          </div>
        </div>
      </div>

      {/* My Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Filter pills */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-800">My Tasks</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
              {(['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filter === tab
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={onOpenAddTask}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Tasks Table / Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No tasks match the filter &quot;{filter}&quot;.
            </p>
            <button
              onClick={onOpenAddTask}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Task</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">DONE</th>
                  <th className="py-3 px-4">TASK / OUTPUT</th>
                  <th className="py-3 px-4">SUBJECT</th>
                  <th className="py-3 px-4">DEADLINE</th>
                  <th className="py-3 px-4">TIME NEEDED</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'Completed';
                  const priorityDot =
                    task.priority === 'High'
                      ? 'bg-rose-500'
                      : task.priority === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';

                  const statusBadgeColor =
                    task.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : task.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : task.status === 'Overdue'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleCheckboxClick(task)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className={isDone ? 'line-through text-slate-400' : ''}>
                          {task.title}
                        </span>
                        {task.notes && (
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                            {task.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {task.subject}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {task.deadline}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {task.timeNeeded}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className={`w-2 h-2 rounded-full ${priorityDot}`} />
                          <span>{task.priority}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] border font-medium ${statusBadgeColor}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Grid: Weekly Progress & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Weekly Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Weekly Progress</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Donut Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="351.85"
                  strokeDashoffset={351.85 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-800">{completionRate}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
              </div>
            </div>

            {/* Legend Counts */}
            <div className="space-y-2 text-xs w-full max-w-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Completed</span>
                </div>
                <span className="font-bold text-slate-800">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">In Progress</span>
                </div>
                <span className="font-bold text-slate-800">{inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-slate-600">Pending</span>
                </div>
                <span className="font-bold text-slate-800">{pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600">Overdue</span>
                </div>
                <span className="font-bold text-slate-800">{overdueTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onOpenAddTask}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-2 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Add Task</span>
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/40 transition-all flex flex-col items-center justify-center gap-2 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Calendar</span>
            </button>

            <button
              onClick={() => onNavigate('study_plan')}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex flex-col items-center justify-center gap-2 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Study Plan</span>
            </button>

            <button
              onClick={onOpenFocusModal}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex flex-col items-center justify-center gap-2 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Timer className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Focus Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Widget Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">{monthName}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1 text-[11px] font-semibold text-slate-400">
              {d}
            </div>
          ))}
          {calendarDays.map((cell, idx) => {
            const isToday = cell.isCurrentMonth && cell.day === 20; // 20 highlighted in screenshot
            return (
              <div
                key={idx}
                className={`py-2 text-xs rounded-lg transition-colors flex flex-col items-center justify-center ${
                  !cell.isCurrentMonth
                    ? 'text-slate-300'
                    : isToday
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cell.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            View all
          </button>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No upcoming deadlines. Great work!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{task.title}</span>
                  <span className="text-slate-400 ml-2">({task.subject})</span>
                </div>
                <span className="font-mono text-slate-500 font-medium">{task.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Quote Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <blockquote className="text-sm sm:text-base font-medium italic text-slate-100">
            &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex].quote}&rdquo;
          </blockquote>
          <div className="text-xs text-blue-300 font-medium">
            — {MOTIVATIONAL_QUOTES[quoteIndex].author}
          </div>
          <button
            onClick={handleNextQuote}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Next quote</span>
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Activity Log</h3>
          {activityLog.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              Recent entries
            </span>
          )}
        </div>

        {activityLog.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {activityLog.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-center justify-between text-xs text-slate-600 py-1.5 border-b border-slate-50 last:border-none">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-800">{act.action}</span>
                  <span className="text-slate-500 truncate max-w-xs">&quot;{act.target}&quot;</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
