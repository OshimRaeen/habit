'use client';

export default function AnalysisTable({ data }) {
  return (
    <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-3 min-w-[220px]">
      <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-3">
        Analysis
      </p>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-zinc-800">
            {['Goal', 'Done', 'Left', 'Progress'].map((h) => (
              <th key={h} className="pb-2 text-center text-zinc-600 font-semibold last:text-left last:pl-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(({ habit, goal, actual, left, pct }) => (
            <tr key={habit._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
              <td className="py-1.5 text-center text-zinc-500 tabular-nums">{goal}</td>
              <td className="py-1.5 text-center text-white font-bold tabular-nums">{actual}</td>
              <td className="py-1.5 text-center text-zinc-500 tabular-nums">{left}</td>
              <td className="py-1.5 pl-1">
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#f59e0b',
                      }}
                    />
                  </div>
                  <span className="text-zinc-600 tabular-nums w-6 text-right">{pct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}