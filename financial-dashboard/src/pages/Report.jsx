import React, { useContext, useState } from 'react';
import FinancialContext from '../context/FinancialContext';
import { ANNI } from '../context/FinancialContext';
import { Download, FileText, TrendingUp, Scale, Target, AlertTriangle, BarChart2, LineChart, FileSpreadsheet } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const sum   = (...args) => args.reduce((a, b) => a + (b || 0), 0);
const fmt   = (n) => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';
const fmtK  = (n) => {
  const v = n || 0;
  if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000)    return (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString('it-IT');
};
const fmtPDF = (n) => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';

const Row = ({ label, value, color, bold }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontWeight: bold ? 700 : 400,
  }}>
    <span style={{ color: bold ? 'var(--text-bright)' : 'var(--text)', fontSize: '0.87rem' }}>{label}</span>
    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.87rem', color: color || (bold ? 'var(--text-bright)' : 'var(--text)') }}>
      {fmt(value)}
    </span>
  </div>
);

const computeCE = (ce) => {
  const totaleA        = sum(ce.ricaviVendite, ce.variazioneProdotti, ce.variazioneWIP, ce.incrementoImmobilizzazioni, ce.altriRicavi, ce.contributiConto, ce.plusvalenzeAlienazioni, ce.canoniLocazione, ce.interessiAttivi, ce.dividendi, ce.proventiFinanziari);
  const costiAcquisti  = sum(ce.acquistiMerci, ce.acquistMateriePrime, ce.variazioneRimanenzeMerci);
  const costiServizi   = sum(ce.serviziEsterniAmm, ce.utenzeTel, ce.consulenze, ce.assicurazioni, ce.manutRiparazioni, ce.serviziMarketing);
  const costiGodimento = sum(ce.godimentoBeniTerzi, ce.fittiBeni, ce.leasing);
  const costiPersonale = sum(ce.salariStipendi, ce.oneriSociali, ce.tfr, ce.altriCostPersonale);
  const ammortamenti   = sum(ce.ammortImmMateriali, ce.ammortImmImmateriali, ce.svalutazioniCrediti, ce.altriAccantonamenti);
  const totaleB        = sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ammortamenti, ce.oneriDiversiGestione);
  const ebitda         = totaleA - sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ce.oneriDiversiGestione);
  const ebit           = ebitda - ammortamenti;
  const oneriFinanziari = sum(ce.oneriInteressi, ce.oneriMutui, ce.oneriLeasing, ce.perditeValori);
  const totaleImposte  = sum(ce.irap, ce.ires, ce.altreImposte);
  const utile          = ebit - oneriFinanziari - totaleImposte;
  return { totaleA, totaleB, ebitda, ebit, oneriFinanziari, totaleImposte, utile, costiAcquisti, costiServizi, costiGodimento, costiPersonale, ammortamenti };
};

const computeSP = (sp) => {
  const totaleImmobilizzato = sum(sp.fabbricati, sp.impianti, sp.macchinari, sp.attrezzature, sp.autoveicoli, sp.avviamento, sp.brevetti, sp.immImmateriali, sp.partecipazioni, sp.creditiFinanzLungo, sp.immFinanziarie);
  const disponibilita       = sum(sp.cassa, sp.bancaCC, sp.altreDisponibilita, sp.titoliQuotati);
  const crediti             = sum(sp.creditiClienti, sp.creditiAltri, sp.creditiTributo, sp.creditiPrevidenziali);
  const rimanenze           = sum(sp.rimanenzeMerci, sp.rimanenzeMP, sp.rimanenzeSemilavorati, sp.rimanenzeProdotti);
  const totaleCircolante    = sum(disponibilita, crediti, rimanenze, sp.risconiAttivi, sp.rateiAttivi);
  const totaleAttivo        = sum(totaleImmobilizzato, totaleCircolante);
  const patrimonioNetto     = sum(sp.capitaleSociale, sp.riservaLegale, sp.riserveStatutarie, sp.riserveStraodinarie, sp.utiliPrecedenti) - (sp.perditePrecedenti || 0);
  const debitiBreve         = sum(sp.debitiBanche, sp.debitiFornitori, sp.debitiTributari, sp.debitiPrevidenziali, sp.debitiVsDipendenti, sp.altriDebitiBreve);
  const debitiLungo         = sum(sp.mutui, sp.debitiLeasing, sp.obbligazioni, sp.debitiLungo);
  const fondi               = sum(sp.fondoTFR, sp.fondoRischi, sp.fondoImposte, sp.fondoSvalutazione);
  const totaleFonti         = sum(patrimonioNetto, debitiBreve, debitiLungo, fondi);
  return { totaleImmobilizzato, totaleCircolante, totaleAttivo, patrimonioNetto, debitiBreve, debitiLungo, fondi, totaleFonti };
};

const CHART_COLORS = {
  '2022-23': { bar: 'rgba(167,139,250,0.75)', border: '#a78bfa' },
  '2023-24': { bar: 'rgba(79,142,247,0.75)',  border: '#4f8ef7' },
  '2024-25': { bar: 'rgba(0,212,255,0.75)',   border: '#00d4ff' },
  '2025-26': { bar: 'rgba(15,212,148,0.75)',  border: '#0fd494' },
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#8899bb',
        font: { family: "'JetBrains Mono', monospace", size: 11 },
        boxWidth: 12, boxHeight: 12,
      },
    },
    tooltip: {
      backgroundColor: '#0f1524',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f0f4ff',
      bodyColor: '#8899bb',
      padding: 12,
      callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmtK(ctx.raw)} €` },
    },
  },
  scales: {
    x: {
      ticks: { color: '#6a7a9b', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: {
        color: '#6a7a9b',
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        callback: (v) => fmtK(v) + ' €',
      },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
};

const METRICHE_CE = [
  { key: 'totaleA', label: 'Valore Produzione', color: '#4f8ef7' },
  { key: 'ebitda',  label: 'EBITDA',            color: '#0fd494' },
  { key: 'ebit',    label: 'EBIT',              color: '#00d4ff' },
  { key: 'utile',   label: "Utile d'Esercizio", color: '#a78bfa' },
];

const METRICHE_SP = [
  { key: 'totaleAttivo',    label: 'Totale Attivo',    color: '#4f8ef7' },
  { key: 'patrimonioNetto', label: 'Patrimonio Netto', color: '#0fd494' },
  { key: 'debitiBreve',     label: 'Debiti Breve',     color: '#ff4d6a' },
  { key: 'debitiLungo',     label: 'Debiti Lungo',     color: '#ffb340' },
];

const Report = () => {
  const { state } = useContext(FinancialContext);
  const { contoEconomico: ce, statoPatrimoniale: sp, preventivo, anni } = state;
  const [chartView, setChartView] = useState('bar');

  const ceData = computeCE(ce);
  const spData = computeSP(sp);

  const datiStorici = ANNI.map(anno => ({
    anno,
    ce:   computeCE(anni[anno].contoEconomico),
    sp:   computeSP(anni[anno].statoPatrimoniale),
    prev: anni[anno].preventivo,
  }));

  const hasAnyData     = datiStorici.some(d => d.ce.totaleA > 0 || d.sp.totaleAttivo > 0);
  const hasCurrentData = ceData.totaleA > 0 || spData.totaleAttivo > 0;

  const barDataCE = {
    labels: METRICHE_CE.map(m => m.label),
    datasets: ANNI.map(anno => ({
      label: anno,
      data: METRICHE_CE.map(m => datiStorici.find(d => d.anno === anno).ce[m.key]),
      backgroundColor: CHART_COLORS[anno].bar,
      borderColor: CHART_COLORS[anno].border,
      borderWidth: 1, borderRadius: 5,
    })),
  };

  const lineDataCE = {
    labels: ANNI,
    datasets: METRICHE_CE.map(m => ({
      label: m.label,
      data: ANNI.map(anno => datiStorici.find(d => d.anno === anno).ce[m.key]),
      borderColor: m.color, backgroundColor: m.color + '18',
      pointBackgroundColor: m.color, pointRadius: 5, pointHoverRadius: 7,
      borderWidth: 2, tension: 0.35, fill: false,
    })),
  };

  const barDataSP = {
    labels: METRICHE_SP.map(m => m.label),
    datasets: ANNI.map(anno => ({
      label: anno,
      data: METRICHE_SP.map(m => datiStorici.find(d => d.anno === anno).sp[m.key]),
      backgroundColor: CHART_COLORS[anno].bar,
      borderColor: CHART_COLORS[anno].border,
      borderWidth: 1, borderRadius: 5,
    })),
  };

  const lineDataSP = {
    labels: ANNI,
    datasets: METRICHE_SP.map(m => ({
      label: m.label,
      data: ANNI.map(anno => datiStorici.find(d => d.anno === anno).sp[m.key]),
      borderColor: m.color, backgroundColor: m.color + '18',
      pointBackgroundColor: m.color, pointRadius: 5, pointHoverRadius: 7,
      borderWidth: 2, tension: 0.35, fill: false,
    })),
  };

  const exportPDF = () => {
    const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw     = doc.internal.pageSize.getWidth();
    const ph     = doc.internal.pageSize.getHeight();
    const margin = 18;
    const col    = pw - margin * 2;
    let y        = margin;

    const addPage  = () => { doc.addPage(); y = margin; };
    const checkY   = (needed = 10) => { if (y + needed > ph - margin) addPage(); };

    const drawHeader = () => {
      doc.setFillColor(245, 247, 252);
      doc.rect(0, 0, pw, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 40, 80);
      doc.text('FinDash — Prospetto Finanziario', margin, 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 155);
      doc.text(
        `Generato il ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}  |  Esercizi ${ANNI[0]} – ${ANNI[ANNI.length - 1]}`,
        pw - margin, 14, { align: 'right' }
      );
      doc.setDrawColor(200, 210, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, 22, pw - margin, 22);
      y = 32;
    };

    const sectionTitle = (title, color = [30, 40, 80]) => {
      checkY(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...color);
      doc.text(title, margin, y);
      doc.setDrawColor(...color, 80);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1.5, pw - margin, y + 1.5);
      y += 7;
    };

    drawHeader();
    sectionTitle('RIEPILOGO KPI — CONFRONTO STORICO ' + ANNI[0] + ' / ' + ANNI[ANNI.length - 1]);

    autoTable(doc, {
      startY: y,
      head: [['Metrica', ...ANNI]],
      body: [
        ['Valore della Produzione', ...datiStorici.map(d => fmtPDF(d.ce.totaleA))],
        ['EBITDA',                  ...datiStorici.map(d => fmtPDF(d.ce.ebitda))],
        ['EBIT',                    ...datiStorici.map(d => fmtPDF(d.ce.ebit))],
        ["Utile d'Esercizio",       ...datiStorici.map(d => fmtPDF(d.ce.utile))],
        ['Totale Attivo',           ...datiStorici.map(d => fmtPDF(d.sp.totaleAttivo))],
        ['Patrimonio Netto',        ...datiStorici.map(d => fmtPDF(d.sp.patrimonioNetto))],
        ['Debiti a Breve',          ...datiStorici.map(d => fmtPDF(d.sp.debitiBreve))],
        ['Debiti a Lungo',          ...datiStorici.map(d => fmtPDF(d.sp.debitiLungo))],
      ],
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3.5, textColor: [40, 50, 80] },
      headStyles: { fillColor: [235, 240, 255], textColor: [30, 40, 100], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 52 },
        1: { halign: 'right' }, 2: { halign: 'right' },
        3: { halign: 'right' }, 4: { halign: 'right' },
      },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const keys    = ['totaleA','ebitda','ebit','utile','totaleAttivo','patrimonioNetto','debitiBreve','debitiLungo'];
          const sources = [d => d.ce, d => d.ce, d => d.ce, d => d.ce, d => d.sp, d => d.sp, d => d.sp, d => d.sp];
          const val     = sources[data.row.index](datiStorici[data.column.index - 1])[keys[data.row.index]];
          if (val < 0) data.cell.styles.textColor = [200, 40, 40];
          else if (val > 0 && [1,2,3,5].includes(data.row.index)) data.cell.styles.textColor = [20, 130, 80];
        }
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    ANNI.forEach((anno, idx) => {
      const d     = datiStorici[idx];
      const hasCE = d.ce.totaleA > 0;
      const hasSP = d.sp.totaleAttivo > 0;
      if (!hasCE && !hasSP) return;

      checkY(20);
      doc.setFillColor(235, 240, 255);
      doc.roundedRect(margin, y - 4, col, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 40, 100);
      doc.text(`ESERCIZIO ${anno}`, margin + 4, y + 3);
      y += 11;

      if (hasCE) {
        sectionTitle('Conto Economico — Art. 2425 c.c.', [20, 60, 160]);
        const ceRows = [
          ['A — Valore della Produzione',  fmtPDF(d.ce.totaleA),        true],
          ['  di cui: Ricavi Vendite',      fmtPDF(anni[anno].contoEconomico.ricaviVendite || 0), false],
          ['B — Costi della Produzione',   fmtPDF(d.ce.totaleB),        true],
          ['  di cui: Acquisti',           fmtPDF(d.ce.costiAcquisti),  false],
          ['  di cui: Servizi Esterni',    fmtPDF(d.ce.costiServizi),   false],
          ['  di cui: Personale',          fmtPDF(d.ce.costiPersonale), false],
          ['  di cui: Ammortamenti',       fmtPDF(d.ce.ammortamenti),   false],
          ['EBITDA',                       fmtPDF(d.ce.ebitda),         true],
          ['EBIT (Risultato Operativo)',   fmtPDF(d.ce.ebit),           true],
          ['C — Oneri Finanziari',         fmtPDF(d.ce.oneriFinanziari),false],
          ["E — Imposte d'Esercizio",      fmtPDF(d.ce.totaleImposte),  false],
          ["Utile / Perdita d'Esercizio",  fmtPDF(d.ce.utile),          true],
        ];
        autoTable(doc, {
          startY: y,
          head: [['Voce', 'Importo']],
          body: ceRows.map(r => [r[0], r[1]]),
          margin: { left: margin, right: margin },
          styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, textColor: [40, 50, 80] },
          headStyles: { fillColor: [220, 232, 255], textColor: [30, 40, 100], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: col * 0.72 }, 1: { halign: 'right', fontStyle: 'bold' } },
          alternateRowStyles: { fillColor: [250, 252, 255] },
          didParseCell: (data) => {
            if (data.section === 'body') {
              if (ceRows[data.row.index][2]) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 245, 255];
              }
              if (data.column.index === 1) {
                const vals = [d.ce.totaleA, anni[anno].contoEconomico.ricaviVendite, d.ce.totaleB,
                  d.ce.costiAcquisti, d.ce.costiServizi, d.ce.costiPersonale, d.ce.ammortamenti,
                  d.ce.ebitda, d.ce.ebit, d.ce.oneriFinanziari, d.ce.totaleImposte, d.ce.utile];
                if ((vals[data.row.index] || 0) < 0) data.cell.styles.textColor = [200, 40, 40];
              }
            }
          },
        });
        y = doc.lastAutoTable.finalY + 8;
      }

      if (hasSP) {
        checkY(20);
        sectionTitle('Stato Patrimoniale — Art. 2424 c.c.', [20, 100, 80]);
        const spRows = [
          ['ATTIVO', '', true],
          ['Immobilizzazioni (nette)', fmtPDF(d.sp.totaleImmobilizzato), false],
          ['Attivo Circolante',        fmtPDF(d.sp.totaleCircolante),    false],
          ['TOTALE ATTIVO',            fmtPDF(d.sp.totaleAttivo),        true],
          ['PASSIVO E NETTO', '', true],
          ['Patrimonio Netto',         fmtPDF(d.sp.patrimonioNetto),     false],
          ['Debiti a Breve Termine',   fmtPDF(d.sp.debitiBreve),         false],
          ['Debiti a Lungo Termine',   fmtPDF(d.sp.debitiLungo),         false],
          ['Fondi e TFR',              fmtPDF(d.sp.fondi),               false],
          ['TOTALE PASSIVO + NETTO',   fmtPDF(d.sp.totaleFonti),         true],
        ];
        const solidita = d.sp.totaleFonti > 0 ? ((d.sp.patrimonioNetto / d.sp.totaleFonti) * 100).toFixed(1) + '%' : '—';
        const leva     = (d.sp.debitiBreve + d.sp.debitiLungo) > 0 && d.sp.patrimonioNetto > 0
          ? ((d.sp.debitiBreve + d.sp.debitiLungo) / d.sp.patrimonioNetto).toFixed(2) + 'x'
          : '—';
        autoTable(doc, {
          startY: y,
          head: [['Voce', 'Importo']],
          body: spRows.map(r => [r[0], r[1]]),
          margin: { left: margin, right: margin },
          styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, textColor: [40, 50, 80] },
          headStyles: { fillColor: [215, 245, 225], textColor: [20, 80, 50], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: col * 0.72 }, 1: { halign: 'right', fontStyle: 'bold' } },
          alternateRowStyles: { fillColor: [248, 253, 250] },
          didParseCell: (data) => {
            if (data.section === 'body' && (spRows[data.row.index][2] || spRows[data.row.index][1] === '')) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [225, 245, 232];
              data.cell.styles.textColor = [20, 80, 50];
            }
          },
        });
        y = doc.lastAutoTable.finalY + 4;
        checkY(8);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 120, 150);
        doc.text(`Solidità patrimoniale: ${solidita}   |   Leva finanziaria: ${leva}`, margin, y);
        y += 10;
      }

      if (idx < ANNI.length - 1) {
        checkY(5);
        doc.setDrawColor(210, 220, 240);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pw - margin, y);
        y += 8;
      }
    });

    doc.setFillColor(245, 247, 252);
    doc.rect(0, ph - 14, pw, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 150, 175);
    doc.text('Report generato da FinDash — Denis Mascherin | Stage Front-End Developer 2026.', margin, ph - 5);
    doc.text(`Pagina ${doc.internal.getCurrentPageInfo().pageNumber}`, pw - margin, ph - 5, { align: 'right' });

    doc.save(`Report_Finanziario_${ANNI[0]}_${ANNI[ANNI.length - 1]}.pdf`);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const kpiRows = [
      ['Metrica', ...ANNI],
      ['Valore della Produzione', ...datiStorici.map(d => d.ce.totaleA)],
      ['EBITDA',                  ...datiStorici.map(d => d.ce.ebitda)],
      ['EBIT',                    ...datiStorici.map(d => d.ce.ebit)],
      ["Utile d'Esercizio",       ...datiStorici.map(d => d.ce.utile)],
      ['Totale Attivo',           ...datiStorici.map(d => d.sp.totaleAttivo)],
      ['Patrimonio Netto',        ...datiStorici.map(d => d.sp.patrimonioNetto)],
      ['Debiti a Breve',          ...datiStorici.map(d => d.sp.debitiBreve)],
      ['Debiti a Lungo',          ...datiStorici.map(d => d.sp.debitiLungo)],
    ];
    const wsKpi = XLSX.utils.aoa_to_sheet(kpiRows);
    wsKpi['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI Storico');

    ANNI.forEach(anno => {
      const d  = datiStorici.find(x => x.anno === anno);
      const ce = anni[anno].contoEconomico;

      const ceRows = [
        ['CONTO ECONOMICO — ' + anno, ''],
        ['Voce', 'Importo (€)'],
        ['A — Valore della Produzione',  d.ce.totaleA],
        ['  Ricavi Vendite',             ce.ricaviVendite || 0],
        ['  Variazione Prodotti',        ce.variazioneProdotti || 0],
        ['  Altri Ricavi',               ce.altriRicavi || 0],
        ['B — Costi della Produzione',   d.ce.totaleB],
        ['  Acquisti',                   d.ce.costiAcquisti],
        ['  Servizi Esterni',            d.ce.costiServizi],
        ['  Personale',                  d.ce.costiPersonale],
        ['  Ammortamenti',               d.ce.ammortamenti],
        ['EBITDA',                       d.ce.ebitda],
        ['EBIT',                         d.ce.ebit],
        ['Oneri Finanziari',             d.ce.oneriFinanziari],
        ["Imposte d'Esercizio",          d.ce.totaleImposte],
        ["Utile / Perdita d'Esercizio",  d.ce.utile],
        [''],
        ['STATO PATRIMONIALE — ' + anno, ''],
        ['Voce', 'Importo (€)'],
        ['Immobilizzazioni',    d.sp.totaleImmobilizzato],
        ['Attivo Circolante',   d.sp.totaleCircolante],
        ['TOTALE ATTIVO',       d.sp.totaleAttivo],
        ['Patrimonio Netto',    d.sp.patrimonioNetto],
        ['Debiti a Breve',      d.sp.debitiBreve],
        ['Debiti a Lungo',      d.sp.debitiLungo],
        ['Fondi e TFR',         d.sp.fondi],
        ['TOTALE FONTI',        d.sp.totaleFonti],
      ];

      const ws = XLSX.utils.aoa_to_sheet(ceRows);
      ws['!cols'] = [{ wch: 32 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, anno);
    });

    XLSX.writeFile(wb, `Report_Finanziario_${ANNI[0]}_${ANNI[ANNI.length - 1]}.xlsx`);
  };

  const tabStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '0.38rem 0.9rem', borderRadius: 'var(--radius-xs)',
    fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 700,
    cursor: 'pointer', border: '1px solid transparent',
    background: active ? 'rgba(79,142,247,0.12)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    borderColor: active ? 'rgba(79,142,247,0.32)' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--text-bright)', margin: 0 }}>
              <FileText size={28} color="var(--purple)" />
              Report Finanziario
            </h1>
            <p style={{ marginTop: 6 }}>Riepilogo consolidato e confronto storico 2022–2026</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={exportPDF}
              disabled={!hasAnyData}
              style={{ opacity: hasAnyData ? 1 : 0.4 }}
            >
              <Download size={16} /> Esporta PDF
            </button>
            <button
              onClick={exportExcel}
              disabled={!hasAnyData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: hasAnyData ? 'pointer' : 'not-allowed',
                border: '1px solid #1a6b35',
                background: 'linear-gradient(135deg, #1d7a3d, #166530)',
                color: '#ffffff',
                boxShadow: hasAnyData ? '0 0 18px rgba(29,122,61,0.4), 0 4px 14px rgba(0,0,0,0.4)' : 'none',
                opacity: hasAnyData ? 1 : 0.4,
                transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!hasAnyData) return;
                e.currentTarget.style.background = 'linear-gradient(135deg, #22913f, #1d7a3d)';
                e.currentTarget.style.boxShadow  = '0 0 30px rgba(29,122,61,0.6), 0 6px 20px rgba(0,0,0,0.5)';
                e.currentTarget.style.transform  = 'translateY(-2px) scale(1.01)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1d7a3d, #166530)';
                e.currentTarget.style.boxShadow  = '0 0 18px rgba(29,122,61,0.4), 0 4px 14px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform  = 'translateY(0) scale(1)';
              }}
            >
              <FileSpreadsheet size={16} /> Esporta Excel
            </button>
          </div>
        </div>
      </div>

      {!hasAnyData && (
        <div className="card animate-in" style={{ textAlign: 'center', padding: '3rem', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <AlertTriangle size={40} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-bright)', marginBottom: '0.5rem' }}>Nessun dato inserito</h3>
          <p style={{ color: 'var(--text-muted)' }}>Compila prima il Conto Economico o lo Stato Patrimoniale in almeno un esercizio.</p>
        </div>
      )}

      {hasAnyData && (
        <div>
          <div className="card animate-in" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
                <FileText size={28} color="#fff" />
              </div>
            </div>
            <h2 style={{ color: 'var(--text-bright)', marginBottom: '0.4rem', fontSize: '1.5rem', fontWeight: 800 }}>Prospetto Finanziario</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Generato il {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })} — Esercizi {ANNI[0]} / {ANNI[ANNI.length - 1]}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                📈 Confronto Storico — {ANNI[0]} / {ANNI[ANNI.length - 1]}
              </h3>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
                <button style={tabStyle(chartView === 'bar')}  onClick={() => setChartView('bar')}>  <BarChart2  size={13} /> Barre</button>
                <button style={tabStyle(chartView === 'line')} onClick={() => setChartView('line')}> <LineChart  size={13} /> Linee</button>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1.2rem' }}>
              <div className="storico-chart-wrap">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <TrendingUp size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--primary)' }} />Conto Economico
                </div>
                <div style={{ height: 260 }}>
                  {chartView === 'bar' ? <Bar data={barDataCE} options={chartOptions} /> : <Line data={lineDataCE} options={chartOptions} />}
                </div>
              </div>
              <div className="storico-chart-wrap">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <Scale size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--accent)' }} />Stato Patrimoniale
                </div>
                <div style={{ height: 260 }}>
                  {chartView === 'bar' ? <Bar data={barDataSP} options={chartOptions} /> : <Line data={lineDataSP} options={chartOptions} />}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '1.2rem', overflowX: 'auto' }}>
              <h4 style={{ color: 'var(--text-bright)', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Riepilogo KPI per Esercizio
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem 0.7rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Metrica</th>
                    {ANNI.map(anno => (
                      <th key={anno} style={{ padding: '0.5rem 0.7rem', textAlign: 'right', color: CHART_COLORS[anno].border, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '0.75rem' }}>{anno}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Valore Produzione', fn: d => d.ce.totaleA,         color: 'var(--primary)' },
                    { label: 'EBITDA',             fn: d => d.ce.ebitda,          color: 'var(--success)' },
                    { label: 'EBIT',               fn: d => d.ce.ebit,            color: 'var(--accent)'  },
                    { label: "Utile d'Esercizio",  fn: d => d.ce.utile,           color: 'var(--purple)'  },
                    { label: 'Totale Attivo',      fn: d => d.sp.totaleAttivo,    color: 'var(--primary)' },
                    { label: 'Patrimonio Netto',   fn: d => d.sp.patrimonioNetto, color: 'var(--success)' },
                  ].map(({ label, fn, color }) => (
                    <tr
                      key={label}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.5rem 0.7rem', color: 'var(--text)', fontSize: '0.82rem' }}>{label}</td>
                      {ANNI.map(anno => {
                        const v = fn(datiStorici.find(x => x.anno === anno));
                        return (
                          <td key={anno} style={{ padding: '0.5rem 0.7rem', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600, color: v === 0 ? 'var(--text-muted)' : v < 0 ? 'var(--danger)' : color, fontSize: '0.8rem' }}>
                            {v === 0 ? '—' : fmt(v)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {hasCurrentData && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2rem 0 1rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Dettaglio Esercizio {state.annoSelezionato}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card animate-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                    <TrendingUp size={18} color="var(--primary)" />
                    <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Conto Economico</h3>
                  </div>
                  <Row label="Valore della Produzione"     value={ceData.totaleA} />
                  <Row label="Totale Costi Operativi"      value={ceData.totaleB} />
                  <Row label="EBITDA"                      value={ceData.ebitda}          color={ceData.ebitda >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
                  <Row label="EBIT (Risultato Operativo)"  value={ceData.ebit}            color={ceData.ebit   >= 0 ? 'var(--accent)'  : 'var(--danger)'} />
                  <Row label="Oneri Finanziari"            value={ceData.oneriFinanziari}  color="var(--warning)" />
                  <Row label="Imposte"                     value={ceData.totaleImposte}    color="var(--danger)" />
                  <Row label="Utile / Perdita d'Esercizio" value={ceData.utile}            color={ceData.utile  >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
                  {ceData.totaleA > 0 && (
                    <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ROS: {((ceData.utile / ceData.totaleA) * 100).toFixed(1)}% | Margine EBITDA: {((ceData.ebitda / ceData.totaleA) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="card animate-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                    <Scale size={18} color="var(--accent)" />
                    <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Stato Patrimoniale</h3>
                  </div>
                  <Row label="Immobilizzazioni"  value={spData.totaleImmobilizzato} />
                  <Row label="Attivo Circolante"  value={spData.totaleCircolante} />
                  <Row label="Totale Attivo"      value={spData.totaleAttivo}       bold />
                  <div style={{ height: 1, background: 'var(--border)', margin: '0.75rem 0' }} />
                  <Row label="Patrimonio Netto"   value={spData.patrimonioNetto}    color={spData.patrimonioNetto >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
                  <Row label="Debiti a Breve"     value={spData.debitiBreve}        color="var(--danger)" />
                  <Row label="Debiti a Lungo"     value={spData.debitiLungo}        color="var(--warning)" />
                  <Row label="Fondi e TFR"        value={spData.fondi} />
                  <Row label="Totale Fonti"       value={spData.totaleFonti}        bold />
                  {spData.totaleFonti > 0 && (
                    <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Solidità: {((spData.patrimonioNetto / spData.totaleFonti) * 100).toFixed(1)}% | Leva: {spData.debitiBreve + spData.debitiLungo > 0 ? ((spData.debitiBreve + spData.debitiLungo) / Math.max(1, spData.patrimonioNetto)).toFixed(2) : '—'}
                    </div>
                  )}
                </div>
              </div>

              {(preventivo.budget > 0 || preventivo.consuntivo > 0) && (
                <div className="card animate-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <Target size={18} color="var(--success)" />
                    <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Preventivo</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Budget',      value: preventivo.budget,     color: 'var(--text-bright)' },
                      { label: 'Consuntivo',  value: preventivo.consuntivo, color: 'var(--text-bright)' },
                      { label: 'Scostamento', value: preventivo.consuntivo - preventivo.budget, color: (preventivo.consuntivo - preventivo.budget) >= 0 ? 'var(--success)' : 'var(--danger)' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</span>
                        <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color, fontSize: '1.2rem' }}>
                          {label === 'Scostamento' && value >= 0 ? '+' : ''}{fmt(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Report generato da Financial Dashboard Tool — Denis Mascherin | Stage Front-End Developer 2026. Dati gestiti lato client tramite localStorage. Esercizi coperti: {ANNI.join(', ')}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;