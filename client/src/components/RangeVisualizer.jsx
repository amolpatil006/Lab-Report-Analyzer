import React from 'react';

/**
 * Visual Range Bar indicating patient value relative to reference range (Low | Normal | High)
 */
export default function RangeVisualizer({ value, min, max, unit, status }) {
  if (min === null || min === undefined || max === null || max === undefined) {
    return (
      <div className="text-xs text-slate-500 font-mono">
        Range: {min || 0} - {max || 'N/A'} {unit}
      </div>
    );
  }

  // Calculate percentage position of the value on a bar spanning [min - margin, max + margin]
  const spread = max - min;
  const padding = spread * 0.4 || 10;
  const scaleMin = Math.max(0, min - padding);
  const scaleMax = max + padding;
  const totalScale = scaleMax - scaleMin;

  const normalStartPct = Math.max(0, Math.min(100, ((min - scaleMin) / totalScale) * 100));
  const normalEndPct = Math.max(0, Math.min(100, ((max - scaleMin) / totalScale) * 100));
  const normalWidthPct = normalEndPct - normalStartPct;

  const valuePct = Math.max(2, Math.min(98, ((value - scaleMin) / totalScale) * 100));

  let markerColor = 'bg-emerald-600 border-emerald-200';
  let badgeText = 'Normal';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (status === 'BELOW_NORMAL') {
    markerColor = 'bg-sky-600 border-sky-200';
    badgeText = 'Low';
    badgeColor = 'text-sky-700 bg-sky-50 border-sky-200';
  } else if (status === 'ABOVE_NORMAL') {
    markerColor = 'bg-rose-600 border-rose-200';
    badgeText = 'High';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return (
    <div className="w-full">
      {/* Visual track */}
      <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden flex my-2">
        {/* Low segment */}
        <div style={{ width: `${normalStartPct}%` }} className="bg-sky-200 h-full" title="Below Normal" />
        {/* Normal segment */}
        <div style={{ width: `${normalWidthPct}%` }} className="bg-emerald-300 h-full" title="Normal Range" />
        {/* High segment */}
        <div style={{ width: `${100 - normalEndPct}%` }} className="bg-rose-200 h-full" title="Above Normal" />

        {/* Marker pointer */}
        <div
          className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full border-2 ${markerColor} shadow-md transition-all duration-500`}
          style={{ left: `${valuePct}%` }}
        />
      </div>

      {/* Axis range labels */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
        <span>Min: {min}</span>
        <span className="font-semibold text-slate-700">Ref: {min} – {max} {unit}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}
