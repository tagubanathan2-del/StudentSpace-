import React from 'react';
import { Plus, BookOpen, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { StudyBlock, DayOfWeek } from '../types';
import { playChime } from '../utils/audio';

interface StudyPlanViewProps {
  blocks: StudyBlock[];
  onOpenAddBlock: (day?: DayOfWeek) => void;
  onToggleBlockComplete: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  soundEffectsEnabled: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  blocks,
  onOpenAddBlock,
  onToggleBlockComplete,
  onDeleteBlock,
  soundEffectsEnabled,
}) => {
  const totalBlocks = blocks.length;
  const completedBlocks = blocks.filter((b) => b.isCompleted).length;
  const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const handleToggle = (b: StudyBlock) => {
    if (soundEffectsEnabled && !b.isCompleted) {
      playChime();
    }
    onToggleBlockComplete(b.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <BookOpen className="w-3.5 h-3.5" />
            WEEKLY SCHEDULE & SYLLABUS
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Structured Study Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize study blocks throughout the week to prepare for assignments and exams without burnout.
          </p>
        </div>

        <button
          onClick={() => onOpenAddBlock()}
          className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Block</span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Study Blocks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            TOTAL STUDY BLOCKS
          </span>
          <div className="text-3xl font-bold text-slate-800 tracking-tight my-2">{totalBlocks}</div>
          <span className="text-xs text-slate-400">Scheduled throughout the week</span>
        </div>

        {/* Completed Blocks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            COMPLETED BLOCKS
          </span>
          <div className="text-3xl font-bold text-emerald-600 tracking-tight my-2">
            {completedBlocks}
          </div>
          <span className="text-xs text-slate-400">{completionRate}% completion rate</span>
        </div>

        {/* Study Tip Card */}
        <div className="bg-[#1e2a5e] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
            STUDY TIP OF THE WEEK
          </span>
          <p className="text-xs sm:text-sm font-medium my-2 leading-snug">
            &ldquo;Use active recall over passive reading. Test yourself before checking the answer key.&rdquo;
          </p>
          <span className="text-[11px] text-blue-300 font-medium">Cognitive Science Rule #1</span>
        </div>
      </div>

      {/* Week Grid (Monday - Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayBlocks = blocks.filter((b) => b.day === day);
          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600">📅</span>
                  <h3 className="font-bold text-sm text-slate-800">{day}</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {dayBlocks.length} {dayBlocks.length === 1 ? 'block' : 'blocks'}
                </span>
              </div>

              {dayBlocks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <p>No study sessions</p>
                  <button
                    onClick={() => onOpenAddBlock(day)}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add session</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        block.isCompleted
                          ? 'bg-emerald-50/30 border-emerald-200/70'
                          : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4
                            className={`text-xs font-bold ${
                              block.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                            }`}
                          >
                            {block.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px]">
                              {block.subject}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>
                          {block.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-1">{block.notes}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggle(block)}
                            className={`p-1 rounded-md transition-colors ${
                              block.isCompleted
                                ? 'text-emerald-600 hover:text-emerald-700'
                                : 'text-slate-300 hover:text-emerald-600'
                            }`}
                            title={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                block.isCompleted ? 'fill-emerald-500 text-white' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => onDeleteBlock(block.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                            title="Delete block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => onOpenAddBlock(day)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
