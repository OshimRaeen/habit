'use client';

import { useState, useRef } from 'react';
import { Plus, X, Check, Pencil } from 'lucide-react';

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MOODS    = ['', '😄', '😊', '😐', '😔', '😢', '😤', '🤩'];

export default function HabitGrid({
  habits, year, month, daysInMonth,
  isCompleted, getDayMetrics,
  onToggle, onUpdateMetrics, getDateString,
  onAddHabit, onDeleteHabit, onRenameHabit,
}) {
  const [addMode, setAddMode]     = useState(false);
  const [newName, setNewName]     = useState('');
  const [newIcon, setNewIcon]     = useState('✅');
  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState('');
  const addInputRef = useRef(null);

  // Build ordered days array
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month - 1, i + 1);
    return { day: i + 1, dow: d.getDay() };
  });

  // Group by calendar week (chunks of 7 starting from day 1)
  const weekGroups = [];
  for (let i = 0; i < days.length; i += 7) {
    weekGroups.push(days.slice(i, i + 7));
  }

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day;

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAddHabit(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('✅');
    setAddMode(false);
  };

  const handleRenameSubmit = async (id) => {
    if (!editName.trim()) return;
    await onRenameHabit(id, editName.trim());
    setEditId(null);
    setEditName('');
  };

  return (
    <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="border-collapse text-[10px] font-mono w-full" style={{ minWidth: `${180 + daysInMonth * 30}px` }}>
          <thead>
            {/* ── Week headers ──────────────────────────────── */}
            <tr>
              <th className="sticky left-0 z-20 bg-[#111111] border-b border-r border-zinc-800 px-3 py-2 text-left">
                <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase">My Habits</span>
              </th>
              {weekGroups.map((group, wi) => (
                <th
                  key={wi}
                  colSpan={group.length}
                  className="border-b border-r border-zinc-800 py-2 text-center text-zinc-500 font-bold tracking-widest uppercase"
                >
                  Week {wi + 1}
                </th>
              ))}
            </tr>

            {/* ── Day name + date ───────────────────────────── */}
            <tr>
              <th className="sticky left-0 z-20 bg-[#111111] border-b border-r border-zinc-800" />
              {days.map(({ day, dow }) => (
                <th
                  key={day}
                  className={`border-b border-zinc-800 text-center py-1 w-[30px] min-w-[30px] ${
                    isToday(day) ? 'bg-blue-950/60' : ''
                  } ${day % 7 === 0 || (day - 1) % 7 === 6 ? 'border-r border-zinc-700' : ''}`}
                >
                  <div className={`text-[9px] ${isToday(day) ? 'text-blue-400' : 'text-zinc-600'}`}>
                    {DAY_ABBR[dow]}
                  </div>
                  <div className={`font-bold ${isToday(day) ? 'text-blue-300' : 'text-zinc-400'}`}>
                    {day}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {habits.map((habit) => (
              <tr key={habit._id} className="group border-b border-zinc-800/60 hover:bg-zinc-800/20">
                {/* Habit label */}
                <td className="sticky left-0 z-10 bg-[#1a1a1a] group-hover:bg-[#1f1f1f] border-r border-zinc-800 px-2 py-1 min-w-[180px] max-w-[180px]">
                  {editId === habit._id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(habit._id);
                          if (e.key === 'Escape') setEditId(null);
                        }}
                        className="flex-1 bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded border border-blue-600 outline-none"
                      />
                      <button onClick={() => handleRenameSubmit(habit._id)} className="text-green-400">
                        <Check size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-zinc-300 text-[11px] truncate flex items-center gap-1">
                        <span className="text-sm">{habit.icon}</span>
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditId(habit._id); setEditName(habit.name); }}
                          className="text-zinc-500 hover:text-blue-400 p-0.5"
                        >
                          <Pencil size={9} />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit._id)}
                          className="text-zinc-500 hover:text-red-400 p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </td>

                {/* Checkboxes */}
                {days.map(({ day }) => {
                  const done = isCompleted(habit._id, day);
                  return (
                    <td
                      key={day}
                      className={`text-center p-0.5 ${
                        day % 7 === 0 || (day - 1) % 7 === 6 ? 'border-r border-zinc-700/40' : ''
                      } ${isToday(day) ? 'bg-blue-950/20' : ''}`}
                    >
                      <button
                        onClick={() => onToggle(habit._id, getDateString(day))}
                        className={`w-5 h-5 rounded-[3px] border flex items-center justify-center mx-auto transition-all duration-100 ${
                          done
                            ? 'bg-blue-500 border-blue-600 shadow-[0_0_6px_rgba(59,130,246,0.4)]'
                            : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:bg-zinc-700'
                        }`}
                      >
                        {done && <Check size={10} strokeWidth={3} className="text-white" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* ── Add Habit Row ─────────────────────────────── */}
            <tr className="border-b border-zinc-800">
              <td className="sticky left-0 z-10 bg-[#1a1a1a] border-r border-zinc-800 px-2 py-1" colSpan={1}>
                {addMode ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Icon"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-8 bg-zinc-800 text-center text-sm rounded border border-zinc-700 outline-none px-0.5 py-0.5"
                    />
                    <input
                      ref={addInputRef}
                      autoFocus
                      type="text"
                      placeholder="New habit name..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') setAddMode(false);
                      }}
                      className="flex-1 bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded border border-blue-600 outline-none"
                    />
                    <button onClick={handleAdd} className="text-green-400 hover:text-green-300 p-0.5"><Check size={11} /></button>
                    <button onClick={() => setAddMode(false)} className="text-red-400 hover:text-red-300 p-0.5"><X size={11} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddMode(true)}
                    className="flex items-center gap-1 text-zinc-600 hover:text-blue-400 transition-colors"
                  >
                    <Plus size={11} />
                    <span className="text-[10px]">Add Habit</span>
                  </button>
                )}
              </td>
              <td colSpan={daysInMonth} />
            </tr>

            {/* ── Mood Row ─────────────────────────────────── */}
            <tr className="border-b border-zinc-800 bg-zinc-900/40">
              <td className="sticky left-0 z-10 bg-[#141414] border-r border-zinc-800 px-3 py-1.5 text-zinc-500 font-bold tracking-widest uppercase text-[9px]">
                Mood
              </td>
              {days.map(({ day }) => {
                const m = getDayMetrics(day);
                const moods = MOODS;
                const cur   = m.mood || '';
                const curIdx = moods.indexOf(cur);
                const cycle  = () => {
                  const next = moods[(curIdx + 1) % moods.length];
                  onUpdateMetrics(getDateString(day), 'mood', next);
                };
                return (
                  <td key={day} className="text-center p-0.5">
                    <button
                      onClick={cycle}
                      title={cur || 'Click to set mood'}
                      className="w-5 h-5 flex items-center justify-center mx-auto text-sm hover:scale-125 transition-transform"
                    >
                      {cur || <span className="text-zinc-700 text-[10px]">·</span>}
                    </button>
                  </td>
                );
              })}
            </tr>

            {/* ── Hours of Sleep Row ───────────────────────── */}
            <tr className="bg-zinc-900/40">
              <td className="sticky left-0 z-10 bg-[#141414] border-r border-zinc-800 px-3 py-1.5 text-zinc-500 font-bold tracking-widest uppercase text-[9px]">
                Hrs Sleep
              </td>
              {days.map(({ day }) => {
                const m = getDayMetrics(day);
                return (
                  <td key={day} className="text-center p-0.5">
                    <input
                      type="number"
                      min="0" max="24" step="0.5"
                      value={m.hoursOfSleep ?? ''}
                      onChange={(e) =>
                        onUpdateMetrics(
                          getDateString(day),
                          'hoursOfSleep',
                          e.target.value === '' ? null : Number(e.target.value)
                        )
                      }
                      placeholder="·"
                      className="w-5 h-5 bg-transparent text-center text-[10px] text-zinc-400 outline-none placeholder-zinc-700 hover:bg-zinc-800 focus:bg-zinc-700 rounded transition-colors"
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}