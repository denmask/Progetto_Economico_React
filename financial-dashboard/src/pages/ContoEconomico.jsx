import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { FieldGroup, Field, SubtotalRow, KpiCard } from '../components/FinancialUI';
import AnnoSelector from '../components/AnnoSelector';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, DollarSign, Percent, RefreshCw } from 'lucide-react';

const sum = (...args) => args.reduce((a, b) => a + (b || 0), 0);

const ContoEconomico = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const ce = state.contoEconomico;

  const handleChange = (e) => {
    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
    dispatch({ type: 'UPDATE_CE', payload: { [e.target.name]: isNaN(val) ? 0 : val } });
  };

  const f = (name) => ({ name, value: ce[name] ?? 0, onChange: handleChange });

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

  const ebitda              = totaleA - sum(costiAcquisti, costiServizi, costiGodimento, costiPersonale, altriCosti);
  const ebit                = ebitda - ammortamenti;
  const risultatoOperativo  = totaleA - totaleB;
  const oneriFinanziari     = sum(ce.oneriInteressi, ce.oneriMutui, ce.oneriLeasing, ce.perditeValori);
  const rettifiche          = (ce.rivalutazioni || 0) - (ce.svalutazioni || 0);
  const risultatoAntImposte = risultatoOperativo - oneriFinanziari + rettifiche;
  const totaleImposte       = sum(ce.irap, ce.ires, ce.altreImposte);
  const utileEsercizio      = risultatoAntImposte - totaleImposte;

  const marginePct = totaleA > 0 ? ((ebitda / totaleA) * 100).toFixed(1) : '0.0';
  const utilePct   = totaleA > 0 ? ((utileEsercizio / totaleA) * 100).toFixed(1) : '0.0';

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--text-bright)', fontFamily: 'var(--font)', margin: 0 }}>
              <TrendingUp size={28} color="var(--primary)" style={{ flexShrink: 0 }} />
              Conto Economico
            </h1>
            <p style={{ marginTop: 6 }}>Riclassificazione a Valore della Produzione — Schema ex art. 2425 c.c.</p>
          </div>
          <button className="btn-reset" onClick={() => dispatch({ type: 'RESET_CE' })}>
            <RefreshCw size={13} style={{ display: 'inline', marginRight: 5 }} />
            Reset
          </button>
        </div>
      </div>

      <AnnoSelector />

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <KpiCard label="Valore Produzione" value={totaleA} color="blue" icon={<DollarSign size={18}/>} />
        <KpiCard label="EBITDA" value={ebitda} color={ebitda >= 0 ? 'green' : 'red'} sub={`Margine: ${marginePct}%`} icon={<TrendingUp size={18}/>} />
        <KpiCard label="EBIT" value={ebit} color={ebit >= 0 ? 'cyan' : 'red'} icon={<Minus size={18}/>} />
        <KpiCard label="Utile d'Esercizio" value={utileEsercizio} color={utileEsercizio >= 0 ? 'green' : 'red'} sub={`ROS: ${utilePct}%`} icon={<Percent size={18}/>} />
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>

        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpRight size={20} color="var(--success)" />
            <h2 style={{ margin: 0, color: 'var(--text-bright)', fontSize: '1rem', fontWeight: 700 }}>
              A — VALORE DELLA PRODUZIONE
            </h2>
          </div>

          <FieldGroup label="Ricavi Principali" color="green" icon="💰" defaultOpen={true}>
            <Field label="Ricavi delle Vendite e Prestazioni" {...f('ricaviVendite')} hint="Fatturato netto" />
            <Field label="Variazione Prodotti in Lavorazione" {...f('variazioneProdotti')} hint="±" />
            <Field label="Variazione Lavori in Corso (WIP)" {...f('variazioneWIP')} hint="±" />
            <Field label="Incremento Immobilizz. per lavori interni" {...f('incrementoImmobilizzazioni')} />
          </FieldGroup>

          <FieldGroup label="Altri Ricavi e Proventi" color="green" icon="📈" defaultOpen={false}>
            <Field label="Altri Ricavi e Proventi" {...f('altriRicavi')} />
            <Field label="Contributi in Conto Esercizio" {...f('contributiConto')} />
            <Field label="Plusvalenze da Alienazioni" {...f('plusvalenzeAlienazioni')} />
            <Field label="Canoni di Locazione Attivi" {...f('canoniLocazione')} />
            <Field label="Interessi Attivi" {...f('interessiAttivi')} />
            <Field label="Dividendi Ricevuti" {...f('dividendi')} />
            <Field label="Altri Proventi Finanziari" {...f('proventiFinanziari')} />
          </FieldGroup>

          <SubtotalRow label="Totale A — Valore della Produzione" value={totaleA} isTotal color="green" />

          <div style={{ marginTop: '1.5rem' }}>
            <SubtotalRow label="Margine Operativo Lordo (EBITDA)" value={ebitda} color={ebitda >= 0 ? 'green' : 'red'} isTotal />
            <SubtotalRow label="Risultato Operativo (EBIT)" value={ebit} color={ebit >= 0 ? 'cyan' : 'red'} isTotal />
            <SubtotalRow label="Risultato Ante Imposte" value={risultatoAntImposte} color={risultatoAntImposte >= 0 ? 'blue' : 'red'} isTotal />
            <SubtotalRow label="Utile / Perdita d'Esercizio" value={utileEsercizio} color={utileEsercizio >= 0 ? 'green' : 'red'} isTotal />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowDownRight size={20} color="var(--danger)" />
            <h2 style={{ margin: 0, color: 'var(--text-bright)', fontSize: '1rem', fontWeight: 700 }}>
              B — COSTI DELLA PRODUZIONE
            </h2>
          </div>

          <FieldGroup label="Acquisti di Beni" color="red" icon="🛒" defaultOpen={true}>
            <Field label="Acquisti di Merci" {...f('acquistiMerci')} />
            <Field label="Acquisti Materie Prime e Sussidiarie" {...f('acquistMateriePrime')} />
            <Field label="Variazione Rimanenze Merci (±)" {...f('variazioneRimanenzeMerci')} hint="Negativo se aumento" />
          </FieldGroup>
          <SubtotalRow label="Subtotale Acquisti" value={costiAcquisti} />

          <FieldGroup label="Servizi Esterni" color="red" icon="🔧" defaultOpen={false}>
            <Field label="Servizi Amministrativi / Contabili" {...f('serviziEsterniAmm')} />
            <Field label="Utenze (Telefono, Luce, Gas)" {...f('utenzeTel')} />
            <Field label="Consulenze Legali e Fiscali" {...f('consulenze')} />
            <Field label="Assicurazioni" {...f('assicurazioni')} />
            <Field label="Manutenzioni e Riparazioni" {...f('manutRiparazioni')} />
            <Field label="Servizi Marketing / Pubblicità" {...f('serviziMarketing')} />
          </FieldGroup>
          <SubtotalRow label="Subtotale Servizi" value={costiServizi} />

          <FieldGroup label="Godimento Beni di Terzi" color="red" icon="🏢" defaultOpen={false}>
            <Field label="Affitti e Noleggi Passivi" {...f('godimentoBeniTerzi')} />
            <Field label="Fitti Beni Immobili" {...f('fittiBeni')} />
            <Field label="Canoni Leasing" {...f('leasing')} />
          </FieldGroup>
          <SubtotalRow label="Subtotale Godimento Beni" value={costiGodimento} />

          <FieldGroup label="Costi del Personale" color="red" icon="👥" defaultOpen={false} subtotal={costiPersonale}>
            <Field label="Salari e Stipendi" {...f('salariStipendi')} />
            <Field label="Oneri Sociali (INPS)" {...f('oneriSociali')} />
            <Field label="Trattamento di Fine Rapporto (TFR)" {...f('tfr')} />
            <Field label="Altri Costi del Personale" {...f('altriCostPersonale')} />
          </FieldGroup>
          <SubtotalRow label="Subtotale Personale" value={costiPersonale} />

          <FieldGroup label="Ammortamenti e Accantonamenti" color="red" icon="📉" defaultOpen={false}>
            <Field label="Ammort. Immobilizzazioni Materiali" {...f('ammortImmMateriali')} />
            <Field label="Ammort. Immobilizzazioni Immateriali" {...f('ammortImmImmateriali')} />
            <Field label="Svalutazione Crediti" {...f('svalutazioniCrediti')} />
            <Field label="Altri Accantonamenti a Fondi Rischi" {...f('altriAccantonamenti')} />
          </FieldGroup>
          <SubtotalRow label="Subtotale Ammortamenti" value={ammortamenti} />

          <FieldGroup label="Oneri Diversi di Gestione" color="red" icon="📋" defaultOpen={false}>
            <Field label="Oneri Diversi di Gestione" {...f('oneriDiversiGestione')} />
          </FieldGroup>

          <SubtotalRow label="Totale B — Costi della Produzione" value={totaleB} isTotal color="red" />

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, color: 'var(--text-bright)', fontSize: '1rem', fontWeight: 700 }}>
                C — ONERI / PROVENTI FINANZIARI
              </h2>
            </div>
            <FieldGroup label="Oneri Finanziari" color="warning" icon="💳" defaultOpen={false}>
              <Field label="Interessi Passivi su Finanziamenti" {...f('oneriInteressi')} />
              <Field label="Interessi su Mutui" {...f('oneriMutui')} />
              <Field label="Interessi su Leasing" {...f('oneriLeasing')} />
              <Field label="Perdite su Partecipazioni / Titoli" {...f('perditeValori')} />
            </FieldGroup>
            <SubtotalRow label="Totale Oneri Finanziari" value={oneriFinanziari} color="warning" />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <FieldGroup label="D — Rettifiche di Valore" color="purple" icon="⚖️" defaultOpen={false}>
              <Field label="Rivalutazioni" {...f('rivalutazioni')} />
              <Field label="Svalutazioni" {...f('svalutazioni')} />
            </FieldGroup>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <FieldGroup label="E — Imposte d'Esercizio" color="red" icon="🏛️" defaultOpen={false}>
              <Field label="IRAP" {...f('irap')} />
              <Field label="IRES" {...f('ires')} />
              <Field label="Altre Imposte" {...f('altreImposte')} />
            </FieldGroup>
            <SubtotalRow label="Totale Imposte" value={totaleImposte} color="red" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContoEconomico;