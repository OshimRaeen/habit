'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#27272a'];

const CustomBar = (props) => {
  const { x, y, width, height, value } = props;
  const color = value >= 80 ? '#22c55e' : value >= 50 ? '#3b82f6' : value > 0 ? '#f59e0b' : '#27272a';
  return <rect x={x} y={y} width={width} height={height} fill={color} rx={1} />;
};

export default function Charts({ dailyData, totalCompleted, totalLeft, totalPossible, monthName }) {
  const pct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: totalCompleted || 0 },
    { name: 'Left',      value: totalLeft      || 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-3">
      {/* ── Bar Chart ──────────────────────────────────── */}
      <div className="col-span-2 bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4">
        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-3">
          Daily Progress · {monthName}
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(v) => [`${v}%`, 'Completion']}
              labelFormatter={(l) => `Day ${l}`}
            />
            <Bar dataKey="pct" shape={<CustomBar />} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Pie Chart ─────────────────────────────────── */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-2">
          Overall Wellness
        </p>
        <div className="relative w-[130px] h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={42} outerRadius={60}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white leading-none">{pct}%</span>
            <span className="text-[9px] text-zinc-600 mt-0.5">done</span>
          </div>
        </div>
        <div className="mt-3 w-full space-y-1.5">
          {[
            { label: 'Completed', value: totalCompleted, color: '#3b82f6' },
            { label: 'Left',      value: totalLeft,      color: '#3f3f46' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5" style={{ color }}>
                <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </span>
              <span className="text-zinc-300 font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}