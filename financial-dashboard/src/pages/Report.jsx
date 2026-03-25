import React, { useContext, useRef, useEffect, useState } from 'react';
import FinancialContext from '../context/FinancialContext';
import { ANNI } from '../context/FinancialContext';
import { Download, FileText, TrendingUp, Scale, Target, AlertTriangle, BarChart2, LineChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

const sum = (...args) => args.reduce((a, b) => a + (b || 0), 0);
const fmt = (n) => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';
const fmtK = (n) => {
  const v = n || 0;
  if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString('it-IT');
};

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
  const totaleA = sum(ce.ricaviVendite, ce.variazioneProdotti, ce.variazioneWIP,
    ce.incrementoImmobilizzazioni, ce.altriRicavi, ce.contributiConto,
    ce.plusvalenzeAlienazioni, ce.canoniLocazione, ce.interessiAttivi, ce.dividendi, ce.proventiFinanziari);
  const costiAcquisti = sum(ce.acquistiMerci, ce.acquistMateriePrime, ce.variazioneRimanenzeMerci);
  const costiServizi = sum(ce.serviziEsterniAmm, ce.utenzeTel, ce.consulenze, ce.assicurazioni, ce.manutRiparazioni, ce.serviziMarketing);
  const costiGodimento = sum(ce.godimentoBeniTerzi, ce.fittiBeni, ce.leasing);
  const costiPersonale = sum(ce.salariStipendi, ce.oneriSociali, ce.tfr, ce.altriCostPersonale);
  const ammortamenti = sum(ce.ammortImmMateriali, ce.ammortImmImmateriali, ce.svalutazioniCrediti, ce.altriAccantonamenti);
  const totaleB = sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ammortamenti, ce.oneriDiversiGestione);
  const ebitda = totaleA - sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ce.oneriDiversiGestione);
  const ebit = ebitda - ammortamenti;
  const oneriFinanziari = sum(ce.oneriInteressi, ce.oneriMutui, ce.oneriLeasing, ce.perditeValori);
  const totaleImposte = sum(ce.irap, ce.ires, ce.altreImposte);
  const utile = ebit - oneriFinanziari - totaleImposte;
  return { totaleA, totaleB, ebitda, ebit, oneriFinanziari, totaleImposte, utile };
};

const computeSP = (sp) => {
  const totaleImmobilizzato = sum(sp.fabbricati, sp.impianti, sp.macchinari, sp.attrezzature, sp.autoveicoli,
    sp.avviamento, sp.brevetti, sp.immImmateriali, sp.partecipazioni, sp.creditiFinanzLungo, sp.immFinanziarie);
  const disponibilita = sum(sp.cassa, sp.bancaCC, sp.altreDisponibilita, sp.titoliQuotati);
  const crediti = sum(sp.creditiClienti, sp.creditiAltri, sp.creditiTributo, sp.creditiPrevidenziali);
  const rimanenze = sum(sp.rimanenzeMerci, sp.rimanenzeMP, sp.rimanenzeSemilavorati, sp.rimanenzeProdotti);
  const totaleCircolante = sum(disponibilita, crediti, rimanenze, sp.risconiAttivi, sp.rateiAttivi);
  const totaleAttivo = sum(totaleImmobilizzato, totaleCircolante);
  const patrimonioNetto = sum(sp.capitaleSociale, sp.riservaLegale, sp.riserveStatutarie, sp.riserveStraodinarie, sp.utiliPrecedenti) - (sp.perditePrecedenti || 0);
  const debitiBreve = sum(sp.debitiBanche, sp.debitiFornitori, sp.debitiTributari, sp.debitiPrevidenziali, sp.debitiVsDipendenti, sp.altriDebitiBreve);
  const debitiLungo = sum(sp.mutui, sp.debitiLeasing, sp.obbligazioni, sp.debitiLungo);
  const fondi = sum(sp.fondoTFR, sp.fondoRischi, sp.fondoImposte, sp.fondoSvalutazione);
  const totaleFonti = sum(patrimonioNetto, debitiBreve, debitiLungo, fondi);
  return { totaleImmobilizzato, totaleCircolante, totaleAttivo, patrimonioNetto, debitiBreve, debitiLungo, fondi, totaleFonti };
};

const CHART_COLORS = {
  '2022-23': { bar: 'rgba(167,139,250,0.75)', border: '#a78bfa', line: '#a78bfa' },
  '2023-24': { bar: 'rgba(79,142,247,0.75)',  border: '#4f8ef7', line: '#4f8ef7' },
  '2024-25': { bar: 'rgba(0,212,255,0.75)',   border: '#00d4ff', line: '#00d4ff' },
  '2025-26': { bar: 'rgba(15,212,148,0.75)',  border: '#0fd494', line: '#0fd494' },
};

const chartBaseOptions = {
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
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${fmtK(ctx.raw)} €`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#6a7a9b', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
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
  { key: 'totaleAttivo',   label: 'Totale Attivo',    color: '#4f8ef7' },
  { key: 'patrimonioNetto',label: 'Patrimonio Netto', color: '#0fd494' },
  { key: 'debitiBreve',    label: 'Debiti Breve',     color: '#ff4d6a' },
  { key: 'debitiLungo',    label: 'Debiti Lungo',     color: '#ffb340' },
];

const Report = () => {
  const { state } = useContext(FinancialContext);
  const { contoEconomico: ce, statoPatrimoniale: sp, preventivo, anni } = state;
  const reportRef = useRef();
  const [chartView, setChartView] = useState('bar');

  const ceData = computeCE(ce);
  const spData = computeSP(sp);

  const datiStorici = ANNI.map(anno => ({
    anno,
    ce: computeCE(anni[anno].contoEconomico),
    sp: computeSP(anni[anno].statoPatrimoniale),
  }));

  const hasAnyData = datiStorici.some(d => d.ce.totaleA > 0 || d.sp.totaleAttivo > 0);
  const hasCurrentData = ceData.totaleA > 0 || spData.totaleAttivo > 0;

  const barDataCE = {
    labels: METRICHE_CE.map(m => m.label),
    datasets: ANNI.map(anno => ({
      label: anno,
      data: METRICHE_CE.map(m => datiStorici.find(d => d.anno === anno).ce[m.key]),
      backgroundColor: CHART_COLORS[anno].bar,
      borderColor: CHART_COLORS[anno].border,
      borderWidth: 1,
      borderRadius: 5,
    })),
  };

  const lineDataCE = {
    labels: ANNI,
    datasets: METRICHE_CE.map(m => ({
      label: m.label,
      data: ANNI.map(anno => datiStorici.find(d => d.anno === anno).ce[m.key]),
      borderColor: m.color,
      backgroundColor: m.color + '18',
      pointBackgroundColor: m.color,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
      tension: 0.35,
      fill: false,
    })),
  };

  const barDataSP = {
    labels: METRICHE_SP.map(m => m.label),
    datasets: ANNI.map(anno => ({
      label: anno,
      data: METRICHE_SP.map(m => datiStorici.find(d => d.anno === anno).sp[m.key]),
      backgroundColor: CHART_COLORS[anno].bar,
      borderColor: CHART_COLORS[anno].border,
      borderWidth: 1,
      borderRadius: 5,
    })),
  };

  const lineDataSP = {
    labels: ANNI,
    datasets: METRICHE_SP.map(m => ({
      label: m.label,
      data: ANNI.map(anno => datiStorici.find(d => d.anno === anno).sp[m.key]),
      borderColor: m.color,
      backgroundColor: m.color + '18',
      pointBackgroundColor: m.color,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
      tension: 0.35,
      fill: false,
    })),
  };

  // FUNZIONE ESPORTA PDF SISTEMATA
  const exportPDF = () => {
    const input = reportRef.current;
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#080c14',
      logging: false,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgFinalWidth = imgWidth * ratio;
      const imgFinalHeight = imgHeight * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgFinalWidth, imgFinalHeight);
      pdf.save(`Report_Finanziario_${state.annoSelezionato}.pdf`);
    });
  };

  const tabStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '0.38rem 0.9rem',
    borderRadius: 'var(--radius-xs)',
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
          <button className="btn btn-primary" onClick={exportPDF} disabled={!hasAnyData}
            style={{ opacity: hasAnyData ? 1 : 0.4 }}>
            <Download size={16}/> Esporta PDF
          </button>
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
        <div ref={reportRef}>

          <div className="card animate-in" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(59,130,246,0.4)',
              }}>
                <FileText size={28} color="#fff"/>
              </div>
            </div>
            <h2 style={{ color: 'var(--text-bright)', marginBottom: '0.4rem', fontSize: '1.5rem', fontWeight: 800 }}>
              Prospetto Finanziario
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Generato il {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' '}— Esercizi {ANNI[0]} / {ANNI[ANNI.length - 1]}
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                📈 Confronto Storico — {ANNI[0]} / {ANNI[ANNI.length - 1]}
              </h3>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
                <button style={tabStyle(chartView === 'bar')} onClick={() => setChartView('bar')}>
                  <BarChart2 size={13}/> Barre
                </button>
                <button style={tabStyle(chartView === 'line')} onClick={() => setChartView('line')}>
                  <LineChart size={13}/> Linee
                </button>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1.2rem' }}>
              <div className="storico-chart-wrap">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <TrendingUp size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--primary)' }}/>
                  Conto Economico
                </div>
                <div style={{ height: 260 }}>
                  {chartView === 'bar'
                    ? <Bar data={barDataCE} options={{ ...chartBaseOptions, plugins: { ...chartBaseOptions.plugins, title: { display: false } } }} />
                    : <Line data={lineDataCE} options={{ ...chartBaseOptions, plugins: { ...chartBaseOptions.plugins, title: { display: false } } }} />
                  }
                </div>
                <div className="storico-legend">
                  {chartView === 'bar'
                    ? ANNI.map(a => (
                        <div key={a} className="storico-legend-item">
                          <span className="storico-legend-dot" style={{ background: CHART_COLORS[a].border }}/>
                          {a}
                        </div>
                      ))
                    : METRICHE_CE.map(m => (
                        <div key={m.key} className="storico-legend-item">
                          <span className="storico-legend-dot" style={{ background: m.color }}/>
                          {m.label}
                        </div>
                      ))
                  }
                </div>
              </div>

              <div className="storico-chart-wrap">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <Scale size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--accent)' }}/>
                  Stato Patrimoniale
                </div>
                <div style={{ height: 260 }}>
                  {chartView === 'bar'
                    ? <Bar data={barDataSP} options={{ ...chartBaseOptions, plugins: { ...chartBaseOptions.plugins, title: { display: false } } }} />
                    : <Line data={lineDataSP} options={{ ...chartBaseOptions, plugins: { ...chartBaseOptions.plugins, title: { display: false } } }} />
                  }
                </div>
                <div className="storico-legend">
                  {chartView === 'bar'
                    ? ANNI.map(a => (
                        <div key={a} className="storico-legend-item">
                          <span className="storico-legend-dot" style={{ background: CHART_COLORS[a].border }}/>
                          {a}
                        </div>
                      ))
                    : METRICHE_SP.map(m => (
                        <div key={m.key} className="storico-legend-item">
                          <span className="storico-legend-dot" style={{ background: m.color }}/>
                          {m.label}
                        </div>
                      ))
                  }
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
                    <th style={{ padding: '0.5rem 0.7rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Metrica
                    </th>
                    {ANNI.map(anno => (
                      <th key={anno} style={{ padding: '0.5rem 0.7rem', textAlign: 'right', color: CHART_COLORS[anno].border, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '0.75rem' }}>
                        {anno}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Valore Produzione', fn: d => d.ce.totaleA, color: 'var(--primary)' },
                    { label: 'EBITDA',             fn: d => d.ce.ebitda,  color: 'var(--success)' },
                    { label: "EBIT",               fn: d => d.ce.ebit,    color: 'var(--accent)' },
                    { label: "Utile d'Esercizio",  fn: d => d.ce.utile,   color: 'var(--purple)' },
                    { label: 'Totale Attivo',       fn: d => d.sp.totaleAttivo,    color: 'var(--primary)' },
                    { label: 'Patrimonio Netto',    fn: d => d.sp.patrimonioNetto, color: 'var(--success)' },
                  ].map(({ label, fn, color }) => (
                    <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.5rem 0.7rem', color: 'var(--text)', fontSize: '0.82rem' }}>{label}</td>
                      {ANNI.map(anno => {
                        const d = datiStorici.find(x => x.anno === anno);
                        const v = fn(d);
                        return (
                          <td key={anno} style={{ padding: '0.5rem 0.7rem', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600,
                            color: v === 0 ? 'var(--text-muted)' : (v < 0 ? 'var(--danger)' : color), fontSize: '0.8rem' }}>
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
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Dettaglio Esercizio {state.annoSelezionato}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              </div>

              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card animate-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                    <TrendingUp size={18} color="var(--primary)" />
                    <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Conto Economico</h3>
                  </div>
                  <Row label="Valore della Produzione" value={ceData.totaleA} />
                  <Row label="Totale Costi Operativi" value={ceData.totaleB} />
                  <Row label="EBITDA" value={ceData.ebitda} color={ceData.ebitda >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
                  <Row label="EBIT (Risultato Operativo)" value={ceData.ebit} color={ceData.ebit >= 0 ? 'var(--accent)' : 'var(--danger)'} />
                  <Row label="Oneri Finanziari" value={ceData.oneriFinanziari} color="var(--warning)" />
                  <Row label="Imposte" value={ceData.totaleImposte} color="var(--danger)" />
                  <Row label="Utile / Perdita d'Esercizio" value={ceData.utile} color={ceData.utile >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
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
                  <Row label="Immobilizzazioni" value={spData.totaleImmobilizzato} />
                  <Row label="Attivo Circolante" value={spData.totaleCircolante} />
                  <Row label="Totale Attivo" value={spData.totaleAttivo} bold />
                  <div style={{ height: 1, background: 'var(--border)', margin: '0.75rem 0' }} />
                  <Row label="Patrimonio Netto" value={spData.patrimonioNetto} color={spData.patrimonioNetto >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
                  <Row label="Debiti a Breve" value={spData.debitiBreve} color="var(--danger)" />
                  <Row label="Debiti a Lungo" value={spData.debitiLungo} color="var(--warning)" />
                  <Row label="Fondi e TFR" value={spData.fondi} />
                  <Row label="Totale Fonti" value={spData.totaleFonti} bold />
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
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Budget</span>
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.2rem' }}>{fmt(preventivo.budget)}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Consuntivo</span>
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.2rem' }}>{fmt(preventivo.consuntivo)}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Scostamento</span>
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.2rem',
                        color: (preventivo.consuntivo - preventivo.budget) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {(preventivo.consuntivo - preventivo.budget) >= 0 ? '+' : ''}{fmt(preventivo.consuntivo - preventivo.budget)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Report generato automaticamente da Financial Dashboard Tool — Denis Mascherin | Stage Front-End Developer 2026.
              I dati sono gestiti esclusivamente lato client tramite localStorage. Esercizi coperti: {ANNI.join(', ')}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;