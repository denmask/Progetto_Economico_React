import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FinancialContext from '../context/FinancialContext';
import {
  ArrowLeft, TrendingUp, Scale, CheckCircle2, AlertCircle,
  DollarSign, Percent, Minus, Landmark, Wallet,
} from 'lucide-react';

const sum = (...args) => args.reduce((a, b) => a + (b || 0), 0);
const fmt = (n) =>
  (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
const pct = (a, b) => (b && b !== 0 ? ((a / b) * 100).toFixed(1) : '0.0');
const ratioFn = (a, b) => (b && b !== 0 ? (a / b).toFixed(2) : '—');
const colorVar = {
  green: 'var(--success)', red: 'var(--danger)', blue: 'var(--primary)',
  cyan: 'var(--accent)', warning: 'var(--warning)', purple: 'var(--purple)',
};

const Row = ({ label, value, isTotal, color = 'blue', indent }) => {
  const c = colorVar[color] || 'var(--text-bright)';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: isTotal ? '0.5rem 0.75rem' : '0.3rem 0.75rem',
      paddingLeft: indent ? '1.5rem' : '0.75rem',
      borderRadius: isTotal ? 7 : 0,
      background: isTotal ? `${c}14` : 'transparent',
      borderBottom: isTotal ? 'none' : '1px solid rgba(255,255,255,0.03)',
      marginBottom: isTotal ? '0.4rem' : 0,
    }}>
      <span style={{ fontSize: isTotal ? '0.8rem' : '0.76rem', fontWeight: isTotal ? 700 : 400, color: isTotal ? c : 'var(--text-muted)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: isTotal ? '0.85rem' : '0.78rem', fontWeight: isTotal ? 700 : 500, color: c }}>
        {fmt(value)}
      </span>
    </div>
  );
};

const SectionHead = ({ label, color = 'blue', icon }) => (
  <div style={{
    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: colorVar[color],
    padding: '0.55rem 0.75rem 0.25rem',
    display: 'flex', alignItems: 'center', gap: 6,
    borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem',
  }}>
    {icon} {label}
  </div>
);

const KpiMini = ({ label, value, sub, color = 'blue' }) => (
  <div className="card" style={{ textAlign: 'center', padding: '1rem 0.75rem' }}>
    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.25rem', fontWeight: 800, color: colorVar[color] || colorVar.blue }}>
      {fmt(value)}
    </div>
    {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const StoricoDati = () => {
  const { anno } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(FinancialContext);
  const [tab, setTab] = useState('ce');

  const annoKey = anno || '';
  const annoLabel = annoKey.replace(/(\d{4})-(\d{2})/, '$1/$2');
  const yearData = state.anni?.[annoKey];
  const ce = yearData?.contoEconomico || {};
  const sp = yearData?.statoPatrimoniale || {};

  /* ── CE ── */
  const totaleA = sum(
    ce.ricaviVendite, ce.variazioneProdotti, ce.variazioneWIP,
    ce.incrementoImmobilizzazioni, ce.altriRicavi, ce.contributiConto,
    ce.plusvalenzeAlienazioni, ce.canoniLocazione,
    ce.interessiAttivi, ce.dividendi, ce.proventiFinanziari
  );
  const costiAcquisti  = sum(ce.acquistiMerci, ce.acquistMateriePrime, ce.variazioneRimanenzeMerci);
  const costiServizi   = sum(ce.serviziEsterniAmm, ce.utenzeTel, ce.consulenze, ce.assicurazioni, ce.manutRiparazioni, ce.serviziMarketing);
  const costiGodimento = sum(ce.godimentoBeniTerzi, ce.fittiBeni, ce.leasing);
  const costiPersonale = sum(ce.salariStipendi, ce.oneriSociali, ce.tfr, ce.altriCostPersonale);
  const ammortamenti   = sum(ce.ammortImmMateriali, ce.ammortImmImmateriali, ce.svalutazioniCrediti, ce.altriAccantonamenti);
  const altriCosti     = sum(ce.oneriDiversiGestione);
  const totaleB        = sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, ammortamenti, altriCosti);
  const ebitda         = totaleA - sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, altriCosti);
  const ebit           = ebitda - ammortamenti;
  const risultatoOp    = totaleA - totaleB;
  const oneriFin       = sum(ce.oneriInteressi, ce.oneriMutui, ce.oneriLeasing, ce.perditeValori);
  const rettifiche     = (ce.rivalutazioni || 0) - (ce.svalutazioni || 0);
  const risultatoAI    = risultatoOp - oneriFin + rettifiche;
  const totImposte     = sum(ce.irap, ce.ires, ce.altreImposte);
  const utile          = risultatoAI - totImposte;

  const immMat   = sum(sp.fabbricati, sp.impianti, sp.attrezzature, sp.macchinari, sp.autoveicoli);
  const immImm   = sum(sp.avviamento, sp.brevetti, sp.immImmateriali);
  const immFin   = sum(sp.partecipazioni, sp.creditiFinanzLungo, sp.immFinanziarie);
  const totImm   = sum(immMat, immImm, immFin);
  const dispon   = sum(sp.cassa, sp.bancaCC, sp.altreDisponibilita, sp.titoliQuotati);
  const crediti  = sum(sp.creditiClienti, sp.creditiAltri, sp.creditiTributo, sp.creditiPrevidenziali);
  const riman    = sum(sp.rimanenzeMerci, sp.rimanenzeMP, sp.rimanenzeSemilavorati, sp.rimanenzeProdotti);
  const totCirc  = sum(dispon, crediti, riman, sum(sp.risconiAttivi, sp.rateiAttivi));
  const totAttivo = sum(totImm, totCirc);
  const pn       = sum(sp.capitaleSociale, sp.riservaLegale, sp.riserveStatutarie, sp.riserveStraodinarie, sp.utiliPrecedenti) - (sp.perditePrecedenti || 0);
  const debBreve = sum(sp.debitiBanche, sp.debitiFornitori, sp.debitiTributari, sp.debitiPrevidenziali, sp.debitiVsDipendenti, sp.altriDebitiBreve);
  const debLungo = sum(sp.mutui, sp.debitiLeasing, sp.obbligazioni, sp.debitiLungo);
  const fondi    = sum(sp.fondoTFR, sp.fondoRischi, sp.fondoImposte, sp.fondoSvalutazione);
  const totPass  = sum(debBreve, debLungo, fondi, sum(sp.rateiPassivi, sp.riscontiPassivi));
  const totFonti = sum(pn, totPass);
  const diff     = totAttivo - totFonti;
  const quadrato = Math.abs(diff) < 1;

  const tabBtn = (id, Icon, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '0.55rem 1.4rem',
        border: 'none',
        borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent',
        background: 'none',
        color: tab === id ? 'var(--primary)' : 'var(--text-muted)',
        fontFamily: 'var(--font)', fontSize: '0.85rem',
        fontWeight: tab === id ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.18s',
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <div className="page-wrapper">

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', fontFamily: 'var(--font)', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'var(--text-bright)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <ArrowLeft size={14} /> Indietro
            </button>
            <div>
              <h1 style={{ color: 'var(--text-bright)', fontFamily: 'var(--font)', margin: 0, fontSize: '1.4rem' }}>
                Storico — Esercizio {annoLabel}
              </h1>
              <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Vista in sola lettura dei dati inseriti per questo esercizio
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        marginBottom: '1.75rem', gap: 0,
      }}>
        {tabBtn('ce', TrendingUp, 'Conto Economico')}
        {tabBtn('sp', Scale, 'Stato Patrimoniale')}
      </div>
      {tab === 'ce' && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <KpiMini label="Valore Produzione"  value={totaleA} color="blue" />
            <KpiMini label="EBITDA"  value={ebitda}  color={ebitda >= 0 ? 'green' : 'red'}  sub={`Margine: ${pct(ebitda, totaleA)}%`} />
            <KpiMini label="EBIT"    value={ebit}    color={ebit >= 0 ? 'cyan' : 'red'} />
            <KpiMini label="Utile d'Esercizio" value={utile} color={utile >= 0 ? 'green' : 'red'} sub={`ROS: ${pct(utile, totaleA)}%`} />
          </div>

          <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
            <div className="card animate-in" style={{ padding: '1rem 0' }}>
              <div style={{ padding: '0 0.75rem 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                A — Valore della Produzione
              </div>
              <SectionHead label="Ricavi Principali" color="green" icon="💰" />
              <Row label="Ricavi delle Vendite e Prestazioni" value={ce.ricaviVendite} indent />
              <Row label="Variazione Prodotti / WIP" value={sum(ce.variazioneProdotti, ce.variazioneWIP)} indent />
              <Row label="Incremento Immobilizzazioni" value={ce.incrementoImmobilizzazioni} indent />
              <SectionHead label="Altri Ricavi e Proventi" color="green" icon="📈" />
              <Row label="Altri Ricavi e Proventi" value={ce.altriRicavi} indent />
              <Row label="Contributi in Conto Esercizio" value={ce.contributiConto} indent />
              <Row label="Plusvalenze da Alienazioni" value={ce.plusvalenzeAlienazioni} indent />
              <Row label="Interessi Attivi / Dividendi" value={sum(ce.interessiAttivi, ce.dividendi, ce.proventiFinanziari)} indent />
              <Row label="Totale A — Valore della Produzione" value={totaleA} isTotal color="green" />

              <div style={{ marginTop: '1rem' }}>
                <Row label="EBITDA" value={ebitda} isTotal color={ebitda >= 0 ? 'green' : 'red'} />
                <Row label="EBIT"   value={ebit}   isTotal color={ebit >= 0 ? 'cyan' : 'red'} />
                <Row label="Risultato Ante Imposte" value={risultatoAI} isTotal color={risultatoAI >= 0 ? 'blue' : 'red'} />
                <Row label="Utile / Perdita d'Esercizio" value={utile} isTotal color={utile >= 0 ? 'green' : 'red'} />
              </div>
            </div>

            <div className="card animate-in" style={{ padding: '1rem 0' }}>
              <div style={{ padding: '0 0.75rem 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                B — Costi della Produzione
              </div>
              <SectionHead label="Acquisti di Beni" color="red" icon="🛒" />
              <Row label="Acquisti Merci e Materie Prime" value={sum(ce.acquistiMerci, ce.acquistMateriePrime)} indent />
              <Row label="Variazione Rimanenze Merci" value={ce.variazioneRimanenzeMerci} indent />
              <Row label="Subtotale Acquisti" value={costiAcquisti} isTotal color="red" />

              <SectionHead label="Servizi Esterni" color="red" icon="🔧" />
              <Row label="Servizi Amm. / Utenze / Consulenze" value={sum(ce.serviziEsterniAmm, ce.utenzeTel, ce.consulenze)} indent />
              <Row label="Assicurazioni / Manutenzioni / Marketing" value={sum(ce.assicurazioni, ce.manutRiparazioni, ce.serviziMarketing)} indent />
              <Row label="Subtotale Servizi" value={costiServizi} isTotal color="red" />

              <SectionHead label="Godimento Beni di Terzi" color="red" icon="🏢" />
              <Row label="Affitti / Fitti / Leasing" value={costiGodimento} indent />
              <Row label="Subtotale Godimento" value={costiGodimento} isTotal color="red" />

              <SectionHead label="Costi del Personale" color="red" icon="👥" />
              <Row label="Salari, Oneri Sociali, TFR" value={sum(ce.salariStipendi, ce.oneriSociali, ce.tfr)} indent />
              <Row label="Subtotale Personale" value={costiPersonale} isTotal color="red" />

              <SectionHead label="Ammortamenti e Accantonamenti" color="red" icon="📉" />
              <Row label="Ammort. Materiali / Immateriali / Svalut." value={ammortamenti} indent />
              <Row label="Subtotale Ammortamenti" value={ammortamenti} isTotal color="red" />

              <Row label="Totale B — Costi della Produzione" value={totaleB} isTotal color="red" />

              <SectionHead label="C — Oneri Finanziari" color="warning" icon="💳" />
              <Row label="Interessi Passivi / Mutui / Leasing" value={oneriFin} indent />
              <Row label="Totale Oneri Finanziari" value={oneriFin} isTotal color="warning" />

              <SectionHead label="E — Imposte d'Esercizio" color="red" icon="🏛️" />
              <Row label="IRAP / IRES / Altre Imposte" value={totImposte} indent />
              <Row label="Totale Imposte" value={totImposte} isTotal color="red" />
            </div>
          </div>
        </>
      )}

      {tab === 'sp' && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <KpiMini label="Totale Attivo"    value={totAttivo} color="blue" />
            <KpiMini label="Patrimonio Netto" value={pn}        color={pn >= 0 ? 'green' : 'red'} sub={`Solidità: ${pct(pn, totFonti)}%`} />
            <KpiMini label="Debiti Totali"    value={totPass}   color="red"  sub={`D/E: ${ratioFn(totPass, pn)}`} />
            <KpiMini label="Totale Fonti"     value={totFonti}  color="cyan" />
          </div>

          <div className="card animate-in" style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              📊 Indici di Bilancio
            </div>
            <div className="grid-4">
              {[
                { label: 'Current Ratio', sub: 'Liquidità Corrente', val: ratioFn(totCirc, debBreve), color: 'var(--primary)' },
                { label: 'Quick Ratio',   sub: 'Liquidità Secca',    val: ratioFn(sum(dispon, crediti), debBreve), color: 'var(--accent)' },
                { label: 'Debt / Equity', sub: 'Leva Finanziaria',   val: pn > 0 ? ratioFn(totPass, pn) : '—', color: 'var(--purple)' },
                { label: 'Solidità',      sub: 'PN / Totale Fonti',  val: `${pct(pn, totFonti)}%`, color: 'var(--success)' },
              ].map(({ label, sub, val, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'var(--mono)', fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
            <div className="card animate-in" style={{ padding: '1rem 0' }}>
              <div style={{ padding: '0 0.75rem 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Landmark size={14} /> ATTIVO — Impieghi
              </div>
              <SectionHead label="B — Immobilizzazioni" color="cyan" icon="🏭" />
              <Row label="Immobil. Materiali"   value={immMat} indent />
              <Row label="Immobil. Immateriali" value={immImm} indent />
              <Row label="Immobil. Finanziarie" value={immFin} indent />
              <Row label="Totale Immobilizzato" value={totImm} isTotal color="cyan" />

              <SectionHead label="C — Attivo Circolante" color="blue" icon="🔄" />
              <Row label="Rimanenze"           value={riman}   indent />
              <Row label="Crediti"             value={crediti} indent />
              <Row label="Disponibilità Liquide" value={dispon} indent />
              <Row label="Ratei e Risconti Attivi" value={sum(sp.risconiAttivi, sp.rateiAttivi)} indent />
              <Row label="Totale Circolante"   value={totCirc} isTotal color="blue" />

              <Row label="TOTALE ATTIVO" value={totAttivo} isTotal color="blue" />
            </div>

            <div className="card animate-in" style={{ padding: '1rem 0' }}>
              <div style={{ padding: '0 0.75rem 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={14} /> PASSIVO — Fonti di Finanziamento
              </div>
              <SectionHead label="A — Patrimonio Netto" color="green" icon="🏛️" />
              <Row label="Capitale Sociale"     value={sp.capitaleSociale}    indent />
              <Row label="Riserve"              value={sum(sp.riservaLegale, sp.riserveStatutarie, sp.riserveStraodinarie)} indent />
              <Row label="Utili / Perdite Prec." value={sum(sp.utiliPrecedenti) - (sp.perditePrecedenti || 0)} indent />
              <Row label="Totale Patrimonio Netto" value={pn} isTotal color="green" />

              <SectionHead label="C — Debiti a Breve Termine" color="red" icon="⚡" />
              <Row label="Banche / Fornitori / Tributi" value={sum(sp.debitiBanche, sp.debitiFornitori, sp.debitiTributari)} indent />
              <Row label="Prev. / Dipendenti / Altri"   value={sum(sp.debitiPrevidenziali, sp.debitiVsDipendenti, sp.altriDebitiBreve)} indent />
              <Row label="Subtotale Debiti Breve"       value={debBreve} isTotal color="red" />

              <SectionHead label="C — Debiti a Lungo Termine" color="red" icon="🏗️" />
              <Row label="Mutui / Leasing / Obbligazioni" value={sum(sp.mutui, sp.debitiLeasing, sp.obbligazioni, sp.debitiLungo)} indent />
              <Row label="Subtotale Debiti Lungo" value={debLungo} isTotal color="red" />

              <SectionHead label="B — Fondi Rischi e Oneri" color="warning" icon="🛡️" />
              <Row label="TFR / Rischi / Imposte / Svalut." value={fondi} indent />

              <SectionHead label="E — Ratei e Risconti Passivi" color="purple" icon="📅" />
              <Row label="Ratei e Risconti Passivi" value={sum(sp.rateiPassivi, sp.riscontiPassivi)} indent />

              <Row label="Totale Debiti + Fondi"    value={totPass}  isTotal color="red" />
              <Row label="TOTALE PASSIVO E NETTO"   value={totFonti} isTotal color={quadrato ? 'green' : 'red'} />

              <div className={`balance-status ${quadrato ? 'balanced' : 'unbalanced'}`} style={{ margin: '1rem 0.75rem 0' }}>
                {quadrato
                  ? <><CheckCircle2 size={18}/> Bilancio in pareggio ✓</>
                  : <><AlertCircle  size={18}/> Differenza: {diff.toLocaleString('it-IT')} €</>
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoricoDati;