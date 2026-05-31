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
    <div className="bg-[#52336e] rounded-2xl p-5 border border-purple-400/20 text-white space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-purple-200" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            Progreso del Mes ({monthNames[month]})
          </h3>
        </div>
        <span className="text-[9px] bg-[#3c2452] text-purple-200 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wider">
          Día {currentDay} / {totalDays}
        </span>
      </div>

      {/* Progress Timeline Map */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-purple-200 font-bold uppercase tracking-wider">
          <span>Inicio</span>
          <span>Día Objetivo ({targetPercentage.toFixed(0)}%)</span>
          <span>Fin</span>
        </div>
        
        {/* Progress tracks overlay */}
        <div className="relative w-full h-2.5 bg-[#3c2452] rounded-full overflow-hidden border border-purple-500/5">
          {/* Expected month elapsed marker bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-purple-900/50 transition-all duration-300"
            style={{ width: `${targetPercentage}%` }}
          />
          {/* Actual sale percent bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-purple-400 transition-all duration-300 h-1 mt-0.5 ml-0.5 rounded-full"
            style={{ width: `${Math.min(actualPercentage, 100)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-purple-205 pt-0.5 font-bold">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-900" />
            <span className="text-[10px] text-purple-200 font-bold">Meta Sugerida</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[10px] text-white font-black">Avance Actual</span>
          </div>
        </div>
      </div>

      {/* Actionable KPI */}
      <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
        isAhead 
          ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-250' 
          : 'bg-amber-500/15 border-amber-500/25 text-amber-250'
      }`}>
        <div className="mt-0.5">
          {isAhead ? (
            <CheckCircle className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          )}
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-black uppercase tracking-wider">
            {isAhead ? 'Tendencia Favorable' : 'Tendencia Desfavorable'}
          </p>
          <p className="text-xs leading-relaxed font-semibold opacity-90 text-white">
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
