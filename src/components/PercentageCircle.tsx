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
    <div className="bg-white p-5 rounded-3xl border border-purple-100 custom-card-shadow space-y-4">
      {/* Percentage and Points Info */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-3xl font-black text-gray-800 select-none">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] font-black text-gray-450 block uppercase tracking-wider mt-0.5">
            Cumplimiento actual
          </span>
        </div>
        <div className="text-right">
          <span className="text-base font-black text-wom-purple">
            {points} <span className="text-gray-400 font-semibold text-xs">/ {meta} PTS</span>
          </span>
          <span className="text-[10px] font-black text-gray-450 block uppercase tracking-wider mt-0.5">
            Puntos acumulados
          </span>
        </div>
      </div>

      {/* Horizontal Bar Track */}
      <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-150/80 p-[3px]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end px-2 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage >= 15 && (
            <span className="text-[9px] font-black text-white leading-none">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Row with Label Indicator and Details */}
      <div className="flex justify-between items-center sm:space-x-1">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${bgClass} uppercase tracking-wide`}>
          {label}
        </span>
        {percentage >= 100 ? (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center bg-emerald-50 px-2.5 py-1 rounded-xl">
            🎉 ¡Superaste el objetivo exigido!
          </span>
        ) : percentage >= 70 ? (
          <span className="text-[10px] font-bold text-purple-600 flex items-center bg-purple-50 px-2.5 py-1 rounded-xl">
            🎯 Estás en zona de pago de comisión
          </span>
        ) : (
          <span className="text-[10px] font-medium text-gray-400">
            Faltan {Math.max(0, meta - points).toFixed(0)} PTS para la meta
          </span>
        )}
      </div>
    </div>
  );
}
