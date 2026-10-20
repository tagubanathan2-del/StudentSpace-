import React, { useState } from 'react';
import { Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { playChime } from '../utils/audio';

interface TasksViewProps {
  tasks: Task[];
  searchTerm: string;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskDone: (task: Task) => void;
  soundEffectsEnabled: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  searchTerm,
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskDone,
  soundEffectsEnabled,
}) => {
  const [filter, setFilter] = useState<'All' | TaskStatus>('All');

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filter === 'All' ? true : t.status === filter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.deadline.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCheckboxClick = (task: Task) => {
    if (soundEffectsEnabled && task.status !== 'Completed') {
      playChime();
    }
    onToggleTaskDone(task);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          My Tasks & Assignments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Comprehensive list of all course outputs
        </p>
      </div>

      {/* Main Table Card */}
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
    </div>
  );
};
