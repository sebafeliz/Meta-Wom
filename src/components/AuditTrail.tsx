/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Clock, Smartphone, PhoneCall, RefreshCw, Zap } from 'lucide-react';
import { SaleRecord } from '../types';

interface AuditTrailProps {
  history: SaleRecord[];
  onDeleteRecord: (id: string) => void;
}

export default function AuditTrail({ history, onDeleteRecord }: AuditTrailProps) {
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + 
           d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Ventas Recientes ({history.length})
        </h3>
        {history.length > 0 && (
          <span className="text-[10px] text-slate-400 font-normal uppercase">Historial</span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Clock className="w-6 h-6 mx-auto stroke-1.0 opacity-40 mb-2" />
          No hay registros de ventas hoy
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-xs"
            >
              <div className="space-y-1 flex-1">
                {/* Time Badge */}
                <div className="flex items-center text-[9px] text-slate-400">
                  <Clock className="w-3 h-3 mr-1 opacity-70" />
                  {formatTime(record.timestamp)}
                </div>

                {/* Subcounts Row */}
                <div className="flex flex-wrap gap-1.5 text-[10.5px] pt-1">
                  {record.postpagoCount > 0 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center">
                      <Smartphone className="w-3 h-3 mr-1 text-slate-500" />
                      {record.postpagoCount} Porta Pos
                    </span>
                  )}
                  {record.portaCount > 0 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center">
                      <PhoneCall className="w-3 h-3 mr-1 text-slate-500" />
                      {record.portaCount} Porta Pre
                    </span>
                  )}
                  {(record.portaPos15990Count ?? 0) > 0 && (
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded flex items-center">
                      <Smartphone className="w-3 h-3 mr-1 text-emerald-650" />
                      {record.portaPos15990Count} @15.990
                    </span>
                  )}
                  {record.portaPre8Count > 0 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center">
                      <PhoneCall className="w-3 h-3 mr-1 text-slate-505" />
                      {record.portaPre8Count} Pre 8
                    </span>
                  )}
                  {record.nuevoCount > 0 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-slate-500" />
                      {record.nuevoCount} Nuevo
                    </span>
                  )}
                  {record.renovCount > 0 && (
                    <span className={`${record.renovationBonusApplied ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'} px-2 py-0.5 rounded flex items-center`}>
                      <RefreshCw className={`w-3 h-3 mr-1 text-slate-500`} />
                      {record.renovCount} Renov. {record.renovationBonusApplied ? '(Bono)' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Total points generated & Trash */}
              <div className="flex items-center space-x-3 ml-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600">
                    +{record.pointsEarned}
                  </p>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                    PTS
                  </p>
                </div>
                
                <button
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                  title="Eliminar este registro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
