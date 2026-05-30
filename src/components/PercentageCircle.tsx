/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PercentageCircleProps {
  percentage: number;
  points: number;
  meta: number;
}

export default function PercentageCircle({ percentage, points, meta }: PercentageCircleProps) {
  // Cap at 160% visually for the progress ring but display actual percentage in text
  const cappedPct = Math.min(percentage, 160);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Express 0 to 160% as progress along the circle
  const strokeDashoffset = circumference - (Math.min(cappedPct, 160) / 160) * circumference;

  let colorClass = 'stroke-rose-500';
  let bgClass = 'bg-rose-50 text-rose-700 border-rose-100';
  let label = 'Crítico';

  if (percentage >= 100) {
    colorClass = 'stroke-emerald-500';
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    label = 'Meta Lograda';
  } else if (percentage >= 70) {
    colorClass = 'stroke-indigo-600';
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-100';
    label = 'Zona de Pago';
  } else if (percentage >= 40) {
    colorClass = 'stroke-amber-500';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Intermedio';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Base circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-gray-100 fill-none"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`fill-none transition-all duration-700 ease-out ${colorClass}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Content in the center */}
        <div className="absolute text-center">
          <span className="block text-3xl font-black tracking-tight text-gray-800">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {points} / {meta} Pts
          </span>
        </div>
      </div>

      <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${bgClass} uppercase tracking-wider text-center`}>
        {label}
      </div>
    </div>
  );
}
