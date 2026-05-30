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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Progreso del Mes ({monthNames[month]})
          </h3>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
          Día {currentDay} / {totalDays}
        </span>
      </div>

      {/* Progress Timeline Map */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
          <span>Inicio Mes</span>
          <span>Día Objetivo ({targetPercentage.toFixed(0)}%)</span>
          <span>Fin Mes</span>
        </div>
        
        {/* Progress tracks overlay */}
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          {/* Expected month elapsed marker bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-indigo-100 transition-all duration-300"
            style={{ width: `${targetPercentage}%` }}
          />
          {/* Actual sale percent bar */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-indigo-600 transition-all duration-300 h-1.5 mt-0.5 ml-0.5 rounded-full"
            style={{ width: `${Math.min(actualPercentage, 100)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-100" />
            <span className="text-gray-500 text-[10px] font-medium">Meta Sugerida</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-gray-500 text-[10px] font-medium">Mi Avance Actual</span>
          </div>
        </div>
      </div>

      {/* Actionable KPI */}
      <div className={`p-4 rounded-2xl flex items-start space-x-3 border ${
        isAhead 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="mt-0.5">
          {isAhead ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide">
            {isAhead ? 'Vas con adelanto 🎉' : 'Vas rezagado ⚠️'}
          </p>
          <p className="text-xs leading-relaxed opacity-90">
            {isAhead ? (
              <>
                Llevas <strong>{points} pts</strong>. Tu objetivo para hoy era <strong>{targetPointsToday} pts</strong>. ¡Estás arriba por <strong className="font-extrabold">+{diffPoints} puntos</strong> de la tendencia de cierre!
              </>
            ) : (
              <>
                Llevas <strong>{points} pts</strong> de un objetivo recomendado de <strong>{targetPointsToday} pts</strong> para hoy. Te faltan <strong className="font-extrabold">{Math.abs(diffPoints)} puntos</strong> de ritmo para nivelar con la meta ideal.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
