import React from 'react';
import { Download, Sparkles, TrendingUp, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface InputSummaryDashboardProps {
  currentFulfillmentPercent: number;
  prepagoFulfillmentPercent: number;
  totals: {
    postpago: number;
    porta_pos_15990: number;
    porta: number;
    portaPre8: number;
    nuevo: number;
    renov: number;
    points: number;
  };
  prepagosTotals: {
    activos: number;
    cargados: number;
    points: number;
  };
  metaObjective: number;
  metaPrepagoObjective: number;
  currentMonth: string;
  currentUser: string | null;
}

export default function InputSummaryDashboard({
  currentFulfillmentPercent,
  prepagoFulfillmentPercent,
  totals,
  prepagosTotals,
  metaObjective,
  metaPrepagoObjective,
  currentMonth,
  currentUser
}: InputSummaryDashboardProps) {

  // Exact commission formulas matching the Annex scales
  const getPostpagoComm = (pct: number) => {
    const rounded = Math.round(pct);
    if (rounded < 70) return 0;
    const effPct = Math.min(160, rounded);
    return Math.round(77000 + (effPct - 70) * (77000 / 30));
  };

  const getPrepagoComm = (pct: number) => {
    const rounded = Math.round(pct);
    if (rounded < 70) return 0;
    const effPct = Math.min(160, rounded);
    return Math.round(33000 + (effPct - 70) * 1100);
  };

  const postpagoComm = getPostpagoComm(currentFulfillmentPercent);
  const prepagoComm = getPrepagoComm(prepagoFulfillmentPercent);
  const totalComm = postpagoComm + prepagoComm;

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // PDF Dashboard Generator
  const handleExportSummaryDashboardPDF = () => {
    return;
    /*
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [76, 29, 149]; // Deep purple (purple-900)
      const accentColor = [139, 92, 246]; // Medium purple (purple-500)
      const textDark = [30, 27, 36];
      const successColor = [124, 58, 237]; // Purple variant as success state or standard emerald if preferred. Let's use a nice purple-themed success indicator.
      const warningColor = [167, 139, 250]; // Lighter purple for warning/under-limits to stay fully in theme

      // 1. CORPORATE HEADER BANNER
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 48, 'F');

      // Decorative Magenta Stripe on the bottom of header
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 46, 210, 2, 'F');

      // Web/App Badge Icon
      doc.setFillColor(255, 255, 255, 0.15);
      doc.roundedRect(14, 10, 12, 12, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("W", 18, 18.5);

      // Program Title & Date
      doc.setFontSize(16);
      doc.text("DASHBOARD EXPRESS DE RENTABILIDAD", 32, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(215, 195, 245);
      doc.text("Meta WOM • Control de Rentabilidad e Ingresos por Ventas Realizadas", 32, 24);

      // Advisor Profile Box inside header
      doc.setFillColor(255, 255, 255, 0.12);
      doc.roundedRect(15, 30, 180, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const rawUser = currentUser || 'Asesor';
      const formattedUser = rawUser
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      doc.text(`ASESOR:  ${formattedUser.toUpperCase()}`, 20, 36.5);
      doc.text(`MES DE REPORTE:  ${currentMonth.toUpperCase()}`, 90, 36.5);
      doc.text(`TIPO: TRABAJO DIRECTO EN TERRENO`, 145, 36.5);

      // 2. DASHBOARD BODY HEADER
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("I. CONDICIÓN RECOLECTADA Y PORCENTAJES DE METAS", 15, 59);

      // --- COLUMN 1: POSTPAGO METRICS CARD ---
      doc.setFillColor(248, 247, 250);
      doc.setDrawColor(225, 220, 235);
      doc.roundedRect(15, 64, 88, 52, 4, 4, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("MÓVIL POSPAGO (Puntos acumulados)", 20, 71);

      doc.setFontSize(18);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`${totals.points} Pts`, 20, 81);
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 120);
      doc.text(`Objetivo exigido: ${metaObjective} Pts`, 20, 86);

      // Percentage Progress bar outline
      doc.setFillColor(230, 225, 240);
      doc.roundedRect(20, 91, 78, 5, 2.5, 2.5, 'F');
      
      // Progress fill
      const postPercentWidth = Math.min(100, (totals.points / metaObjective) * 100);
      if (postPercentWidth > 0) {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(20, 91, (postPercentWidth / 100) * 78, 5, 2.5, 2.5, 'F');
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${currentFulfillmentPercent.toFixed(1)}% Cumplido`, 20, 101);

      // Status Badge
      const isPostActive = currentFulfillmentPercent >= 70;
      doc.setFillColor(isPostActive ? successColor[0] : warningColor[0], isPostActive ? successColor[1] : warningColor[1], isPostActive ? successColor[2] : warningColor[2], 0.15);
      doc.roundedRect(20, 104, 38, 5, 1, 1, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(isPostActive ? primaryColor[0] : warningColor[0], isPostActive ? successColor[1] : warningColor[1], isPostActive ? successColor[2] : warningColor[2]);
      doc.text(isPostActive ? "✔ COMISIONABLE (70%+)" : "⚠ BAJO EL LÍMITE (<70%)", 22, 108);

      // --- COLUMN 2: PREPAGO METRICS CARD ---
      doc.setFillColor(250, 248, 253);
      doc.setDrawColor(230, 220, 245);
      doc.roundedRect(107, 64, 88, 52, 4, 4, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("MÓVIL PREPAGO (Puntos acumulados)", 112, 71);

      doc.setFontSize(18);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`${prepagosTotals.points} Pts`, 112, 81);
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 120);
      doc.text(`Objetivo exigido: ${metaPrepagoObjective} Pts`, 112, 86);

      // Percentage Progress bar outline
      doc.setFillColor(240, 230, 250);
      doc.roundedRect(112, 91, 78, 5, 2.5, 2.5, 'F');
      
      // Progress fill
      const prePercentWidth = Math.min(100, (prepagosTotals.points / metaPrepagoObjective) * 100);
      if (prePercentWidth > 0) {
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(112, 91, (prePercentWidth / 100) * 78, 5, 2.5, 2.5, 'F');
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`${prepagoFulfillmentPercent.toFixed(1)}% Cumplido`, 112, 101);

      // Status Badge
      const isPreActive = prepagoFulfillmentPercent >= 70;
      doc.setFillColor(isPreActive ? successColor[0] : warningColor[0], isPreActive ? successColor[1] : warningColor[1], isPreActive ? successColor[2] : warningColor[2], 0.15);
      doc.roundedRect(112, 104, 38, 5, 1, 1, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(isPreActive ? primaryColor[0] : warningColor[0], isPreActive ? successColor[1] : warningColor[1], isPreActive ? successColor[2] : warningColor[2]);
      doc.text(isPreActive ? "✔ COMISIONABLE (70%+)" : "⚠ BAJO EL LÍMITE (<70%)", 114, 108);

      // 3. INCOME / REVENUE (INGRESOS) ACCUMULATED
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("II. DETALLE DE INGRESOS ESTIMADOS DEL PERIODO", 15, 127);

      // Giant Consolidated Commission Card
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Purple Theme
      doc.roundedRect(15, 132, 180, 28, 5, 5, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(215, 195, 245);
      doc.text("PRODUCTO TOTAL ESTIMADO DE COMISIONES (INGRESOS ACUMULADOS)", 21, 139);

      doc.setFontSize(21);
      doc.setTextColor(255, 255, 255);
      doc.text(formatCLP(totalComm), 21, 151);

      // Quick sub breakdown items on right side of consolidated block
      doc.setFont("helvetica", "medium");
      doc.setFontSize(8.5);
      doc.setTextColor(230, 220, 245);
      doc.text(`Móvil Pospago: ${formatCLP(postpagoComm)}`, 128, 142);
      doc.text(`Móvil Prepago: ${formatCLP(prepagoComm)}`, 128, 149);

      // Dynamic warning message in consolidated card
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(253, 224, 71); // Yellow
      if (currentFulfillmentPercent < 70 && prepagoFulfillmentPercent < 70) {
        doc.text("⚠ ATENCIÓN: Ambos segmentos se encuentran bajo el límite mínimo de 70% para pago de comisión.", 21, 156);
      } else if (currentFulfillmentPercent < 70) {
        doc.text("⚠ ALERTA SECTORIAL: Pospago se encuentra bajo el 70%. Solo se pagarán comisiones de Prepago.", 21, 156);
      } else if (prepagoFulfillmentPercent < 70) {
        doc.text("⚠ ALERTA SECTORIAL: Prepago se encuentra bajo el 70%. Solo se pagarán comisiones de Pospago.", 21, 156);
      } else {
        doc.text("✔ EXCELENTE: ¡Ambos segmentos superan el 70%! Comisión total unificada desbloqueada al 100%.", 21, 156);
      }

      // 4. BREAKDOWN DETAILS TABLE OF TRANSACTIONS ENTERED
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("III. COMPONENTES DEL DASHBOARD (DATOS EN SISTEMA)", 15, 171);

      // Table Headers
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, 176, 180, 7.5, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("UNIDAD DE REGISTRO / PRODUCTO", 18, 181);
      doc.text("CANTIDAD", 132, 181);
      doc.text("TOTAL PUNTOS", 165, 181);

      let dy = 191;
      const addDashboardRow = (concept: string, count: number, pts: number, isPre: boolean) => {
        doc.setFillColor(dy % 13 === 10 ? 255 : 248, 248, 250);
        doc.rect(15, dy - 4.5, 180, 7, 'F');
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 65);
        doc.text(concept, 18, dy);
        doc.text(String(count), 134, dy);
        doc.setFont("helvetica", "bold");
        const activeColor = isPre ? accentColor : primaryColor;
        doc.setTextColor(activeColor[0], activeColor[1], activeColor[2]);
        doc.text(`${pts} Pts`, 167, dy);
        doc.setDrawColor(235, 235, 240);
        doc.line(15, dy + 2.5, 195, dy + 2.5);
        dy += 7;
      };

      // Add Pospago lines
      addDashboardRow("Portabilidad Postpago Comercial (16 Pts)", totals.postpago, totals.postpago * 16, false);
      addDashboardRow("Portabilidad Postpago Plan $15.990 (15 Pts)", totals.porta_pos_15990, totals.porta_pos_15990 * 15, false);
      addDashboardRow("Portabilidad Tradicional Postpago (9 Pts)", totals.porta, totals.porta * 9, false);
      addDashboardRow("Portabilidad Prepago a Postpago (8 Pts)", totals.portaPre8, totals.portaPre8 * 8, false);
      addDashboardRow("Alta Nueva Comercial (3 Pts)", totals.nuevo, totals.nuevo * 3, false);
      
      const renovPts = totals.points >= (metaObjective * 0.95) ? 5 : 3;
      addDashboardRow(`Renovación Postpago (${renovPts} Pts)`, totals.renov, totals.renov * renovPts, false);

      // Add Prepago lines
      addDashboardRow("Prepago Activos (1 Pt)", prepagosTotals.activos, prepagosTotals.activos * 1, true);
      addDashboardRow("Prepago Cargados (3 Pts)", prepagosTotals.cargados, prepagosTotals.cargados * 3, true);

      // Summary lines at bottom of table
      doc.setFillColor(238, 235, 245);
      doc.rect(15, dy - 4.5, 180, 7.5, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("TOTAL PUNTOS CONSOLIDADOS (POS + PRE)", 18, dy.valueOf());
      doc.text(`${totals.points + prepagosTotals.points} Pts`, 167, dy.valueOf());

      // 5. REGULATORY NOTE
      dy += 13;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("CONDICIONES DEL ANEXO DE REMUNERACIONES:", 15, dy);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 105);
      
      const rules = [
        "• El pago de remuneración por concepto de móvil pospago exige alcanzar como mínimo un 70% de cumplimiento.",
        "• El pago de venta prepago exige alcanzar como mínimo un 70% de cumplimiento respecto de la meta prepago definida.",
        "• Este reporte es interno, provisto por el Sistema de Control Comercial y no constituye liquidación legal de sueldo."
      ];

      rules.forEach(rule => {
        dy += 4;
        doc.text(rule, 15, dy);
      });

      // Footer line
      doc.setDrawColor(210, 210, 215);
      doc.line(15, 275, 195, 275);
      doc.setFontSize(7);
      doc.text("Generado automáticamente por Meta WOM APP • Conectado a la base de datos Firestore de Progestión", 15, 279);
      doc.text("Santiago de Chile", 185, 279);

      doc.save(`Folleto_Fulfillment_Dashboard_${currentMonth.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("Fallo al exportar reporte dashboard:", e);
    }
    */
  };

  const isPostpagoActive = currentFulfillmentPercent >= 70;
  const isPrepagoActive = prepagoFulfillmentPercent >= 70;

  return (
    <div className="bg-white rounded-3xl p-4.5 sm:p-6 text-[#4c018c] border border-[#4c018c]/15 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4c018c]/15 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#4c018c]/5 text-[#4c018c] rounded-xl shadow-sm border border-[#4c018c]/10">
            <TrendingUp className="w-5 h-5 text-[#4c018c]" />
          </div>
          <div>
            <h3 className="font-extrabold text-[13px] sm:text-sm text-[#4c018c] uppercase tracking-tight flex items-center gap-1">
              <span>Control Interno de Metas</span>
              <Sparkles className="w-3.5 h-3.5 text-[#4c018c] animate-pulse shrink-0" />
            </h3>
            <p className="text-xs text-[#4c018c]/85 font-black uppercase tracking-wide">
              Resumen acumulado instantáneo en base a tus registros ({currentMonth})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Postpago Micro widget */}
        <div className="bg-white border border-[#4c018c]/15 rounded-2xl p-3.5 space-y-2.5 hover:border-[#4c018c]/30 transition-colors shadow-md text-[#4c018c]">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-[#4c018c]/90 uppercase font-black tracking-wider">Móvil Pospago</span>
            <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${isPostpagoActive ? 'bg-emerald-550/10 text-emerald-800 border border-emerald-555/20' : 'bg-rose-550/10 text-rose-700 border border-rose-555/20'}`}>
              {isPostpagoActive ? '✔ Activo' : '⏳ Inactivo'}
            </span>
          </div>
          <div className="flex items-baseline justify-between select-none">
            <span className="text-2xl font-black text-[#4c018c]">{totals.points} <span className="text-xs font-semibold text-[#4c018c]/60">/ {metaObjective} Pts</span></span>
            <span className="text-base font-black text-[#4c018c]/80">{currentFulfillmentPercent.toFixed(0)}%</span>
          </div>
          {/* Simple HTML bar */}
          <div className="w-full h-1.5 bg-[#4c018c]/10 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, currentFulfillmentPercent)}%` }}
              className="h-full bg-[#4c018c] rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center pt-0.5 border-t border-[#4c018c]/15 text-xs text-[#4c018c]/90 font-bold">
            <span className="text-[#4c018c]/80 font-normal">Comisión Estimada:</span>
            <span className="font-extrabold text-[#4c018c] bg-[#4c018c]/5 rounded px-1.5 py-0.5 font-mono">{formatCLP(postpagoComm)}</span>
          </div>
        </div>

        {/* Prepago Micro widget */}
        <div className="bg-white border border-[#4c018c]/15 rounded-2xl p-3.5 space-y-2.5 hover:border-[#4c018c]/30 transition-colors shadow-md text-[#4c018c]">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-[#4c018c]/90 uppercase font-black tracking-wider">Móvil Prepago</span>
            <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${isPrepagoActive ? 'bg-emerald-555/10 text-emerald-800 border border-emerald-555/20' : 'bg-rose-555/10 text-rose-700 border border-rose-555/20'}`}>
              {isPrepagoActive ? '✔ Activo' : '⏳ Inactivo'}
            </span>
          </div>
          <div className="flex items-baseline justify-between select-none">
            <span className="text-2xl font-black text-[#4c018c]">{prepagosTotals.points} <span className="text-xs font-semibold text-[#4c018c]/60">/ {metaPrepagoObjective} Pts</span></span>
            <span className="text-base font-black text-[#4c018c]/80">{prepagoFulfillmentPercent.toFixed(0)}%</span>
          </div>
          {/* Simple HTML bar */}
          <div className="w-full h-1.5 bg-[#4c018c]/10 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, prepagoFulfillmentPercent)}%` }}
              className="h-full bg-[#4c018c]/85 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex justify-between items-center pt-0.5 border-t border-[#4c018c]/15 text-xs text-[#4c018c]/90 font-bold">
            <span className="text-[#4c018c]/80 font-normal">Comisión Estimada:</span>
            <span className="font-extrabold text-[#4c018c] bg-[#4c018c]/5 rounded px-1.5 py-0.5 font-mono">{formatCLP(prepagoComm)}</span>
          </div>
        </div>

        {/* Unified Revenue Consolidated widget */}
        <div className="bg-white border border-[#4c018c]/20 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-slate-50 transition-all shadow-md text-[#4c018c]">
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-[12.5px] text-[#4c018c]/80 uppercase font-black tracking-wider">Ingresos Consolidados</span>
          </div>
          
          <div className="my-1.5">
            <span className="block text-[10.5px] text-[#4c018c]/85 uppercase font-bold tracking-wider">Monto Real de Comisión</span>
            <span className="text-2xl font-black text-[#4c018c] tracking-tight select-all font-mono">
              {formatCLP(totalComm)}
            </span>
          </div>

          <div className="pt-2 border-t border-[#4c018c]/15 flex items-center justify-between text-xs font-black text-[#4c018c]/80 uppercase">
            {(!isPostpagoActive && !isPrepagoActive) ? (
              <span className="flex items-center gap-1 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>Requiere 70% en algún sector</span>
              </span>
            ) : (!isPostpagoActive || !isPrepagoActive) ? (
              <span className="flex items-center gap-1 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Un sector comisionable</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ambas comisiones sumando</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
