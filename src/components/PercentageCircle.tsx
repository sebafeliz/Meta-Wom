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
  let colorClass = 'bg-rose-500';
  let bgClass = 'bg-rose-500/15 text-rose-300 border-rose-500/20';
  let label = 'Crítico';
 
  if (percentage >= 100) {
    colorClass = 'bg-[#ff5cc2]';
    bgClass = 'bg-pink-500/15 text-pink-300 border-pink-500/20';
    label = 'Meta Lograda';
  } else if (percentage >= 70) {
    colorClass = 'bg-[#ff5cc2]';
    bgClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
    label = '✔ Zona de Pago';
  } else if (percentage >= 40) {
    colorClass = 'bg-amber-450';
    bgClass = 'bg-amber-500/15 text-amber-300 border-amber-500/20';
    label = 'Intermedio';
  }
 
  return (
    <div className="bg-[#52336e] p-5 rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all text-white space-y-4 shadow-lg">
      {/* Percentage and Points Info */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-3xl font-black text-white select-none tracking-tight">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] font-bold text-purple-205 block uppercase tracking-wider mt-0.5">
            Cumplimiento actual
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white bg-purple-950/20 px-2 py-0.5 rounded-md border border-purple-500/5">
            {points} <span className="text-purple-200 font-normal text-xs">/ {meta} PTS</span>
          </span>
          <span className="text-[10px] font-bold text-purple-205 block uppercase tracking-wider mt-0.5 pt-1">
            Puntos acumulados
          </span>
        </div>
      </div>
 
      {/* Horizontal Bar Track */}
      <div className="relative w-full h-2 bg-[#3c2452] rounded-full overflow-hidden border border-purple-500/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
 
      {/* Row with Label Indicator and Details */}
      <div className="flex flex-wrap gap-2 justify-between items-center text-[11px]">
        <span className={`px-2.5 py-0.5 rounded-md font-bold border ${bgClass} uppercase tracking-wider text-[10px]`}>
          {label}
        </span>
        {percentage >= 100 ? (
          <span className="font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
            ¡Objetivo superado! WOM power 🔥
          </span>
        ) : percentage >= 70 ? (
          <span className="font-bold text-[#ff85ce] bg-purple-950/40 border border-purple-500/20 px-2.5 py-0.5 rounded-md">
            Bono e Incentivo Activos
          </span>
        ) : (
          <span className="text-purple-205 font-bold">
            Faltan {Math.max(0, meta - points).toFixed(0)} PTS para meta
          </span>
        )}
      </div>
    </div>
  );
}
