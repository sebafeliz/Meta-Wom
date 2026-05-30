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
    <div className="bg-white rounded-3xl p-5 border border-purple-50 custom-card-shadow space-y-3">
      <div className="flex justify-between items-center border-b border-purple-50 pb-2">
        <h3 className="text-xs font-bold text-wom-purple uppercase tracking-wider">
          Bitácora de Ventas Recientes ({history.length})
        </h3>
        {history.length > 0 && (
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Desliza para ver más</span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-xs">
          <Clock className="w-8 h-8 mx-auto stroke-1.5 opacity-40 mb-2 text-purple-300" />
          No tienes ventas registradas aún hoy.<br />Ingresa tus números arriba y presiona Registrar.
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all text-xs"
            >
              <div className="space-y-1.5 flex-1">
                {/* Time Badge */}
                <div className="flex items-center text-[10px] font-semibold text-gray-400">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {formatTime(record.timestamp)}
                </div>

                {/* Subcounts Row */}
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {record.postpagoCount > 0 && (
                    <span className="bg-purple-100 text-wom-purple font-semibold px-2 py-0.5 rounded-lg flex items-center">
                      <Smartphone className="w-3 h-3 mr-1 text-wom-magenta" />
                      {record.postpagoCount} Porta Pos
                    </span>
                  )}
                  {record.portaCount > 0 && (
                    <span className="bg-purple-100 text-wom-purple font-semibold px-2 py-0.5 rounded-lg flex items-center">
                      <PhoneCall className="w-3 h-3 mr-1 text-purple-600" />
                      {record.portaCount} Porta Pre
                    </span>
                  )}
                  {(record.portaPos15990Count ?? 0) > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-lg flex items-center">
                      <Smartphone className="w-3 h-3 mr-1 text-emerald-600" />
                      {record.portaPos15990Count} Porta Pos 15.990
                    </span>
                  )}
                  {record.portaPre8Count > 0 && (
                    <span className="bg-purple-100 text-wom-purple font-semibold px-2 py-0.5 rounded-lg flex items-center">
                      <PhoneCall className="w-3 h-3 mr-1 text-indigo-500" />
                      {record.portaPre8Count} Porta Pre 8
                    </span>
                  )}
                  {record.nuevoCount > 0 && (
                    <span className="bg-purple-100 text-wom-purple font-semibold px-2 py-0.5 rounded-lg flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-blue-500" />
                      {record.nuevoCount} Plan Nvo
                    </span>
                  )}
                  {record.renovCount > 0 && (
                    <span className={`${record.renovationBonusApplied ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-wom-purple'} font-semibold px-2 py-0.5 rounded-lg flex items-center`}>
                      <RefreshCw className={`w-3 h-3 mr-1 ${record.renovationBonusApplied ? 'text-amber-600 animate-spin-slow' : 'text-emerald-500'}`} />
                      {record.renovCount} Renov. {record.renovationBonusApplied ? '(5 Pts)' : '(3 Pts)'}
                    </span>
                  )}
                </div>
              </div>

              {/* Total points generated & Trash */}
              <div className="flex items-center space-x-3 ml-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-wom-purple">
                    +{record.pointsEarned}
                  </p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                    PTS
                  </p>
                </div>
                
                <button
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-2 bg-white text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 hover:scale-105"
                  title="Eliminar este registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
