/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface TrendTimelineProps {
  points: number;
  meta: number;
}

export default function TrendTimeline({ points, meta }: TrendTimelineProps) {
  const now = new Date();
  const currentDay = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Get days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Compute percentage of month elapsed
  const monthFraction = currentDay / totalDays;
  const targetPercentage = monthFraction * 100;
  
  // Suggested points for today
  const targetPointsToday = Math.round(meta * monthFraction);
  const diffPoints = points - targetPointsToday;
  
  const actualPercentage = (points / meta) * 100;
  const isAhead = diffPoints >= 0;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#4c018c]/15 text-[#4c018c] space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#4c018c]" />
          <h3 className="text-sm font-black text-[#4c018c] uppercase tracking-wider">
            Progreso del Mes ({monthNames[month]})
          </h3>
        </div>
        <span className="text-xs bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded border border-[#4c018c]/20 font-black uppercase tracking-wider">
          Día {currentDay} / {totalDays}
        </span>
      </div>

      {/* Progress Timeline Map */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#4c018c]/90 font-black uppercase tracking-wider">
          <span>Inicio</span>
          <span>Día Objetivo ({targetPercentage.toFixed(0)}%)</span>
          <span>Fin</span>
        </div>
        
        {/* Progress tracks overlay */}
        <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-[#4c018c]/10">
          {/* Expected month elapsed marker bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[#4c018c]/20 transition-all duration-300"
            style={{ width: `${targetPercentage}%` }}
          />
          {/* Actual sale percent bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[#4c018c] transition-all duration-300 h-1 mt-0.5 ml-0.5 rounded-full"
            style={{ width: `${Math.min(actualPercentage, 100)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-[#4c018c] pt-0.5 font-black">
          <div className="flex items-center space-x-1.5">
            <div className="w-2,5 h-2,5 rounded-full bg-[#4c018c]/25" />
            <span className="text-xs text-[#4c018c]/90 font-black">Meta Sugerida</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2,5 h-2,5 rounded-full bg-[#4c018c]" />
            <span className="text-xs text-[#4c018c] font-black">Avance Actual</span>
          </div>
        </div>
      </div>

      {/* Actionable KPI */}
      <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
        isAhead 
          ? 'bg-[#4c018c]/10 border-[#4c018c]/25 text-[#4c018c]' 
          : 'bg-amber-500/10 border-amber-550/25 text-[#4c018c]'
      }`}>
        <div className="mt-0.5">
          {isAhead ? (
            <CheckCircle className="w-4 h-4 text-[#4c018c]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#4c018c]" />
          )}
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-black uppercase tracking-wider text-[#4c018c]">
            {isAhead ? 'Tendencia Favorable' : 'Tendencia Desfavorable'}
          </p>
          <p className="text-xs leading-relaxed font-semibold opacity-90 text-[#4c018c]/90">
            {isAhead ? (
              <>
                Llevas <strong>{points} pts</strong> de un objetivo esperado de <strong>{targetPointsToday} pts</strong> para hoy. ¡Vas arriba por <strong>+{diffPoints} puntos</strong>!
              </>
            ) : (
              <>
                Llevas <strong>{points} pts</strong> de un objetivo recomendado de <strong>{targetPointsToday} pts</strong> para hoy. Faltan <strong>{Math.abs(diffPoints)} puntos</strong> de ritmo para nivelar.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
