import React, { useContext, useRef } from 'react';
import FinancialContext from '../context/FinancialContext';
import { Download, FileText, TrendingUp, Scale, Target, AlertTriangle } from 'lucide-react';

const sum = (...args) => args.reduce((a, b) => a + (b || 0), 0);
const fmt = (n) => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';

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

const Report = () => {
  const { state } = useContext(FinancialContext);
  const { contoEconomico: ce, statoPatrimoniale: sp, preventivo } = state;
  const reportRef = useRef();
  const totaleA = sum(ce.ricaviVendite, ce.variazioneProdotti, ce.variazioneWIP,
    ce.incrementoImmobilizzazioni, ce.altriRicavi, ce.contributiConto,
    ce.plusvalenzeAlienazioni, ce.canoniLocazione, ce.interessiAttivi, ce.dividendi, ce.proventiFinanziari);

  const costiPersonale = sum(ce.salariStipendi, ce.oneriSociali, ce.tfr, ce.altriCostPersonale);
  const costiAcquisti = sum(ce.acquistiMerci, ce.acquistMateriePrime, ce.variazioneRimanenzeMerci);
  const costiServizi = sum(ce.serviziEsterniAmm, ce.utenzeTel, ce.consulenze, ce.assicurazioni, ce.manutRiparazioni, ce.serviziMarketing);
  const costiGodimento = sum(ce.godimentoBeniTerzi, ce.fittiBeni, ce.leasing);
  const ammortamenti = sum(ce.ammortImmMateriali, ce.ammortImmImmateriali, ce.svalutazioniCrediti, ce.altriAccantonamenti);
  const totaleB = sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ammortamenti, ce.oneriDiversiGestione);
  const ebitda = totaleA - sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ce.oneriDiversiGestione);
  const ebit = ebitda - ammortamenti;
  const oneriFinanziari = sum(ce.oneriInteressi, ce.oneriMutui, ce.oneriLeasing, ce.perditeValori);
  const totaleImposte = sum(ce.irap, ce.ires, ce.altreImposte);
  const utile = ebit - oneriFinanziari - totaleImposte;

  // SP calculations
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

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#080c14' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save('Report_Finanziario.pdf');
  };

  const hasData = totaleA > 0 || totaleAttivo > 0;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--text-bright)', margin: 0 }}>
              <FileText size={28} color="var(--purple)" />
              Report Finanziario
            </h1>
            <p style={{ marginTop: 6 }}>Riepilogo consolidato di tutti i dati inseriti</p>
          </div>
          <button className="btn btn-primary" onClick={exportPDF} disabled={!hasData}
            style={{ opacity: hasData ? 1 : 0.4 }}>
            <Download size={16}/> Esporta PDF
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="card animate-in" style={{ textAlign: 'center', padding: '3rem', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <AlertTriangle size={40} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-bright)', marginBottom: '0.5rem' }}>Nessun dato inserito</h3>
          <p style={{ color: 'var(--text-muted)' }}>Compila prima il Conto Economico o lo Stato Patrimoniale.</p>
        </div>
      )}

      {hasData && (
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
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card animate-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <TrendingUp size={18} color="var(--primary)" />
                <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Conto Economico</h3>
              </div>
              <Row label="Valore della Produzione" value={totaleA} />
              <Row label="Totale Costi Operativi" value={totaleB} />
              <Row label="EBITDA" value={ebitda} color={ebitda >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
              <Row label="EBIT (Risultato Operativo)" value={ebit} color={ebit >= 0 ? 'var(--accent)' : 'var(--danger)'} />
              <Row label="Oneri Finanziari" value={oneriFinanziari} color="var(--warning)" />
              <Row label="Imposte" value={totaleImposte} color="var(--danger)" />
              <Row label="Utile / Perdita d'Esercizio" value={utile} color={utile >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
              {totaleA > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ROS: {((utile / totaleA) * 100).toFixed(1)}% | Margine EBITDA: {((ebitda / totaleA) * 100).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="card animate-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <Scale size={18} color="var(--accent)" />
                <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Stato Patrimoniale</h3>
              </div>
              <Row label="Immobilizzazioni" value={totaleImmobilizzato} />
              <Row label="Attivo Circolante" value={totaleCircolante} />
              <Row label="Totale Attivo" value={totaleAttivo} bold />
              <div style={{ height: 1, background: 'var(--border)', margin: '0.75rem 0' }} />
              <Row label="Patrimonio Netto" value={patrimonioNetto} color={patrimonioNetto >= 0 ? 'var(--success)' : 'var(--danger)'} bold />
              <Row label="Debiti a Breve" value={debitiBreve} color="var(--danger)" />
              <Row label="Debiti a Lungo" value={debitiLungo} color="var(--warning)" />
              <Row label="Fondi e TFR" value={fondi} />
              <Row label="Totale Fonti" value={totaleFonti} bold />
              {totaleFonti > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Solidità: {((patrimonioNetto / totaleFonti) * 100).toFixed(1)}% | Leva: {debitiBreve + debitiLungo > 0 ? ((debitiBreve + debitiLungo) / Math.max(1, patrimonioNetto)).toFixed(2) : '—'}
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
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Budget</span>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.2rem' }}>{fmt(preventivo.budget)}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Consuntivo</span>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.2rem' }}>{fmt(preventivo.consuntivo)}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Scostamento</span>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.2rem',
                    color: (preventivo.consuntivo - preventivo.budget) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {(preventivo.consuntivo - preventivo.budget) >= 0 ? '+' : ''}{fmt(preventivo.consuntivo - preventivo.budget)}
                  </div></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Report generato automaticamente da Financial Dashboard Tool — Denis Mascherin | Stage Front-End Developer 2026.
              I dati sono gestiti esclusivamente lato client tramite localStorage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;