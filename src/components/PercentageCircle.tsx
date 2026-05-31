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
  let bgClass = 'bg-rose-50 text-rose-700 border-rose-100';
  let label = 'Crítico';

  if (percentage >= 100) {
    colorClass = 'bg-emerald-500';
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-150';
    label = 'Meta Lograda';
  } else if (percentage >= 70) {
    colorClass = 'bg-purple-600';
    bgClass = 'bg-purple-50 text-purple-700 border-purple-100';
    label = 'Zona de Pago';
  } else if (percentage >= 40) {
    colorClass = 'bg-amber-500';
    bgClass = 'bg-amber-50 text-amber-700 border-amber-150';
    label = 'Intermedio';
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200/80 transition-colors space-y-4">
      {/* Percentage and Points Info */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-3xl font-light text-slate-800 select-none tracking-tight">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider mt-0.5">
            Cumplimiento actual
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-indigo-600">
            {points} <span className="text-slate-450 font-normal text-xs">/ {meta} PTS</span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider mt-0.5">
            Puntos acumulados
          </span>
        </div>
      </div>

      {/* Horizontal Bar Track */}
      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Row with Label Indicator and Details */}
      <div className="flex flex-wrap gap-2 justify-between items-center text-[11px]">
        <span className={`px-2.5 py-0.5 rounded-md font-medium border ${bgClass} uppercase tracking-wide text-[10px]`}>
          {label}
        </span>
        {percentage >= 100 ? (
          <span className="font-medium text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded-md">
            ¡Objetivo superado!
          </span>
        ) : percentage >= 70 ? (
          <span className="font-medium text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-md">
            Zona de pago activa
          </span>
        ) : (
          <span className="text-slate-400">
            Faltan {Math.max(0, meta - points).toFixed(0)} PTS
          </span>
        )}
      </div>
    </div>
  );
}
