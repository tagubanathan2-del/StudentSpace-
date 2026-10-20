import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onOpenAddTaskForDate: (dateStr: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onOpenAddTaskForDate,
  onEditTask,
}) => {
  // Matching October 2026 as in the screenshot
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [selectedDay, setSelectedDay] = useState<number>(20);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false, monthOffset: -1 });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
  }
  // Next month padding
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
  }

  // Format selected date YYYY-MM-DD
  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  // Tasks on selected date
  const selectedDateTasks = tasks.filter((t) => t.deadline.startsWith(selectedDateStr));

  // Upcoming deadlines in the next 30 days
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Calendar & Deadlines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View scheduled output deadlines across the entire academic month. Click any date to inspect tasks or add new ones.
        </p>
      </div>

      {/* Big Month Calendar Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">{monthName}</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-xs font-semibold text-slate-400">
              {d}
            </div>
          ))}

          {calendarDays.map((cell, idx) => {
            const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
            const dayTasks = cell.isCurrentMonth ? tasks.filter((t) => t.deadline.startsWith(dateStr)) : [];

            return (
              <button
                key={idx}
                disabled={!cell.isCurrentMonth}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    setSelectedDay(cell.day);
                  }
                }}
                className={`min-h-[52px] sm:min-h-[64px] p-2 rounded-xl transition-all flex flex-col items-center justify-between relative ${
                  !cell.isCurrentMonth
                    ? 'text-slate-300 opacity-40 cursor-default'
                    : isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md ring-2 ring-blue-600 ring-offset-2'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs sm:text-sm font-semibold">{cell.day}</span>
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-blue-500'
                      }`}
                    />
                    <span
                      className={`text-[10px] hidden sm:inline ${
                        isSelected ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {dayTasks.length}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Details Panel */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Selected: {monthName.split(' ')[0]} {selectedDay}, {year}
            </span>
            <span className="text-xs text-slate-500">
              ({selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'})
            </span>
          </div>

          <button
            onClick={() => onOpenAddTaskForDate(selectedDateStr)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task for this Day</span>
          </button>
        </div>

        {/* Tasks list on selected date */}
        {selectedDateTasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedDateTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onEditTask(t)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${t.priority === 'High' ? 'bg-red-500' : t.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">{t.title}</span>
                    <span className="text-[11px] text-slate-500 ml-2">[{t.subject}]</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono">{t.timeNeeded}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
          <span className="text-xs text-slate-400">Chronological schedule</span>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No upcoming deadlines. Great work!
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800">{task.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/70 text-slate-700 font-medium">
                      {task.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.timeNeeded}
                    </span>
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-semibold text-slate-700 block">
                    {task.deadline}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
