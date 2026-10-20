import React from 'react';
import { BarChart3, FileSpreadsheet, Download, Info } from 'lucide-react';
import { Task } from '../types';
import { exportCsvReport, exportJsonBackup } from '../utils/storage';

interface ReportsViewProps {
  tasks: Task[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Subject breakdown
  const subjectsMap: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    const s = t.subject || 'General';
    if (!subjectsMap[s]) {
      subjectsMap[s] = { total: 0, completed: 0 };
    }
    subjectsMap[s].total++;
    if (t.status === 'Completed') {
      subjectsMap[s].completed++;
    }
  });

  const subjectList = Object.entries(subjectsMap);

  // Priority breakdown
  const highPriority = tasks.filter((t) => t.priority === 'High');
  const highCompleted = highPriority.filter((t) => t.status === 'Completed').length;

  const medPriority = tasks.filter((t) => t.priority === 'Medium');
  const medCompleted = medPriority.filter((t) => t.status === 'Completed').length;

  const lowPriority = tasks.filter((t) => t.priority === 'Low');
  const lowCompleted = lowPriority.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <BarChart3 className="w-3.5 h-3.5" />
            ACADEMIC PERFORMANCE & VELOCITY
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Study Reports & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quantitative analysis of your completed assignments, active courses, and upcoming deadline health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportCsvReport}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJsonBackup}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL TRACKED TASKS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            TOTAL TRACKED TASKS
          </span>
          <div className="text-3xl font-bold text-slate-800 tracking-tight my-2">
            {totalTasks}
          </div>
          <span className="text-xs text-blue-600 font-medium">100% of workspace</span>
        </div>

        {/* COMPLETED OUTPUTS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            COMPLETED OUTPUTS
          </span>
          <div className="text-3xl font-bold text-emerald-600 tracking-tight my-2">
            {completedTasks}
          </div>
          <span className="text-xs text-slate-400">{completionRate}% completion velocity</span>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            IN PROGRESS
          </span>
          <div className="text-3xl font-bold text-amber-500 tracking-tight my-2">
            {inProgressTasks}
          </div>
          <span className="text-xs text-slate-400">Active focus sessions</span>
        </div>

        {/* OVERDUE ITEMS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            OVERDUE ITEMS
          </span>
          <div className="text-3xl font-bold text-rose-600 tracking-tight my-2">
            {overdueTasks}
          </div>
          <span className="text-xs text-slate-400">
            {overdueTasks === 0 ? 'Zero overdue! Perfect!' : `${overdueTasks} tasks require action`}
          </span>
        </div>
      </div>

      {/* Subject Completion Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-800">Subject Completion Breakdown</h3>
          <span className="text-xs text-slate-400">{subjectList.length} Subjects</span>
        </div>

        {subjectList.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No tasks recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {subjectList.map(([subj, data]) => {
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={subj} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{subj}</span>
                    <span className="text-slate-500 font-mono">
                      {data.completed}/{data.total} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority & Workload Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Priority & Workload Distribution</h3>

        <div className="space-y-2.5">
          {/* High Priority Row */}
          <div className="p-3.5 bg-rose-50/40 border border-rose-100/70 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="font-semibold text-rose-950">High Priority</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 block">{highPriority.length} tasks</span>
              <span className="text-[11px] text-slate-400">{highCompleted} completed</span>
            </div>
          </div>

          {/* Medium Priority Row */}
          <div className="p-3.5 bg-amber-50/40 border border-amber-100/70 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-amber-950">Medium Priority</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 block">{medPriority.length} tasks</span>
              <span className="text-[11px] text-slate-400">{medCompleted} completed</span>
            </div>
          </div>

          {/* Low Priority Row */}
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-100/70 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-950">Low Priority</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 block">{lowPriority.length} tasks</span>
              <span className="text-[11px] text-slate-400">{lowCompleted} completed</span>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            Tip: Prioritize High priority tasks at the start of your peak focus hours for maximum academic efficiency.
          </span>
        </div>
      </div>
    </div>
  );
};
