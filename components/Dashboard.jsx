'use client';

import { useState, useEffect, useCallback } from 'react';
import Charts      from './Charts';
import HabitGrid   from './HabitGrid';
import AnalysisTable from './AnalysisTable';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS = Array.from({ length: 6 }, (_, i) => 2023 + i);

export default function Dashboard() {
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [habits,  setHabits]  = useState([]);
  const [logs,    setLogs]    = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready,   setReady]   = useState(false);

 // ✅ REPLACE WITH THIS
useEffect(() => {
  (async () => {
    const res  = await fetch('/api/habits');
    const data = await res.json();
    setHabits(data.habits || []);
    setReady(true);
  })();
}, []);

  // ── Month data fetch ───────────────────────────────────────
  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, mRes] = await Promise.all([
        fetch(`/api/logs?year=${year}&month=${month}`),
        fetch(`/api/metrics?year=${year}&month=${month}`),
      ]);
      const lData = await lRes.json();
      const mData = await mRes.json();
      setLogs(   lData.logs    || []);
      setMetrics(mData.metrics || []);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (ready) fetchMonth();
  }, [ready, fetchMonth]);

  // ── Helpers ────────────────────────────────────────────────
  const daysInMonth  = new Date(year, month, 0).getDate();
  const getDateString = (day) =>
    `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  const isCompleted = (habitId, day) => {
    const date = getDateString(day);
    const log  = logs.find((l) => String(l.habitId) === String(habitId) && l.date === date);
    return log?.completed ?? false;
  };

  const getDayMetrics = (day) => {
    const date = getDateString(day);
    return metrics.find((m) => m.date === date) || { mood: '', hoursOfSleep: null };
  };

  // ── Actions ────────────────────────────────────────────────
  const toggleLog = async (habitId, date) => {
    // Optimistic update
    setLogs((prev) => {
      const idx = prev.findIndex(
        (l) => String(l.habitId) === String(habitId) && l.date === date
      );
      if (idx !== -1) {
        const copy    = [...prev];
        copy[idx]     = { ...copy[idx], completed: !copy[idx].completed };
        return copy;
      }
      return [...prev, { habitId, date, completed: true, _id: `tmp-${habitId}-${date}` }];
    });

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date }),
      });
    } catch {
      fetchMonth(); // revert on error
    }
  };

  const updateMetrics = async (date, field, value) => {
    setMetrics((prev) => {
      const idx = prev.findIndex((m) => m.date === date);
      if (idx !== -1) {
        const copy  = [...prev];
        copy[idx]   = { ...copy[idx], [field]: value };
        return copy;
      }
      return [...prev, { date, [field]: value }];
    });

    await fetch('/api/metrics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, field, value }),
    });
  };

  const addHabit = async (name, icon) => {
    const res  = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon }),
    });
    const data = await res.json();
    if (data.habit) setHabits((prev) => [...prev, data.habit]);
  };

  const deleteHabit = async (id) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
    setLogs((prev)   => prev.filter((l) => String(l.habitId) !== String(id)));
    await fetch(`/api/habits/${id}`, { method: 'DELETE' });
  };

  const renameHabit = async (id, name) => {
    setHabits((prev) => prev.map((h) => h._id === id ? { ...h, name } : h));
    await fetch(`/api/habits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  };

  // ── Derived chart/analysis data ────────────────────────────
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day  = i + 1;
    const done = habits.filter((h) => isCompleted(h._id, day)).length;
    return { day, pct: habits.length > 0 ? Math.round((done / habits.length) * 100) : 0 };
  });

  const totalCompleted = logs.filter((l) => l.completed).length;
  const totalPossible  = habits.length * daysInMonth;
  const totalLeft      = Math.max(0, totalPossible - totalCompleted);

  const analysisData = habits.map((habit) => {
    const actual = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      .filter((d) => isCompleted(habit._id, d)).length;
    return {
      habit,
      goal:   daysInMonth,
      actual,
      left:   daysInMonth - actual,
      pct:    Math.round((actual / daysInMonth) * 100),
    };
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] p-4 font-mono">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-[0.3em] text-zinc-100 uppercase">
            Habit Tracker
          </h1>
          <p className="text-[10px] text-zinc-600 tracking-widest mt-0.5">
            {MONTHS[month - 1]} · {year} · {habits.length} habits
          </p>
        </div>

        {/* Calendar Settings */}
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            Calendar Settings
          </span>
          <div className="w-px h-4 bg-zinc-800" />
          <label className="flex items-center gap-2 text-[10px] text-zinc-500">
            Year
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-zinc-800 text-zinc-200 text-[11px] px-2 py-1 rounded border border-zinc-700 outline-none focus:border-blue-600 cursor-pointer"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[10px] text-zinc-500">
            Month
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-zinc-800 text-zinc-200 text-[11px] px-2 py-1 rounded border border-zinc-700 outline-none focus:border-blue-600 cursor-pointer"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* ── Loading State ───────────────────────────────────── */}
      {loading && !ready ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-600 text-xs tracking-widest animate-pulse">CONNECTING TO DATABASE…</div>
        </div>
      ) : (
        <>
          {/* ── Charts ──────────────────────────────────────── */}
          <Charts
            dailyData={dailyData}
            totalCompleted={totalCompleted}
            totalLeft={totalLeft}
            totalPossible={totalPossible}
            monthName={MONTHS[month - 1]}
          />

          {/* ── Grid + Analysis ─────────────────────────────── */}
          <div className="flex gap-3 items-start">
            <div className="flex-1 min-w-0 overflow-hidden">
              {loading ? (
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-zinc-700 text-xs animate-pulse">Loading month data…</span>
                </div>
              ) : (
                <HabitGrid
                  habits={habits}
                  year={year}
                  month={month}
                  daysInMonth={daysInMonth}
                  isCompleted={isCompleted}
                  getDayMetrics={getDayMetrics}
                  onToggle={toggleLog}
                  onUpdateMetrics={updateMetrics}
                  getDateString={getDateString}
                  onAddHabit={addHabit}
                  onDeleteHabit={deleteHabit}
                  onRenameHabit={renameHabit}
                />
              )}
            </div>
            <div className="shrink-0 w-[230px]">
              <AnalysisTable data={analysisData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}