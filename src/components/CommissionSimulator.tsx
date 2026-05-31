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
      <section className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 sm:p-2 bg-slate-50 text-slate-500 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
            </span>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-850 uppercase tracking-widest">Periodo de Rentabilidad</h3>
              <p className="hidden xs:block text-[9px] text-slate-400 font-medium uppercase tracking-wider">Define el mes y guarda históricos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          {/* Month selector dropdown */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-widest pl-1">Mes Seleccionado</label>
            <div className="flex space-x-1.5">
              <select
                value={currentMonth.split(' ')[0]}
                onChange={(e) => {
                  const parts = currentMonth.split(' ');
                  const year = parts[1] || '2026';
                  setCurrentMonth?.(e.target.value + ' ' + year);
                }}
                className="w-full p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
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
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
              >
                {['2025', '2026', '2027', '2028'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current metrics display */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-widest pl-1">Métricas a Grabar</label>
            <div className="p-1.5 px-2 bg-slate-50/50 border border-slate-100 rounded-lg text-[10px] sm:text-xs space-y-1 font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span className="truncate">Pos: {totals?.points || 0}/{metaObjective} Pts</span>
                <span className="font-semibold text-slate-800">({currentPercentage.toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="truncate">Pre: {prepagosTotals?.points || 0}/{metaPrepagoObjective} Pts</span>
                <span className="font-semibold text-indigo-600">({prepagoPercentage.toFixed(0)}%)</span>
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
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-850 text-white rounded-lg font-medium text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>Guardar Historial</span>
            </button>
          </div>
        </div>
      </section>

      {/* Historial Mensual Display Section */}
      {monthlyHistory && monthlyHistory.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <span className="p-1.5 bg-slate-50 text-slate-500 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-widest">Historial de Ventas y Metas por Mes</h4>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Registro permanente de los periodos cerrados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {monthlyHistory.map((hist) => {
              const isPostpagoActive = hist.postpagoPercent >= 70;
              const isPrepagoActive = hist.prepagoPercent >= 70;

              return (
                <div 
                  key={hist.id}
                  className="bg-slate-50/30 hover:bg-slate-50/60 border border-slate-100 rounded-xl p-4 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-800">{hist.monthName}</span>
                      <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                        Grabado el {new Date(hist.timestamp).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteMonthlyHistory?.(hist.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Eliminar este mes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold text-slate-600">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="block text-[8px] font-medium text-slate-400 uppercase tracking-widest">Móvil Pospago</span>
                      <span className="text-slate-850 font-semibold">{hist.postpagoPoints}/{hist.postpagoMeta} Pts</span>
                      <span className={`block text-[9px] font-medium mt-1 uppercase ${isPostpagoActive ? 'text-teal-600' : 'text-rose-500'}`}>
                        {hist.postpagoPercent.toFixed(1)}% {isPostpagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="block text-[8px] font-medium text-slate-400 uppercase tracking-widest">Prepago (Meta)</span>
                      <span className="text-slate-850 font-semibold">{hist.prepagoPoints}/{hist.prepagoMeta} Pts</span>
                      <span className={`block text-[9px] font-medium mt-1 uppercase ${isPrepagoActive ? 'text-teal-600' : 'text-rose-500'}`}>
                        {hist.prepagoPercent.toFixed(1)}% {isPrepagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center bg-white px-3 py-1.5 rounded-lg">
                    <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Comisión Estimada</span>
                    <span className="text-xs font-semibold text-slate-850">{formatCLP(hist.totalCommission)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="bg-slate-900 p-6 rounded-2xl text-white border border-slate-800 relative overflow-hidden">
        <div className="text-center space-y-1 mb-6">
          <span className="bg-slate-800 text-slate-300 font-semibold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border border-slate-700 shadow-sm inline-block">
            Resumen de Comisión Real Alcanzada
          </span>
          <h2 className="text-xl font-semibold tracking-tight uppercase text-white pt-1">Cifras del Mes de {currentMonth.split(' ')[0]}</h2>
          <p className="text-[11px] text-slate-400 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 font-medium">
            <span>Metas Postpago: <strong className="text-white font-semibold">{currentPercentage.toFixed(1)}%</strong></span>
            <span className="hidden sm:inline-block text-slate-600">•</span>
            <span>Metas Prepago: <strong className="text-white font-semibold">{prepagoPercentage.toFixed(1)}%</strong></span>
          </p>
        </div>

        {/* Triple Summary Panels */}
        <div className="grid grid-cols-3 gap-2.5 pl-0.5 pr-0.5 sm:pl-0 sm:pr-0">
          {/* Postpago card */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 sm:p-4 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[8px] sm:text-[9.5px] text-slate-400 uppercase font-semibold tracking-widest mb-1 select-none">
              Móvil Postpago
            </span>
            <span className="block text-xs sm:text-lg font-semibold text-white tracking-tight my-0.5 text-center w-full whitespace-nowrap">
              {formatCLP(realPostpagoComm)}
            </span>
            <span className="block text-[8px] sm:text-[9px] text-slate-400 font-normal uppercase mt-0.5">
              Metas: <strong className="text-white font-semibold">{currentPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[7px] sm:text-[8px] text-slate-300 font-semibold uppercase mt-1.5 bg-white/5 px-2 py-0.5 rounded-full select-none">
              {currentPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {/* Prepago card */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 sm:p-4 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[8px] sm:text-[9.5px] text-slate-400 uppercase font-semibold tracking-widest mb-1 select-none">
              Móvil Prepago
            </span>
            <span className="block text-xs sm:text-lg font-semibold text-slate-300 tracking-tight my-0.5 text-center w-full whitespace-nowrap">
              {formatCLP(realPrepagoComm)}
            </span>
            <span className="block text-[8px] sm:text-[9px] text-slate-400 font-normal uppercase mt-0.5">
              Metas: <strong className="text-white font-semibold">{prepagoPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[7px] sm:text-[8px] text-slate-300 font-semibold uppercase mt-1.5 bg-white/5 px-2 py-0.5 rounded-full select-none">
              {prepagoPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {/* Sumatoria Total card */}
          <div className="bg-indigo-950 border border-indigo-900/60 rounded-xl p-2.5 sm:p-4 hover:bg-indigo-900/40 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[8px] sm:text-[9.5px] text-indigo-300 uppercase font-semibold tracking-widest mb-1 select-none">
              Comisión Total
            </span>
            <span className="block text-xs sm:text-lg font-semibold text-white tracking-tight my-0.5 text-center w-full whitespace-nowrap">
              {formatCLP(realTotalComm)}
            </span>
            <span className="block text-[7px] sm:text-[8px] text-yellow-300 font-semibold uppercase mt-1.5 flex items-center justify-center space-x-0.5 bg-white/5 px-2 py-0.5 rounded-full select-none">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse shrink-0" />
              <span>Suma Real</span>
            </span>
          </div>
        </div>

        {currentPercentage < 70 && prepagoPercentage < 70 ? (
          <div className="mt-4 bg-rose-500/10 text-rose-300 p-3 rounded-xl text-center text-xs font-normal border border-rose-500/20 leading-relaxed">
            ⚠️ Alerta: Ninguno de tus cumplimientos alcanza el <strong>70% mínimo</strong> necesario para activar el pago de comisiones. ¡Sigue registrando ventas!
          </div>
        ) : currentPercentage < 70 ? (
          <div className="mt-4 bg-rose-500/10 text-rose-300 p-3 rounded-xl text-center text-xs font-normal border border-rose-500/20 leading-relaxed">
            ⚠️ Alerta Postpago: Tu cumplimiento Postpago ({currentPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Prepago.
          </div>
        ) : prepagoPercentage < 70 ? (
          <div className="mt-4 bg-rose-500/10 text-rose-300 p-3 rounded-xl text-center text-xs font-normal border border-rose-500/20 leading-relaxed">
            ⚠️ Alerta Prepago: Tu cumplimiento Prepago ({prepagoPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Postpago.
          </div>
        ) : (
          <div className="mt-4 bg-emerald-500/10 text-emerald-300 p-3 rounded-xl text-center text-xs font-normal border border-emerald-500/20 leading-relaxed">
            🎉 ¡Excelente! Ambos cumplimientos superan el <strong>70% mínimo</strong> obligatorio. ¡Tus bonos están activos y acumulados!
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* 2. Interactive Commission Slider (Real-time recalculation) */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div id="simulated-commission-icon" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
              Simulador Interactivo de Tramo
            </h3>
            <p className="text-[10px] text-slate-400">
              Proyecta tus ingresos mensuales fácilmente
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Mueve el deslizador para proyectar tus comisiones. El simulador calculará tu bono Postpago, Prepago y Sumatoria Total conforme a los anexos de cumplimiento del mes:
        </p>

        {/* Simulator Outputs Group */}
        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl grid grid-cols-4 gap-2.5 text-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-150 pr-1">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest block mb-0.5">Meta %</span>
            <span className="text-sm font-semibold text-slate-800">{simulatedPct}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-slate-150 px-1">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest block mb-0.5">Postpago</span>
            <span className="text-xs font-semibold text-slate-700">{formatCLP(simComm.postpago)}</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-slate-150 px-1">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest block mb-0.5">Prepago</span>
            <span className="text-xs font-semibold text-slate-700">{formatCLP(simComm.prepago)}</span>
          </div>
          <div className="flex flex-col items-center justify-center pl-1">
            <span className="text-[9px] text-indigo-600 font-semibold uppercase tracking-widest block mb-0.5">Sim. Suma</span>
            <span className="text-xs font-bold text-indigo-600">{formatCLP(simComm.total)}</span>
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
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-medium uppercase tracking-wider select-none px-0.5">
            <span className="text-slate-500">70% ($110.000)</span>
            <span>100%</span>
            <span>130%</span>
            <span className="text-indigo-600 font-semibold">160% ($440.000)</span>
          </div>
        </div>
      </section>

      {/* 3. Reference Annex Boards - Separate & Consolidated Tables */}
      <section className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Title bar */}
        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h4 id="annex-reference-title" className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
              Anexo Oficial de Metas & Cumplimiento
            </h4>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
              Progestión Chile - Estructura de Comisión
            </p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              id="search-annex-table"
              type="text"
              placeholder="Buscar meta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-750 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Tab Toggle buttons */}
        <div id="annex-tab-toggle-container" className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/30 p-1 gap-1">
          <button
            onClick={() => setActiveTableTab('all')}
            className={`py-2 px-1 text-[9px] font-semibold uppercase rounded-md tracking-wider text-center cursor-pointer transition-all ${
              activeTableTab === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📋 Todo
          </button>
          <button
            onClick={() => setActiveTableTab('postpago')}
            className={`py-2 px-1 text-[9px] font-semibold uppercase rounded-md tracking-wider text-center cursor-pointer transition-all ${
              activeTableTab === 'postpago' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            📱 Postpago
          </button>
          <button
            onClick={() => setActiveTableTab('prepago')}
            className={`py-2 px-1 text-[9px] font-semibold uppercase rounded-md tracking-wider text-center cursor-pointer transition-all ${
              activeTableTab === 'prepago' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            💰 Prepago
          </button>
          <button
            onClick={() => setActiveTableTab('total')}
            className={`py-2 px-1 text-[9px] font-semibold uppercase rounded-md tracking-wider text-center cursor-pointer transition-all ${
              activeTableTab === 'total' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🧮 Suma Total
          </button>
        </div>

        {/* Table Content window */}
        <div className="overflow-y-auto max-h-[360px] relative">
          
          {filteredData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-450 italic">
              No se encontraron coincidencias para "{searchTerm}"
            </div>
          ) : (
            <table className="w-full text-left text-xs relative border-collapse">
              
              {/* Table header */}
              <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-10 text-[9.5px] font-semibold uppercase tracking-wider text-slate-505 bg-slate-50/80">
                
                {activeTableTab === 'all' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-slate-100 text-slate-500 font-semibold uppercase">Cumplimiento</th>
                    <th className="p-3 border-b border-slate-100 text-right text-slate-500 font-semibold uppercase">Postpago</th>
                    <th className="p-3 border-b border-slate-100 text-right text-slate-500 font-semibold uppercase">Prepago</th>
                    <th className="p-3 pr-4 border-b border-slate-100 text-right bg-slate-100/50 text-slate-700 font-semibold uppercase">Sumatoria</th>
                  </tr>
                )}

                {activeTableTab === 'postpago' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-slate-100 text-slate-500 font-semibold uppercase">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-slate-100 text-right text-slate-750 font-semibold uppercase">Comisión Postpago</th>
                  </tr>
                )}

                {activeTableTab === 'prepago' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-slate-100 text-slate-500 font-semibold uppercase">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-slate-100 text-right text-slate-750 font-semibold uppercase">Comisión Prepago</th>
                  </tr>
                )}

                {activeTableTab === 'total' && (
                  <tr>
                    <th className="p-3 pl-4 border-b border-slate-100 text-slate-500 font-semibold uppercase">Cumplimiento Meta</th>
                    <th className="p-3 pr-4 border-b border-slate-100 text-right text-slate-750 bg-slate-100/50 font-semibold uppercase">Sumatoria Total</th>
                  </tr>
                )}

              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                
                {filteredData.map((row) => {
                  const isCurrentRow = closestPctRow === row.pct;
                  const isSimulatedRow = simulatedPct === row.pct;
                  
                  // Row dynamic bg style
                  let rowBackground = "hover:bg-slate-50 transition-colors";
                  if (isCurrentRow) {
                    rowBackground = "bg-slate-100 text-slate-900 font-semibold";
                  } else if (isSimulatedRow) {
                    rowBackground = "bg-indigo-50/40 hover:bg-indigo-50 text-indigo-950 transition-all font-semibold";
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
                            <span className="text-slate-800 font-medium">{row.pct}%</span>
                            {isCurrentRow && (
                              <span className="bg-slate-950 text-white font-semibold text-[8px] uppercase px-1.5 py-0.5 rounded-md leading-none select-none tracking-tight">
                                📍 Tu Progreso
                              </span>
                            )}
                            {isSimulatedRow && !isCurrentRow && (
                              <span className="bg-indigo-600 text-white font-semibold text-[8px] uppercase px-1.5 py-0.5 rounded-md leading-none select-none tracking-tight">
                                Simulado
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] text-slate-600">
                            {formatCLP(row.postpago)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] text-slate-600">
                            {formatCLP(row.prepago)}
                          </td>
                          <td className="p-2.5 pr-4 text-right font-mono text-[11px] text-indigo-600 bg-slate-50/50 font-semibold">
                            {formatCLP(row.total)}
                          </td>
                        </>
                      )}

                      {/* 2. Postpago Only Column View */}
                      {activeTableTab === 'postpago' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-800 font-medium">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-slate-850 text-white text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono text-slate-800 font-medium">
                            {formatCLP(row.postpago)}
                          </td>
                        </>
                      )}

                      {/* 3. Prepago Only Column View */}
                      {activeTableTab === 'prepago' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-800 font-medium">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-slate-850 text-white text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono text-slate-800 font-medium">
                            {formatCLP(row.prepago)}
                          </td>
                        </>
                      )}

                      {/* 4. Total Commission Column View */}
                      {activeTableTab === 'total' && (
                        <>
                          <td className="p-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-800 font-medium">{row.pct}%</span>
                              {isCurrentRow && (
                                <span className="bg-slate-850 text-white text-[8px] uppercase font-semibold px-1.5 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono text-indigo-600 font-semibold bg-indigo-50/20">
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
        <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex items-start space-x-2 text-slate-500">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed select-none">
            De acuerdo con el reglamento Progestión, las comisiones se fijan estrictamente por la meta de cumplimiento alcanzada en el mes calendario. Si el cumplimiento final está debajo del 70%, el pago acumulado de comisiones será de $0.
          </p>
        </div>
      </section>
      </div>
      
    </div>
  );
}
