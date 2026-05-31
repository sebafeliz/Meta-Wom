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
    <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Progreso del Mes ({monthNames[month]})
          </h3>
        </div>
        <span className="text-[9px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-150 font-medium uppercase tracking-wider">
          Día {currentDay} / {totalDays}
        </span>
      </div>

      {/* Progress Timeline Map */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-slate-400 font-medium uppercase tracking-wider">
          <span>Inicio</span>
          <span>Día Objetivo ({targetPercentage.toFixed(0)}%)</span>
          <span>Fin</span>
        </div>
        
        {/* Progress tracks overlay */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          {/* Expected month elapsed marker bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-slate-200/70 transition-all duration-300"
            style={{ width: `${targetPercentage}%` }}
          />
          {/* Actual sale percent bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-indigo-600 transition-all duration-300 h-1 mt-0.5 ml-0.5 rounded-full"
            style={{ width: `${Math.min(actualPercentage, 100)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-450 pt-0.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-[10px] text-slate-400 font-medium">Meta Sugerida</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-[10px] text-slate-400 font-medium">Avance Actual</span>
          </div>
        </div>
      </div>

      {/* Actionable KPI */}
      <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
        isAhead 
          ? 'bg-emerald-50/40 border-emerald-100/60 text-emerald-800' 
          : 'bg-amber-50/40 border-amber-100/60 text-amber-800'
      }`}>
        <div className="mt-0.5">
          {isAhead ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider">
            {isAhead ? 'Tendencia Favorable' : 'Tendencia Desfavorable'}
          </p>
          <p className="text-xs leading-relaxed font-normal opacity-90">
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
