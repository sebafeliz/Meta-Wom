/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Info, 
  Search, 
  Calculator, 
  Percent, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import { MonthlyHistoryRecord } from '../types';
import { Calendar, Trash2, Save, CheckCircle2 } from 'lucide-react';

interface CommissionSimulatorProps {
  currentPercentage: number;
  prepagoPercentage: number;
  currentUser?: string | null;
  totals?: {
    postpago: number;
    porta_pos_15990: number;
    porta: number;
    portaPre8: number;
    nuevo: number;
    renov: number;
    points: number;
    isBonusActive?: boolean;
  };
  prepagosTotals?: {
    activos: number;
    cargados: number;
    points: number;
  };
  metaObjective?: number;
  metaPrepagoObjective?: number;
  currentMonth?: string;
  setCurrentMonth?: (m: string) => void;
  monthlyHistory?: MonthlyHistoryRecord[];
  onSaveMonthlyHistory?: (rec: MonthlyHistoryRecord) => void;
  onDeleteMonthlyHistory?: (id: string) => void;
}

// Generate the official annex commission table rows from 70% to 160%
interface CommissionRow {
  pct: number;
  postpago: number;
  prepago: number;
  total: number;
}

export default function CommissionSimulator({ 
  currentPercentage, 
  prepagoPercentage,
  currentUser,
  totals,
  prepagosTotals,
  metaObjective = 200,
  metaPrepagoObjective = 40,
  currentMonth = 'Mayo 2026',
  setCurrentMonth,
  monthlyHistory = [],
  onSaveMonthlyHistory,
  onDeleteMonthlyHistory
}: CommissionSimulatorProps) {
  // Simulator states
  const roundedCurrent = Math.max(0, Math.round(currentPercentage));
  const [simulatedPct, setSimulatedPct] = useState<number>(
    Math.max(70, Math.min(roundedCurrent || 100, 160))
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Tab within the reference section
  // 'all' | 'postpago' | 'prepago' | 'total'
  const [activeTableTab, setActiveTableTab] = useState<'all' | 'postpago' | 'prepago' | 'total'>('all');

  // Math-based generator matching the exact official image tables
  const officialData: CommissionRow[] = useMemo(() => {
    const list: CommissionRow[] = [];
    for (let p = 70; p <= 160; p++) {
      const post = Math.round(77000 + (p - 70) * (77000 / 30));
      const pre = Math.round(33000 + (p - 70) * 1100);
      list.push({
        pct: p,
        postpago: post,
        prepago: pre,
        total: post + pre,
      });
    }
    return list;
  }, []);

  // Compute commissions for any percentage
  const calculateCommissions = (pct: number) => {
    const rounded = Math.round(pct);
    if (rounded < 70) {
      return { postpago: 0, prepago: 0, total: 0 };
    }
    if (rounded > 160) {
      // Hold constant at the 160% cap
      const post = Math.round(77000 + (160 - 70) * (77000 / 30));
      const pre = Math.round(33000 + (160 - 70) * 1100);
      return { postpago: post, prepago: pre, total: post + pre };
    }
    const post = Math.round(77000 + (rounded - 70) * (77000 / 30));
    const pre = Math.round(33000 + (rounded - 70) * 1100);
    return { postpago: post, prepago: pre, total: post + pre };
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Real Postpago and Prepago commissions calculated individually on their real respective fulfillments
  const realPostpagoComm = calculateCommissions(currentPercentage).postpago;
  const realPrepagoComm = calculateCommissions(prepagoPercentage).prepago;
  const realTotalComm = realPostpagoComm + realPrepagoComm;

  // Commissions based on simulated percentage for the interactive slider tool
  const simComm = calculateCommissions(simulatedPct);

  // Filtered official table data based on user search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return officialData;
    const term = searchTerm.trim().toLowerCase();
    return officialData.filter(row => {
      // Can search by percentage or matches commission values
      return (
        row.pct.toString().includes(term) ||
        row.postpago.toString().includes(term) ||
        row.prepago.toString().includes(term) ||
        row.total.toString().includes(term)
      );
    });
  }, [officialData, searchTerm]);

  // Find user's closest matching row index to highlight
  const closestPctRow = useMemo(() => {
    const currentRounded = Math.round(currentPercentage);
    if (currentRounded < 70) return null;
    return Math.min(160, Math.max(70, currentRounded));
  }, [currentPercentage]);

  // Handle Exporting details to a polished corporate PDF document using jsPDF
  const handleExportPDF = () => {
    return;
    /*
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // 1. HEADER SECTION (Corporate Look)
      doc.setFillColor(45, 18, 77); // WOM Purple
      doc.rect(0, 0, 210, 42, 'F');

      // Decorative Magenta accents
      doc.setFillColor(226, 0, 116); // WOM Magenta
      doc.rect(15, 12, 40, 12, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("META WOM", 22, 20);

      // Main Title
      doc.setFontSize(16);
      doc.text("REPORTE OFICIAL DE COMISIONES", 65, 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(215, 195, 245);
      doc.text("Control Comercial y Cumplimiento Mensual • Progestión Chile", 65, 28);

      // 2. METADATA CARDS
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(15, 50, 180, 32, 4, 4, 'F');

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 27, 36);
      doc.setFontSize(10.5);
      doc.text(`Asesor Comercial:`, 22, 58);
      doc.setFont("helvetica", "normal");
      
      const rawUser = currentUser || 'Asesor';
      const formattedUser = rawUser
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      doc.text(formattedUser, 60, 58);

      doc.setFont("helvetica", "bold");
      doc.text(`Mes de Reporte:`, 22, 66);
      doc.setFont("helvetica", "normal");
      doc.text(currentMonth, 60, 66);

      doc.setFont("helvetica", "bold");
      doc.text(`Fecha de Emisión:`, 22, 74);
      doc.setFont("helvetica", "normal");
      const emissionDate = new Date().toLocaleString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`${emissionDate} (Santiago, Chile)`, 60, 74);

      // 3. COMISIONES ALCANZADAS
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 18, 77);
      doc.setFontSize(12);
      doc.text("1. RESUMEN DE COMISIÓN REAL ALCANZADA", 15, 93);

      // Card 1: POSTPAGO
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(15, 98, 56, 38, 3, 3, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      doc.text("COMISIÓN POSTPAGO", 18, 106);
      doc.setFontSize(13);
      doc.setTextColor(45, 18, 77);
      doc.text(`${formatCLP(realPostpagoComm)}`, 18, 117);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Cumplimiento: ${currentPercentage.toFixed(1)}%`, 18, 126);
      doc.setFont("helvetica", "bold");
      if (currentPercentage >= 70) {
        doc.setTextColor(16, 185, 129); // emerald Green
        doc.text("ACTIVADO (70%+)", 18, 131);
      } else {
        doc.setTextColor(239, 68, 68); // red
        doc.text("NO ALCANZADO (<70%)", 18, 131);
      }

      // Card 2: PREPAGO
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(77, 98, 56, 38, 3, 3, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      doc.text("COMISIÓN PREPAGO", 80, 106);
      doc.setFontSize(13);
      doc.setTextColor(226, 0, 116);
      doc.text(`${formatCLP(realPrepagoComm)}`, 80, 117);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Cumplimiento: ${prepagoPercentage.toFixed(1)}%`, 80, 126);
      doc.setFont("helvetica", "bold");
      if (prepagoPercentage >= 70) {
        doc.setTextColor(16, 185, 129); // emerald Green
        doc.text("ACTIVADO (70%+)", 80, 131);
      } else {
        doc.setTextColor(239, 68, 68); // red
        doc.text("NO ALCANZADO (<70%)", 80, 131);
      }

      // Card 3: SUMATORIA TOTAL
      doc.setFillColor(226, 0, 116); // WOM Magenta
      doc.roundedRect(139, 98, 56, 38, 3, 3, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("COMISIÓN SUMATORIA", 142, 106);
      doc.setFontSize(14);
      doc.text(`${formatCLP(realTotalComm)}`, 142, 117);
      doc.setFontSize(8);
      doc.setTextColor(255, 240, 245);
      doc.text("Suma de ambos montos", 142, 126);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(253, 224, 71); // yellow-300
      doc.text("BONOS ACUMULADOS", 142, 131);

      // 4. DETALLE DE VENTAS REGISTRADAS
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 18, 77);
      doc.setFontSize(12);
      doc.text("2. DETALLE DE TRABAJO Y VENTAS REGISTRADAS EL MES", 15, 150);

      // Table Header Row
      doc.setFillColor(45, 18, 77);
      doc.rect(15, 156, 180, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("CONCEPTO / PRODUCTO REGISTRADO", 20, 161.5);
      doc.text("CANTIDAD", 125, 161.5);
      doc.text("PUNTOS GENERADOS", 158, 161.5);

      let cy = 171;
      const checkPageOverflow = (neededHeight: number) => {
        if (cy + neededHeight > 275) {
          doc.addPage();
          cy = 25;
          return true;
        }
        return false;
      };

      const addRow = (label: string, count: number, points: string) => {
        checkPageOverflow(8.5);
        doc.setFillColor(cy % 16 === 11 ? 255 : 246, 247, 249);
        doc.rect(15, cy - 5, 180, 8.5, 'F');
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 45);
        doc.text(label, 20, cy);
        doc.text(String(count), 127, cy);
        doc.text(points, 160, cy);

        doc.setDrawColor(229, 231, 235);
        doc.line(15, cy + 3.5, 195, cy + 3.5);
        cy += 8.5;
      };

      if (totals) {
        addRow("Portabilidad Postpago Comercial (16 Pts)", totals.postpago, `${totals.postpago * 16} Pts`);
        addRow("Portabilidad Postpago Plan $15.990 (15 Pts)", totals.porta_pos_15990, `${totals.porta_pos_15990 * 15} Pts`);
        addRow("Portabilidad Tradicional Postpago (9 Pts)", totals.porta, `${totals.porta * 9} Pts`);
        addRow("Portabilidad Prepago a Postpago (8 Pts)", totals.portaPre8, `${totals.portaPre8 * 8} Pts`);
        addRow("Alta Nueva Comercial (3 Pts)", totals.nuevo, `${totals.nuevo * 3} Pts`);
        const renovPts = totals.points >= (metaObjective * 0.95) || totals.isBonusActive ? 5 : 3;
        addRow(`Renovación Postpago (${renovPts} Pts)`, totals.renov, `${totals.renov * renovPts} Pts`);
      } else {
        addRow("Planes Postpago (Sin datos registrados)", 0, "0 Pts");
      }

      if (prepagosTotals) {
        addRow("Prepago Activos (1 Pt)", prepagosTotals.activos, `${prepagosTotals.activos * 1} Pts`);
        addRow("Prepago Cargados (3 Pts)", prepagosTotals.cargados, `${prepagosTotals.cargados * 3} Pts`);
      } else {
        addRow("Ventas Prepago (Sin datos registrados)", 0, "0 Pts");
      }

      // Optional Section: MONTHLY HISTORY RECORDS
      if (monthlyHistory && monthlyHistory.length > 0) {
        cy += 6;
        checkPageOverflow(30 + (monthlyHistory.length * 8));
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(45, 18, 77);
        doc.setFontSize(11);
        doc.text("3. HISTORIAL DE METAS ALCANZADAS POR MES", 15, cy);
        cy += 6;

        // Header
        doc.setFillColor(235, 230, 245);
        doc.rect(15, cy - 4, 180, 7.5, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(45, 18, 77);
        doc.text("MES REGISTRADO", 18, cy.valueOf());
        doc.text("METAS MÓVIL (PTS / %)", 65, cy.valueOf());
        doc.text("METAS PREPAGO (PTS / %)", 120, cy.valueOf());
        doc.text("COMISIÓN TOTAL", 168, cy.valueOf());

        cy += 7.5;

        monthlyHistory.forEach((hist, idx) => {
          checkPageOverflow(8);
          doc.setFillColor(idx % 2 === 0 ? 255 : 249, 248, 252);
          doc.rect(15, cy - 4.5, 180, 7.5, 'F');
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(60, 60, 65);
          doc.text(hist.monthName, 18, cy.valueOf());
          doc.text(`${hist.postpagoPoints} / ${hist.postpagoMeta} Pts (${hist.postpagoPercent.toFixed(1)}%)`, 65, cy.valueOf());
          doc.text(`${hist.prepagoPoints} / ${hist.prepagoMeta} Pts (${hist.prepagoPercent.toFixed(1)}%)`, 120, cy.valueOf());
          doc.text(formatCLP(hist.totalCommission), 168, cy.valueOf());

          doc.setDrawColor(230, 230, 235);
          doc.line(15, cy + 3, 195, cy + 3);
          cy += 8;
        });
        cy += 2;
      }

      // 5. OFFICIAL RULINGS & DISCLAIMER
      cy += 6;
      checkPageOverflow(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 18, 77);
      doc.setFontSize(11);
      doc.text("4. CLÁUSULAS REGLAMENTARIAS (SINO EXPLICATIVO)", 15, cy);
      cy += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 105);
      
      const splitText = doc.splitTextToSize(
        "De acuerdo con las normativas comerciales de Progestión Chile para WOM, el derecho a comisionar ambos tramos (Postpago y Prepago) se liquida de forma independiente dependiendo del cumplimiento de meta individual de cada área. Se requiere un porcentaje de cumplimiento mínimo de 70% en cada tramo para activar el pago asociado. En caso de cumplimientos inferiores a 70%, el pago respectivo será de $0.",
        180
      );
      doc.text(splitText, 15, cy);
      
      cy += (splitText.length * 3.5) + 6;

      // Footer line
      checkPageOverflow(10);
      doc.setDrawColor(200, 200, 205);
      doc.line(15, cy, 195, cy);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 160);
      doc.text("Este es un informe digital oficial de simulación comercial con conexión en la nube. Progestión Chile.", 15, cy + 5);

      const fileName = `Reporte_Comisiones_${formattedUser.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("No se pudo exportar PDF:", error);
    }
    */
  };

  return (
    <div className="space-y-6">

      {/* Period Selection & Historical Logger Card */}
      <section className="bg-white rounded-2xl border border-purple-100 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5 border-b border-purple-50 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 sm:p-2 bg-purple-50 text-purple-700 rounded-lg sm:rounded-xl">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </span>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-gray-950 uppercase tracking-tight">Periodo de Rentabilidad</h3>
              <p className="hidden xs:block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Define el mes y guarda históricos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          {/* Month selector dropdown */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-450 uppercase tracking-widest pl-1">Mes Seleccionado</label>
            <div className="flex space-x-1.5">
              <select
                value={currentMonth.split(' ')[0]}
                onChange={(e) => {
                  const parts = currentMonth.split(' ');
                  const year = parts[1] || '2026';
                  setCurrentMonth?.(e.target.value + ' ' + year);
                }}
                className="w-full p-1.5 sm:p-2.5 bg-purple-50/50 hover:bg-purple-50/70 text-purple-950 font-bold text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl border border-purple-100 focus:outline-none focus:border-purple-400 focus:bg-white transition-all cursor-pointer"
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={currentMonth.split(' ')[1] || '2026'}
                onChange={(e) => {
                  const parts = currentMonth.split(' ');
                  const month = parts[0] || 'Mayo';
                  setCurrentMonth?.(month + ' ' + e.target.value);
                }}
                className="p-1.5 sm:p-2.5 bg-purple-50/50 hover:bg-purple-50/70 text-purple-950 font-bold text-[10.5px] sm:text-xs rounded-lg sm:rounded-xl border border-purple-100 focus:outline-none focus:border-purple-400 focus:bg-white transition-all cursor-pointer"
              >
                {['2025', '2026', '2027', '2028'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current metrics display */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-gray-450 uppercase tracking-widest pl-1">Métricas a Grabar</label>
            <div className="p-1 px-1.5 sm:p-2 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl text-[9px] sm:text-xs space-y-0.5 sm:space-y-1 font-semibold text-gray-600">
              <div className="flex justify-between items-center">
                <span className="truncate">Pos: {totals?.points || 0}/{metaObjective} Pts</span>
                <span className="font-extrabold text-purple-750">({currentPercentage.toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="truncate">Pre: {prepagosTotals?.points || 0}/{metaPrepagoObjective} Pts</span>
                <span className="font-extrabold text-rose-600">({prepagoPercentage.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Save to History button */}
          <div className="flex items-end col-span-2 md:col-span-1">
            <button
              onClick={() => {
                if (!onSaveMonthlyHistory) return;
                const newRec: MonthlyHistoryRecord = {
                  id: 'monthly_' + Date.now(),
                  monthName: currentMonth,
                  postpagoPoints: totals?.points || 0,
                  postpagoMeta: metaObjective,
                  postpagoPercent: currentPercentage,
                  prepagoPoints: prepagosTotals?.points || 0,
                  prepagoMeta: metaPrepagoObjective,
                  prepagoPercent: prepagoPercentage,
                  postpagoCommission: realPostpagoComm,
                  prepagoCommission: realPrepagoComm,
                  totalCommission: realTotalComm,
                  timestamp: new Date().toISOString(),
                  planCounts: {
                    postpago: totals?.postpago || 0,
                    porta_pos_15990: totals?.porta_pos_15990 || 0,
                    porta: totals?.porta || 0,
                    nuevo: totals?.nuevo || 0,
                    renov: totals?.renov || 0,
                    activos: prepagosTotals?.activos || 0,
                    cargados: prepagosTotals?.cargados || 0
                  }
                };
                onSaveMonthlyHistory(newRec);
              }}
              className="w-full p-2 sm:p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg sm:rounded-xl font-bold text-[10.5px] sm:text-xs uppercase tracking-wider flex items-center justify-center space-x-1 sm:space-x-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>Guardar Historial</span>
            </button>
          </div>
        </div>
      </section>

      {/* Historial Mensual Display Section */}
      {monthlyHistory && monthlyHistory.length > 0 && (
        <section className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-purple-50 pb-2.5">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle2 className="w-4.5 h-4.5 text-teal-600" />
            </span>
            <div>
              <h4 className="font-black text-gray-950 text-xs uppercase tracking-widest">Historial de Ventas y Metas por Mes</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase">Registro permanente de los periodos cerrados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {monthlyHistory.map((hist) => {
              const isPostpagoActive = hist.postpagoPercent >= 70;
              const isPrepagoActive = hist.prepagoPercent >= 70;

              return (
                <div 
                  key={hist.id}
                  className="bg-purple-50/10 hover:bg-purple-50/20 border border-purple-100/50 rounded-2xl p-4 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-black text-purple-950">{hist.monthName}</span>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                        Grabado el {new Date(hist.timestamp).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteMonthlyHistory?.(hist.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este mes"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold text-gray-600">
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="block text-[8px] font-black text-gray-450 uppercase tracking-wider">Móvil Pospago</span>
                      <span className="text-gray-950 font-bold">{hist.postpagoPoints}/{hist.postpagoMeta} Pts</span>
                      <span className={`block text-[9px] font-extrabold mt-1 uppercase ${isPostpagoActive ? 'text-teal-600' : 'text-rose-500'}`}>
                        {hist.postpagoPercent.toFixed(1)}% {isPostpagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="block text-[8px] font-black text-gray-450 uppercase tracking-wider">Prepago (Meta)</span>
                      <span className="text-gray-950 font-bold">{hist.prepagoPoints}/{hist.prepagoMeta} Pts</span>
                      <span className={`block text-[9px] font-extrabold mt-1 uppercase ${isPrepagoActive ? 'text-teal-600' : 'text-rose-500'}`}>
                        {hist.prepagoPercent.toFixed(1)}% {isPrepagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3.5 border-t border-purple-100/60 flex justify-between items-center bg-purple-50/20 px-3 py-2 rounded-xl">
                    <span className="text-[10px] text-purple-900 font-extrabold uppercase">Comisión Estimada</span>
                    <span className="text-sm font-black text-teal-750">{formatCLP(hist.totalCommission)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 1. Header & Summary Cards of COMMISSION ACCUMULATION */}
      <section className="bg-gradient-to-br from-purple-900 to-purple-950 p-6 rounded-[36px] text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
        {/* Subtle decorative circles for a premium aesthetic */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-wom-magenta/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-35px] w-36 h-36 bg-wom-magenta/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-1.5 mb-6">
          <span className="bg-wom-magenta text-white font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 shadow-sm inline-block">
            Resumen de Comisión Real Alcanzada
          </span>
          <h2 className="text-2xl font-black tracking-tight uppercase">Cifras del Mes de {currentMonth.split(' ')[0]}</h2>
          <p className="text-xs text-purple-200/90 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
            <span>Metas Postpago: <strong className="text-white">{currentPercentage.toFixed(1)}%</strong></span>
            <span className="hidden sm:inline-block text-purple-400">•</span>
            <span>Metas Prepago: <strong className="text-white">{prepagoPercentage.toFixed(1)}%</strong></span>
          </p>
        </div>

        {/* Triple Summary Panels */}
        <div className="grid grid-cols-3 gap-1 pl-0.5 pr-0.5 sm:gap-3 sm:pl-0 sm:pr-0">
          {/* Postpago card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 min-[350px]:p-2.5 sm:p-4 md:p-3 lg:p-5 px-1 sm:px-3 md:px-1.5 lg:px-4 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[7px] min-[350px]:text-[8px] min-[400px]:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] text-purple-200 uppercase font-black tracking-wider mb-1 select-none">
              Móvil Postpago
            </span>
            <span className="block text-[11px] min-[350px]:text-xs min-[400px]:text-sm sm:text-base md:text-sm lg:text-lg xl:text-2xl font-black text-white tracking-tight my-0.5 text-center w-full whitespace-nowrap">
              {formatCLP(realPostpagoComm)}
            </span>
            <span className="block text-[7px] min-[350px]:text-[8px] min-[400px]:text-[9px] sm:text-[9.5px] md:text-[8.5px] lg:text-[9.5px] text-purple-100 font-bold uppercase mt-0.5">
              Metas: <strong className="text-white">{currentPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[6.5px] min-[350px]:text-[7.5px] min-[400px]:text-[8px] text-purple-200 font-black uppercase mt-1 bg-white/10 px-1 py-0.5 rounded-full select-none">
              {currentPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {" "}
          {/* Prepago card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 min-[350px]:p-2.5 sm:p-4 md:p-3 lg:p-5 px-1 sm:px-3 md:px-1.5 lg:px-4 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[7px] min-[350px]:text-[8px] min-[400px]:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] text-purple-200 uppercase font-black tracking-wider mb-1 select-none">
              Móvil Prepago
            </span>
            <span className="block text-[11px] min-[350px]:text-xs min-[400px]:text-sm sm:text-base md:text-sm lg:text-lg xl:text-2xl font-black text-rose-300 tracking-tight my-0.5 text-center w-full whitespace-nowrap">
              {formatCLP(realPrepagoComm)}
            </span>
            <span className="block text-[7px] min-[350px]:text-[8px] min-[400px]:text-[9px] sm:text-[9.5px] md:text-[8.5px] lg:text-[9.5px] text-purple-100 font-bold uppercase mt-0.5">
              Metas: <strong className="text-white">{prepagoPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[6.5px] min-[350px]:text-[7.5px] min-[400px]:text-[8px] text-purple-200 font-black uppercase mt-1 bg-white/10 px-1 py-0.5 rounded-full select-none">
              {prepagoPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {" "}
          {/* Sumatoria Total card */}
          <div className="bg-gradient-to-tr from-wom-magenta to-rose-600 rounded-xl sm:rounded-2xl p-1.5 min-[350px]:p-2.5 sm:p-4 md:p-3 lg:p-5 px-1 sm:px-3 md:px-1.5 lg:px-4 shadow-lg border border-white/15 hover:border-white/25 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[7px] min-[350px]:text-[8px] min-[400px]:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] text-white/90 uppercase font-black tracking-wider mb-1 select-none">
              Comisión Total
            </span>
            <span className="block text-[11px] min-[350px]:text-xs min-[400px]:text-sm sm:text-base md:text-sm lg:text-lg xl:text-2xl font-black text-white tracking-tight my-0.5 drop-shadow-sm text-center w-full whitespace-nowrap">
              {formatCLP(realTotalComm)}
            </span>
            <span className="block text-[6.5px] min-[350px]:text-[7.5px] min-[400px]:text-[8px] text-yellow-300 font-black uppercase mt-1.5 flex items-center justify-center space-x-0.5 bg-black/10 px-1 py-0.5 rounded-full select-none">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse shrink-0" />
              <span>Suma Real</span>
            </span>
          </div>
        </div>

        {currentPercentage < 70 && prepagoPercentage < 70 ? (
          <div className="mt-4.5 bg-rose-500/20 text-rose-200 p-3 rounded-2xl text-center text-xs font-semibold border border-rose-500/30">
            ⚠️ Alerta: Ninguno de tus cumplimientos alcanza el <strong>70% mínimo</strong> necesario para activar el pago de comisiones. ¡Sigue registrando ventas!
          </div>
        ) : currentPercentage < 70 ? (
          <div className="mt-4.5 bg-rose-500/20 text-rose-200 p-3 rounded-2xl text-center text-xs font-semibold border border-rose-500/30">
            ⚠️ Alerta Postpago: Tu cumplimiento Postpago ({currentPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Prepago.
          </div>
        ) : prepagoPercentage < 70 ? (
          <div className="mt-4.5 bg-rose-500/20 text-rose-200 p-3 rounded-2xl text-center text-xs font-semibold border border-rose-500/30">
            ⚠️ Alerta Prepago: Tu cumplimiento Prepago ({prepagoPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Postpago.
          </div>
        ) : (
          <div className="mt-4.5 bg-emerald-500/20 text-emerald-200 p-3 rounded-2xl text-center text-xs font-semibold border border-emerald-500/30">
            🎉 ¡Excelente! Ambos cumplimientos superan el <strong>70% mínimo</strong> obligatorio. ¡Tus bonos están activos y acumulados!
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* 2. Interactive Commission Slider (Real-time recalculation) */}
        <section className="bg-white p-5 rounded-[32px] border border-purple-100 custom-card-shadow space-y-4">
        <div className="flex items-center space-x-2.5">
          <div id="simulated-commission-icon" className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-wom-purple">
            <Sliders className="w-5 h-5 text-wom-magenta" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
              Simulador Interactivo de Tramo
            </h3>
            <p className="text-[10px] text-gray-450 uppercase font-semibold">
              Proyecta tus ingresos mensuales fácilmente
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Mueve el deslizador para proyectar tus comisiones. El simulador calculará tu bono Postpago, Prepago y Sumatoria Total conforme a los anexos de cumplimiento del mes:
        </p>

        {/* Simulator Outputs Group */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl grid grid-cols-4 gap-3 text-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-200 pr-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Meta %</span>
            <span className="text-lg font-black text-wom-purple">{simulatedPct}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-slate-200 px-1">
            <span className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Sim. Postpago</span>
            <span className="text-xs font-black text-gray-750">{formatCLP(simComm.postpago)}</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-slate-200 px-1">
            <span className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Sim. Prepago</span>
            <span className="text-xs font-black text-gray-750">{formatCLP(simComm.prepago)}</span>
          </div>
          <div className="flex flex-col items-center justify-center pl-1">
            <span className="text-[10px] text-purple-600 font-black uppercase block mb-0.5">Sim. Suma</span>
            <span className="text-sm font-black text-wom-magenta">{formatCLP(simComm.total)}</span>
          </div>
        </div>

        {/* Input slider */}
        <div className="space-y-1.5 pt-2">
          <input
            id="simulation-commission-slider"
            type="range"
            min="70"
            max="160"
            step="1"
            value={simulatedPct}
            onChange={(e) => setSimulatedPct(parseInt(e.target.value))}
            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wom-magenta focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase select-none px-0.5">
            <span className="text-purple-600">70% ($110.000)</span>
            <span>100% (Meta)</span>
            <span>130%</span>
            <span className="text-emerald-600 font-black">160% ($440.000)</span>
          </div>
        </div>
      </section>

      {/* 3. Reference Annex Boards - Separate & Consolidated Tables */}
      <section className="bg-white rounded-[32px] overflow-hidden border border-purple-100 custom-card-shadow flex flex-col">
        {/* Title bar */}
        <div className="bg-purple-50 p-4.5 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h4 id="annex-reference-title" className="text-xs font-black text-wom-purple uppercase tracking-wider">
              Anexo Oficial de Metas & Cumplimiento
            </h4>
            <p className="text-[10px] text-purple-400 font-semibold uppercase">
              Progestión Chile - Estructura de Comisión
            </p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-purple-300">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              id="search-annex-table"
              type="text"
              placeholder="Buscar meta (ej. 100%)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-purple-200 rounded-xl pl-8 pr-3 py-1 text-xs text-gray-700 placeholder-purple-300 focus:outline-none focus:border-wom-purple w-full sm:w-48 shadow-inner"
            />
          </div>
        </div>

        {/* Tab Toggle buttons */}
        <div id="annex-tab-toggle-container" className="grid grid-cols-4 border-b border-purple-100 bg-purple-50/30 p-1 gap-1">
          <button
            onClick={() => setActiveTableTab('all')}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg tracking-tight text-center cursor-pointer transition-all ${
              activeTableTab === 'all' 
                ? 'bg-purple-900 text-white shadow-sm' 
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            📋 Todo
          </button>
          <button
            onClick={() => setActiveTableTab('postpago')}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg tracking-tight text-center cursor-pointer transition-all ${
              activeTableTab === 'postpago' 
                ? 'bg-purple-900 text-white shadow-sm' 
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            📱 Postpago
          </button>
          <button
            onClick={() => setActiveTableTab('prepago')}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg tracking-tight text-center cursor-pointer transition-all ${
              activeTableTab === 'prepago' 
                ? 'bg-purple-900 text-white shadow-sm' 
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            💰 Prepago
          </button>
          <button
            onClick={() => setActiveTableTab('total')}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg tracking-tight text-center cursor-pointer transition-all ${
              activeTableTab === 'total' 
                ? 'bg-purple-950 text-white shadow-sm' 
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            🔥 Suma Total
          </button>
        </div>

        {/* Table Content window */}
        <div className="overflow-y-auto max-h-[360px] relative">
          
          {filteredData.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold italic">
              No se encontraron coincidencias para "{searchTerm}"
            </div>
          ) : (
            <table className="w-full text-left text-xs relative border-collapse">
              
              {/* Table header */}
              <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(147,51,234,0.08)] z-10 text-[9.5px] font-extrabold uppercase tracking-wide text-purple-800">
                
                {activeTableTab === 'all' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-purple-100">Cumplimiento</th>
                    <th className="p-3 border-b border-purple-100 text-right">Postpago</th>
                    <th className="p-3 border-b border-purple-100 text-right">Prepago</th>
                    <th className="p-3 pr-4 border-b border-purple-100 text-right bg-purple-50/40 text-purple-950">Sumatoria</th>
                  </tr>
                )}

                {activeTableTab === 'postpago' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-purple-100">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-purple-100 text-right text-purple-950">Comisión Postpago</th>
                  </tr>
                )}

                {activeTableTab === 'prepago' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-purple-100">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-purple-100 text-right text-rose-800">Comisión Prepago</th>
                  </tr>
                )}

                {activeTableTab === 'total' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-purple-100">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-purple-100 text-right text-purple-950 bg-purple-50/50">Sumatoria Total (Web Chat)</th>
                  </tr>
                )}

              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-purple-50 text-gray-750 font-semibold">
                
                {filteredData.map((row) => {
                  const isCurrentRow = closestPctRow === row.pct;
                  const isSimulatedRow = simulatedPct === row.pct;
                  
                  // Row dynamic bg style
                  let rowBackground = "hover:bg-purple-50/30 transition-colors";
                  if (isCurrentRow) {
                    rowBackground = "bg-purple-100/50 text-purple-950 border-y border-purple-300 font-black";
                  } else if (isSimulatedRow) {
                    rowBackground = "bg-amber-50/60 hover:bg-amber-100/40 text-amber-950 transition-all font-bold";
                  }

                  return (
                    <tr 
                      key={row.pct} 
                      className={rowBackground}
                    >
                      {/* 1. All Columns View */}
                      {activeTableTab === 'all' && (
                        <>
                          <td className="p-2.5 pl-4 flex items-center space-x-1.5 whitespace-nowrap">
                            <span className="text-gray-900">{row.pct}%</span>
                            {isCurrentRow && (
                              <span className="bg-wom-magenta text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded-md leading-none select-none tracking-tight">
                                📍 Tu Progreso
                              </span>
                            )}
                            {isSimulatedRow && !isCurrentRow && (
                              <span className="bg-amber-500 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded-md leading-none select-none tracking-tight">
                                Simulated
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] text-gray-700">
                            {formatCLP(row.postpago)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] text-gray-700">
                            {formatCLP(row.prepago)}
                          </td>
                          <td className="p-2.5 pr-4 text-right font-mono text-[11px] text-purple-900 bg-purple-50/15 font-bold">
                            {formatCLP(row.total)}
                          </td>
                        </>
                      )}

                      {/* 2. Postpago Only Column View */}
                      {activeTableTab === 'postpago' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-950 font-bold">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-purple-600 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono font-bold text-gray-950">
                            {formatCLP(row.postpago)}
                          </td>
                        </>
                      )}

                      {/* 3. Prepago Only Column View */}
                      {activeTableTab === 'prepago' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-950 font-bold">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-purple-600 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono font-bold text-rose-700">
                            {formatCLP(row.prepago)}
                          </td>
                        </>
                      )}

                      {/* 4. Total Commission Column View */}
                      {activeTableTab === 'total' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-950 font-bold">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-purple-600 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono font-bold text-wom-purple bg-purple-50/20">
                            {formatCLP(row.total)}
                          </td>
                        </>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Informative advice at bottom */}
        <div className="bg-slate-50 p-3.5 border-t border-purple-100 flex items-start space-x-2 text-gray-500">
          <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed select-none">
            De acuerdo con el reglamento Progestión, las comisiones se fijan estrictamente por la meta de cumplimiento alcanzada en el mes calendario. Si el cumplimiento final está debajo del 70%, el pago acumulado de comisiones será de $0.
          </p>
        </div>
      </section>
      </div>
      
    </div>
  );
}
