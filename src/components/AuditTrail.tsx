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
    <div className="bg-white rounded-2xl p-5 border border-[#4c018c]/15 text-[#4c018c] space-y-3 shadow-lg">
      <div className="flex justify-between items-center border-b border-[#4c018c]/15 pb-2">
        <h3 className="text-xs font-bold text-[#4c018c] uppercase tracking-wider">
          Ventas Recientes ({history.length})
        </h3>
        {history.length > 0 && (
          <span className="text-[10px] text-[#4c018c]/80 font-bold uppercase">Historial</span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-[#4c018c]/70 text-xs font-semibold">
          <Clock className="w-6 h-6 mx-auto stroke-1.0 opacity-40 mb-2 text-[#4c018c]" />
          No hay registros de ventas hoy
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-[#4c018c]/5 rounded-xl border border-[#4c018c]/10 hover:border-[#4c018c]/30 transition-colors text-xs"
            >
              <div className="space-y-1 flex-1">
                {/* Time Badge */}
                <div className="flex items-center text-[9.5px] text-[#4c018c]/80 font-bold">
                  <Clock className="w-3 h-3 mr-1 opacity-80 text-[#4c018c]" />
                  {formatTime(record.timestamp)}
                </div>

                {/* Subcounts Row */}
                <div className="flex flex-wrap gap-1.5 text-[10.5px] pt-1">
                  {record.postpagoCount > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10">
                      <Smartphone className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.postpagoCount} Porta Pos
                    </span>
                  )}
                  {record.portaCount > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10">
                      <PhoneCall className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.portaCount} Porta Pre
                    </span>
                  )}
                  {(record.portaPos15990Count ?? 0) > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10 font-bold">
                      <Smartphone className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.portaPos15990Count} @15.990
                    </span>
                  )}
                  {record.portaPre8Count > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10">
                      <PhoneCall className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.portaPre8Count} Pre 8
                    </span>
                  )}
                  {record.nuevoCount > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10">
                      <Zap className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.nuevoCount} Nuevo
                    </span>
                  )}
                  {record.renovCount > 0 && (
                    <span className="bg-[#4c018c]/10 text-[#4c018c] px-2 py-0.5 rounded flex items-center border border-[#4c018c]/10">
                      <RefreshCw className="w-3 h-3 mr-1 text-[#4c018c]" />
                      {record.renovCount} Renov. {record.renovationBonusApplied ? '(Bono)' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Total points generated & Trash */}
              <div className="flex items-center space-x-3 ml-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-[#4c018c]">
                    +{record.pointsEarned}
                  </p>
                  <p className="text-[8px] text-[#4c018c]/80 uppercase tracking-widest font-black">
                    PTS
                  </p>
                </div>
                
                <button
                  onClick={() => onDeleteRecord(record.id)}
                  className="p-1.5 text-[#4c018c]/80 hover:text-red-650 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent"
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
