import type { ReactNode } from "react";

export default function ChartCard({ title, subtitle, data, accent }: { title: string; subtitle: string; data: number[]; accent: string; }) {
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 240 + 10;
      const y = 100 - value * 0.8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="dashboard-tile card-3d cursor-default rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="pulse-dot h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <svg viewBox="0 0 260 120" className="mt-4 h-28 w-full">
        <polyline
          points={points}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          className="chart-line"
        />
        <polyline
          points={`10,110 ${points} 250,110`}
          fill={accent}
          opacity="0.08"
        />
      </svg>
    </div>
  );
}
