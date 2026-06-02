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
  const colorClass = 'bg-[#4c018c]';
  const bgClass = 'bg-[#4c018c]/10 text-[#4c018c] border-[#4c018c]/20';
  let label = 'Crítico';
 
  if (percentage >= 100) {
    label = 'Meta Lograda';
  } else if (percentage >= 70) {
    label = '✔ Zona de Pago';
  } else if (percentage >= 40) {
    label = 'Intermedio';
  }
 
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#4c018c]/15 hover:border-[#4c018c]/30 transition-all text-[#4c018c] space-y-4 shadow-lg">
      {/* Percentage and Points Info */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-4xl font-black text-[#4c018c] select-none tracking-tight">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[14px] font-black text-[#4c018c]/90 block uppercase tracking-wider mt-0.5">
            Cumplimiento actual
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-[#4c018c] bg-[#4c018c]/10 px-2.5 py-0.5 rounded-md border border-[#4c018c]/20">
            {points} <span className="text-[#4c018c]/85 font-black text-xs font-mono">/ {meta} PTS</span>
          </span>
          <span className="text-[14px] font-black text-[#4c018c]/90 block uppercase tracking-wider mt-0.5 pt-1">
            Puntos acumulados
          </span>
        </div>
      </div>
 
      {/* Horizontal Bar Track */}
      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-[#4c018c]/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
 
      {/* Row with Label Indicator and Details */}
      <div className="flex flex-wrap gap-2 justify-between items-center text-sm">
        <span className={`px-2.5 py-0.5 rounded-md font-black border ${bgClass} uppercase tracking-wider text-xs`}>
          {label}
        </span>
        {percentage >= 100 ? (
          <span className="font-extrabold text-[#4c018c] bg-[#4c018c]/10 border border-[#4c018c]/20 px-2.5 py-0.5 rounded-md">
            ¡Objetivo superado! 🔥
          </span>
        ) : percentage >= 70 ? (
          <span className="font-extrabold text-[#4c018c] bg-[#4c018c]/10 border border-[#4c018c]/20 px-2.5 py-0.5 rounded-md">
            Bono e Incentivo Activos
          </span>
        ) : (
          <span className="text-[#4c018c] font-extrabold">
            Faltan {Math.max(0, meta - points).toFixed(0)} PTS para meta
          </span>
        )}
      </div>
    </div>
  );
}
