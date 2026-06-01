/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles
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
    <div className="space-y-6 animate-fadeIn">

      {/* 1. Resumen de Comisión Real Alcanzada */}
      <section className="bg-white p-6 rounded-2xl text-[#4c018c] border border-[#4c018c]/15 relative overflow-hidden shadow-lg">
        <div className="text-center space-y-1 mb-6">
          <span className="bg-[#4c018c]/10 text-[#4c018c] font-bold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border border-[#4c018c]/25 shadow-sm inline-block">
            Resumen de Comisión Real Alcanzada
          </span>
          <h2 className="text-xl font-bold tracking-tight uppercase text-[#4c018c] pt-1">Cifras del Mes de {currentMonth.split(' ')[0]}</h2>
          <p className="text-[11px] text-[#4c018c]/80 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 font-medium">
            <span>Metas Postpago: <strong className="text-[#4c018c] font-black">{currentPercentage.toFixed(1)}%</strong></span>
            <span className="hidden sm:inline-block text-[#4c018c]/30">•</span>
            <span>Metas Prepago: <strong className="text-[#4c018c] font-black">{prepagoPercentage.toFixed(1)}%</strong></span>
          </p>
        </div>

        {/* Triple Summary Panels */}
        <div className="grid grid-cols-3 gap-2.5 pl-0.5 pr-0.5 sm:pl-0 sm:pr-0">
          {/* Postpago card */}
          <div className="bg-[#4c018c]/5 border border-[#4c018c]/10 rounded-xl p-2.5 sm:p-4 hover:bg-[#4c018c]/10 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[8px] sm:text-[9.5px] text-[#4c018c]/80 uppercase font-semibold tracking-widest mb-1 select-none">
              Móvil Postpago
            </span>
            <span className="block text-xs sm:text-lg font-black text-[#4c018c] tracking-tight my-0.5 text-center w-full whitespace-nowrap bg-[#4c018c]/10 rounded px-1 font-mono">
              {formatCLP(realPostpagoComm)}
            </span>
            <span className="block text-[8px] sm:text-[9px] text-[#4c018c]/80 font-medium uppercase mt-0.5">
              Metas: <strong className="text-[#4c018c] font-semibold">{currentPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[7px] sm:text-[8px] text-[#4c018c] font-bold uppercase mt-1.5 bg-[#4c018c]/10 px-2 py-0.5 rounded-full select-none">
              {currentPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {/* Prepago card */}
          <div className="bg-[#4c018c]/5 border border-[#4c018c]/10 rounded-xl p-2.5 sm:p-4 hover:bg-[#4c018c]/10 transition-all flex flex-col items-center justify-center text-center w-full">
            <span className="block text-[8px] sm:text-[9.5px] text-[#4c018c]/80 uppercase font-semibold tracking-widest mb-1 select-none">
              Móvil Prepago
            </span>
            <span className="block text-xs sm:text-lg font-black text-[#4c018c] tracking-tight my-0.5 text-center w-full whitespace-nowrap bg-[#4c018c]/10 rounded px-1 font-mono">
              {formatCLP(realPrepagoComm)}
            </span>
            <span className="block text-[8px] sm:text-[9px] text-[#4c018c]/80 font-medium uppercase mt-0.5">
              Metas: <strong className="text-[#4c018c] font-semibold">{prepagoPercentage.toFixed(1)}%</strong>
            </span>
            <span className="block text-[7px] sm:text-[8px] text-[#4c018c] font-bold uppercase mt-1.5 bg-[#4c018c]/10 px-2 py-0.5 rounded-full select-none">
              {prepagoPercentage >= 70 ? '✔ Pago Activo' : 'Requiere 70%'}
            </span>
          </div>

          {/* Sumatoria Total card */}
          <div className="bg-[#4c018c]/10 border border-[#4c018c]/15 rounded-xl p-2.5 sm:p-4 hover:bg-[#4c018c]/20 transition-all flex flex-col items-center justify-center text-center w-full shadow-inner">
            <span className="block text-[8px] sm:text-[9.5px] text-[#4c018c] uppercase font-bold tracking-widest mb-1 select-none font-sans">
              Comisión Total
            </span>
            <span className="block text-xs sm:text-lg font-black text-[#4c018c] tracking-tight my-0.5 text-center w-full whitespace-nowrap bg-[#4c018c]/15 rounded px-1 font-mono">
              {formatCLP(realTotalComm)}
            </span>
            <span className="block text-[7px] sm:text-[8px] text-[#4c018c] font-bold uppercase mt-1.5 flex items-center justify-center space-x-0.5 bg-[#4c018c]/20 px-2 py-0.5 rounded-full select-none font-sans">
              <Sparkles className="w-2.5 h-2.5 text-[#4c018c] animate-pulse shrink-0" />
              <span>Suma Real</span>
            </span>
          </div>
        </div>

        {currentPercentage < 70 && prepagoPercentage < 70 ? (
          <div className="mt-4 bg-[#4c018c]/10 text-[#4c018c] p-3 rounded-xl text-center text-xs font-semibold border border-[#4c018c]/20 leading-relaxed">
            ⚠️ Alerta: Ninguno de tus cumplimientos alcanza el <strong>70% mínimo</strong> necesario para activar el pago de comisiones. ¡Sigue registrando ventas!
          </div>
        ) : currentPercentage < 70 ? (
          <div className="mt-4 bg-[#4c018c]/10 text-[#4c018c] p-3 rounded-xl text-center text-xs font-semibold border border-[#4c018c]/20 leading-relaxed">
            ⚠️ Alerta Postpago: Tu cumplimiento Postpago ({currentPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Prepago.
          </div>
        ) : prepagoPercentage < 70 ? (
          <div className="mt-4 bg-[#4c018c]/10 text-[#4c018c] p-3 rounded-xl text-center text-xs font-semibold border border-[#4c018c]/20 leading-relaxed">
            ⚠️ Alerta Prepago: Tu cumplimiento Prepago ({prepagoPercentage.toFixed(1)}%) es inferior al <strong>70% mínimo</strong>. Solo comisionarás la parte de Postpago.
          </div>
        ) : (
          <div className="mt-4 bg-[#4c018c]/10 text-[#4c018c] p-3 rounded-xl text-center text-xs font-semibold border border-[#4c018c]/20 leading-relaxed">
            🎉 ¡Excelente! Ambos cumplimientos superan el <strong>70% mínimo</strong> obligatorio. ¡Incentivos y bonos 100% activos!
          </div>
        )}
      </section>

      {/* 2. Interactive Commission Slider (Real-time recalculation) */}
      <section className="bg-white p-5 rounded-2xl border border-[#4c018c]/15 space-y-4 shadow-lg text-[#4c018c]">
        <div className="flex items-center space-x-2.5">
          <div id="simulated-commission-icon" className="w-8 h-8 rounded-lg bg-[#4c018c]/10 border border-[#4c018c]/15 flex items-center justify-center text-[#4c018c]">
            <Sliders className="w-4 h-4 text-[#4c018c]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#4c018c] uppercase tracking-widest">
              Simulador Interactivo de Tramo
            </h3>
            <p className="text-[10px] text-[#4c018c]/80 font-semibold">
              Proyecta tus ingresos mensuales fácilmente
            </p>
          </div>
        </div>

        <p className="text-xs text-[#4c018c]/95 leading-relaxed font-normal">
          Mueve el deslizador para proyectar tus comisiones. El simulador calculará tu bono Postpago, Prepago y Sumatoria Total conforme a los anexos de cumplimiento del mes:
        </p>

        {/* Simulator Outputs Group */}
        <div className="bg-[#4c018c]/5 border border-[#4c018c]/15 p-4 rounded-xl grid grid-cols-4 gap-2.5 text-center text-[#4c018c]">
          <div className="flex flex-col items-center justify-center border-r border-[#4c018c]/20 pr-1">
            <span className="text-[9px] text-[#4c018c]/80 font-bold uppercase tracking-widest block mb-0.5">Meta %</span>
            <span className="text-sm font-bold text-[#4c018c]">{simulatedPct}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-[#4c018c]/20 px-1">
            <span className="text-[9px] text-[#4c018c]/80 font-bold uppercase tracking-widest block mb-0.5">Postpago</span>
            <span className="text-xs font-black text-[#4c018c] font-mono">{formatCLP(simComm.postpago)}</span>
          </div>
          <div className="flex flex-col items-[#4c018c] justify-center border-r border-[#4c018c]/20 px-1">
            <span className="text-[9px] text-[#4c018c]/80 font-bold uppercase tracking-widest block mb-0.5">Prepago</span>
            <span className="text-xs font-black text-[#4c018c] font-mono">{formatCLP(simComm.prepago)}</span>
          </div>
          <div className="flex flex-col items-[#4c018c] justify-center pl-1">
            <span className="text-[9px] text-[#4c018c]/85 font-black uppercase tracking-widest block mb-0.5">Sim. Suma</span>
            <span className="text-xs font-black text-[#4c018c] font-mono">{formatCLP(simComm.total)}</span>
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
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#4c018c] focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-[#4c018c]/80 font-bold uppercase tracking-wider select-none px-0.5">
            <span className="text-[#4c018c]">70% ({formatCLP(110000)})</span>
            <span>100%</span>
            <span>130%</span>
            <span className="text-[#4c018c] font-black pb-0.5">160% ({formatCLP(440000)})</span>
          </div>
        </div>
      </section>

      {/* 3. Period Selection & Historical Logger Card (NOW PLACED IN BOTTOM PART) */}
      <section className="bg-white rounded-2xl border border-[#4c018c]/15 p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-lg text-[#4c018c]">
        <div className="flex items-center justify-between gap-1.5 border-b border-[#4c018c]/15 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 sm:p-2 bg-[#4c018c]/10 text-[#4c018c] rounded-lg">
              <Calendar className="w-4 h-4 text-[#4c018c]" />
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#4c018c] uppercase tracking-widest">Periodo de Rentabilidad</h3>
              <p className="hidden xs:block text-[9px] text-[#4c018c]/80 font-medium uppercase tracking-wider">Define el mes y guarda históricos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          {/* Month selector dropdown */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-[#4c018c]/80 uppercase tracking-widest pl-1">Mes Seleccionado</label>
            <div className="flex space-x-1.5">
              <select
                value={currentMonth.split(' ')[0]}
                onChange={(e) => {
                  const parts = currentMonth.split(' ');
                  const year = parts[1] || '2026';
                  setCurrentMonth?.(e.target.value + ' ' + year);
                }}
                className="w-full p-2 bg-white hover:bg-[#4c018c]/5 text-[#4c018c] font-semibold text-xs rounded-lg border border-[#4c018c]/25 focus:outline-none focus:border-[#4c018c] transition-all cursor-pointer"
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m) => (
                  <option key={m} className="bg-white text-[#4c018c]" value={m}>{m}</option>
                ))}
              </select>
              <select
                value={currentMonth.split(' ')[1] || '2026'}
                onChange={(e) => {
                  const parts = currentMonth.split(' ');
                  const month = parts[0] || 'Mayo';
                  setCurrentMonth?.(month + ' ' + e.target.value);
                }}
                className="p-2 bg-white hover:bg-[#4c018c]/5 text-[#4c018c] font-semibold text-xs rounded-lg border border-[#4c018c]/25 focus:outline-none focus:border-[#4c018c] transition-all cursor-pointer"
              >
                {['2025', '2026', '2027', '2028'].map((y) => (
                  <option key={y} className="bg-white text-[#4c018c]" value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current metrics display */}
          <div className="space-y-1">
            <label className="text-[9px] font-semibold text-[#4c018c]/80 uppercase tracking-widest pl-1">Métricas a Grabar</label>
            <div className="p-1.5 px-2 bg-[#4c018c]/5 border border-[#4c018c]/20 rounded-lg text-[10px] sm:text-xs space-y-1 font-bold text-[#4c018c]">
              <div className="flex justify-between items-center">
                <span className="truncate">Pos: {totals?.points || 0}/{metaObjective} Pts</span>
                <span className="font-bold text-[#4c018c]">({currentPercentage.toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="truncate">Pre: {prepagosTotals?.points || 0}/{metaPrepagoObjective} Pts</span>
                <span className="font-bold text-[#4c018c]">({prepagoPercentage.toFixed(0)}%)</span>
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
              className="w-full py-2 px-3 bg-[#4c018c] hover:bg-[#4c018c]/90 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-[#4c018c]/15"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>Guardar Historial</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Historial Mensual Display Section (NOW PLACED IN BOTTOM PART) */}
      {monthlyHistory && monthlyHistory.length > 0 && (
        <section className="bg-white rounded-2xl border border-[#4c018c]/15 p-5 space-y-3 shadow-lg text-[#4c018c]">
          <div className="flex items-center space-x-2 border-b border-[#4c018c]/15 pb-2.5">
            <span className="p-1.5 bg-[#4c018c]/10 text-[#4c018c] rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#4c018c]" />
            </span>
            <div>
              <h4 className="font-bold text-[#4c018c] text-xs uppercase tracking-widest font-display">Historial de Ventas y Metas por Mes</h4>
              <p className="text-[9px] text-[#4c018c]/80 font-semibold mt-0.5 uppercase tracking-wider">Registro permanente de los periodos cerrados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {monthlyHistory.map((hist) => {
              const isPostpagoActive = hist.postpagoPercent >= 70;
              const isPrepagoActive = hist.prepagoPercent >= 70;

              return (
                <div 
                  key={hist.id}
                  className="bg-[#4c018c]/5 hover:bg-[#4c018c]/10 border border-[#4c018c]/10 rounded-xl p-4 flex flex-col justify-between transition-all shadow-md text-[#4c018c]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#4c018c]">{hist.monthName}</span>
                      <p className="text-[9px] text-[#4c018c]/70 font-semibold mt-0.5">
                        Grabado el {new Date(hist.timestamp).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteMonthlyHistory?.(hist.id)}
                      className="p-1.5 text-[#4c018c]/70 hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Eliminar este mes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold text-[#4c018c]">
                    <div className="p-2 bg-white rounded-lg border border-[#4c018c]/10">
                      <span className="block text-[8px] font-bold text-[#4c018c]/80 uppercase tracking-widest mb-0.5">Móvil Pospago</span>
                      <span className="text-[#4c018c] font-black">{hist.postpagoPoints}/{hist.postpagoMeta} Pts</span>
                      <span className={`block text-[9px] font-bold mt-1 uppercase ${isPostpagoActive ? 'text-teal-600 font-extrabold' : 'text-rose-600'}`}>
                        {hist.postpagoPercent.toFixed(1)}% {isPostpagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-[#4c018c]/10">
                      <span className="block text-[8px] font-bold text-[#4c018c]/80 uppercase tracking-widest mb-0.5">Prepago (Meta)</span>
                      <span className="text-[#4c018c] font-black">{hist.prepagoPoints}/{hist.prepagoMeta} Pts</span>
                      <span className={`block text-[9px] font-bold mt-1 uppercase ${isPrepagoActive ? 'text-teal-600 font-extrabold' : 'text-rose-600'}`}>
                        {hist.prepagoPercent.toFixed(1)}% {isPrepagoActive ? '✔ Activo' : '❌ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#4c018c]/10 flex justify-between items-center bg-[#4c018c]/10 px-3 py-1.5 rounded-lg">
                    <span className="text-[9px] text-[#4c018c]/80 font-bold uppercase tracking-wider">Comisión Estimada</span>
                    <span className="text-xs font-black text-[#4c018c] font-mono">{formatCLP(hist.totalCommission)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      
    </div>
  );
}
