import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { FieldGroup, Field, SubtotalRow, KpiCard } from '../components/FinancialUI';
import AnnoSelector from '../components/AnnoSelector';
import { Scale, Landmark, Wallet, TrendingUp, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const sum = (...args) => args.reduce((a, b) => a + (b || 0), 0);
const pct = (a, b) => (b && b !== 0 ? ((a / b) * 100).toFixed(1) : '—');
const ratio = (a, b) => (b && b !== 0 ? (a / b).toFixed(2) : '—');

const StatoPatrimoniale = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const sp = state.statoPatrimoniale;

  const handleChange = (e) => {
    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
    dispatch({ type: 'UPDATE_SP', payload: { [e.target.name]: isNaN(val) ? 0 : val } });
  };

  const f = (name) => ({ name, value: sp[name] ?? 0, onChange: handleChange });

  const immobilizzatoMateriale   = sum(sp.fabbricati, sp.impianti, sp.attrezzature, sp.macchinari, sp.autoveicoli);
  const immobilizzatoImmateriale = sum(sp.avviamento, sp.brevetti, sp.immImmateriali);
  const immobilizzatoFinanziario = sum(sp.partecipazioni, sp.creditiFinanzLungo, sp.immFinanziarie);
  const totaleImmobilizzato      = sum(immobilizzatoMateriale, immobilizzatoImmateriale, immobilizzatoFinanziario);

  const disponibilita      = sum(sp.cassa, sp.bancaCC, sp.altreDisponibilita, sp.titoliQuotati);
  const crediti            = sum(sp.creditiClienti, sp.creditiAltri, sp.creditiTributo, sp.creditiPrevidenziali);
  const rimanenze          = sum(sp.rimanenzeMerci, sp.rimanenzeMP, sp.rimanenzeSemilavorati, sp.rimanenzeProdotti);
  const rateiRisconiAttivi = sum(sp.risconiAttivi, sp.rateiAttivi);
  const totaleCircolante   = sum(disponibilita, crediti, rimanenze, rateiRisconiAttivi);
  const totaleAttivo       = sum(totaleImmobilizzato, totaleCircolante);

  const patrimonioNetto = sum(
    sp.capitaleSociale, sp.riservaLegale, sp.riserveStatutarie,
    sp.riserveStraodinarie, sp.utiliPrecedenti
  ) - (sp.perditePrecedenti || 0);

  const debitiBreve   = sum(sp.debitiBanche, sp.debitiFornitori, sp.debitiTributari, sp.debitiPrevidenziali, sp.debitiVsDipendenti, sp.altriDebitiBreve);
  const debitiLungoT  = sum(sp.mutui, sp.debitiLeasing, sp.obbligazioni, sp.debitiLungo);
  const fondi         = sum(sp.fondoTFR, sp.fondoRischi, sp.fondoImposte, sp.fondoSvalutazione);
  const rateiPassivi  = sum(sp.rateiPassivi, sp.riscontiPassivi);
  const totalePassivo = sum(debitiBreve, debitiLungoT, fondi, rateiPassivi);
  const totaleFonti   = sum(patrimonioNetto, totalePassivo);
  const differenza    = totaleAttivo - totaleFonti;
  const quadrato      = Math.abs(differenza) < 1;

  const currentRatio = ratio(totaleCircolante, debitiBreve);
  const quickRatio   = ratio(sum(disponibilita, crediti), debitiBreve);
  const debtEquity   = patrimonioNetto > 0 ? ratio(totalePassivo, patrimonioNetto) : '—';
  const solidita     = pct(patrimonioNetto, totaleFonti);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'var(--text-bright)', fontFamily: 'var(--font)', margin: 0 }}>
              <Scale size={28} color="var(--accent)" />
              Stato Patrimoniale
            </h1>
            <p style={{ marginTop: 6 }}>Schema ex art. 2424 c.c. — Impieghi e Fonti di Finanziamento</p>
          </div>
          <button className="btn-reset" onClick={() => dispatch({ type: 'RESET_SP' })}>
            <RefreshCw size={13} style={{ display: 'inline', marginRight: 5 }} />
            Reset
          </button>
        </div>
      </div>

      <AnnoSelector />

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <KpiCard label="Totale Attivo"     value={totaleAttivo}     color="blue"                              icon={<Landmark size={18}/>} />
        <KpiCard label="Patrimonio Netto"  value={patrimonioNetto}  color={patrimonioNetto >= 0 ? 'green' : 'red'} icon={<TrendingUp size={18}/>} sub={`Solidità: ${solidita}%`} />
        <KpiCard label="Debiti Totali"     value={totalePassivo}    color="red"                               icon={<Wallet size={18}/>} sub={`D/E: ${debtEquity}`} />
        <KpiCard label="Totale Fonti"      value={totaleFonti}      color="cyan" />
      </div>

      <div className="card animate-in" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-bright)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          📊 Indici di Bilancio
        </h3>
        <div className="grid-4">
          {[
            { label: 'Current Ratio', sub: 'Liquidità Corrente', value: currentRatio, color: 'var(--primary)'  },
            { label: 'Quick Ratio',   sub: 'Liquidità Secca',    value: quickRatio,   color: 'var(--accent)'   },
            { label: 'Debt / Equity', sub: 'Leva Finanziaria',   value: debtEquity,   color: 'var(--purple)'   },
            { label: 'Solidità',      sub: 'PN / Totale Fonti',  value: `${solidita}%`, color: 'var(--success)' },
          ].map(({ label, sub, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontFamily: 'var(--mono)', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>

        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={20} color="var(--accent)" />
            <h2 style={{ margin: 0, color: 'var(--text-bright)', fontSize: '1rem', fontWeight: 700 }}>ATTIVO — Impieghi</h2>
          </div>

          <FieldGroup label="A — Crediti verso Soci"           color="cyan"  icon="📋" defaultOpen={false}>
            <Field label="Crediti verso Soci per versamenti dovuti" name="creditiVsSoci" value={sp.creditiVsSoci ?? 0} onChange={handleChange} hint="Quota non ancora versata" />
          </FieldGroup>

          <FieldGroup label="B.I — Immobilizzazioni Immateriali"  color="cyan"  icon="💡" defaultOpen={false} subtotal={immobilizzatoImmateriale}>
            <Field label="Costi di Impianto e Ampliamento" {...f('immImmateriali')} />
            <Field label="Avviamento"                      {...f('avviamento')} />
            <Field label="Brevetti e Licenze"              {...f('brevetti')} />
          </FieldGroup>

          <FieldGroup label="B.II — Immobilizzazioni Materiali"   color="cyan"  icon="🏭" defaultOpen={true} subtotal={immobilizzatoMateriale}>
            <Field label="Terreni e Fabbricati"            {...f('fabbricati')} />
            <Field label="Impianti e Macchinari"           {...f('impianti')} />
            <Field label="Macchinari Industriali"          {...f('macchinari')} />
            <Field label="Attrezzature Industriali"        {...f('attrezzature')} />
            <Field label="Autoveicoli e Mezzi Trasporto"   {...f('autoveicoli')} />
          </FieldGroup>

          <FieldGroup label="B.III — Immobilizzazioni Finanziarie" color="cyan"  icon="📊" defaultOpen={false} subtotal={immobilizzatoFinanziario}>
            <Field label="Partecipazioni in Imprese Controllate" {...f('partecipazioni')} />
            <Field label="Crediti Finanziari a Lungo Termine"    {...f('creditiFinanzLungo')} />
            <Field label="Altre Immobilizzazioni Finanziarie"    {...f('immFinanziarie')} />
          </FieldGroup>

          <SubtotalRow label="Totale B — Immobilizzazioni" value={totaleImmobilizzato} isTotal color="cyan" />

          <div style={{ marginTop: '1.25rem' }}>
            <FieldGroup label="C.I — Rimanenze"            color="blue" icon="📦" defaultOpen={false} subtotal={rimanenze}>
              <Field label="Rimanenze Merci"               {...f('rimanenzeMerci')} />
              <Field label="Materie Prime e Sussidiarie"   {...f('rimanenzeMP')} />
              <Field label="Semilavorati"                  {...f('rimanenzeSemilavorati')} />
              <Field label="Prodotti Finiti"               {...f('rimanenzeProdotti')} />
            </FieldGroup>

            <FieldGroup label="C.II — Crediti"             color="blue" icon="📄" defaultOpen={true} subtotal={crediti}>
              <Field label="Crediti verso Clienti"         {...f('creditiClienti')} />
              <Field label="Crediti verso Altri"           {...f('creditiAltri')} />
              <Field label="Crediti Tributari (erario)"    {...f('creditiTributo')} />
              <Field label="Crediti Previdenziali e Sociali" {...f('creditiPrevidenziali')} />
            </FieldGroup>

            <FieldGroup label="C.III — Attività Finanziarie" color="blue" icon="💰" defaultOpen={false}>
              <Field label="Titoli Quotati in Borsa"       {...f('titoliQuotati')} />
            </FieldGroup>

            <FieldGroup label="C.IV — Disponibilità Liquide" color="blue" icon="🏦" defaultOpen={true} subtotal={disponibilita}>
              <Field label="Cassa"                         {...f('cassa')} />
              <Field label="Banca c/c"                     {...f('bancaCC')} />
              <Field label="Altre Disponibilità Liquide"   {...f('altreDisponibilita')} />
            </FieldGroup>

            <SubtotalRow label="Totale C — Attivo Circolante" value={totaleCircolante} isTotal color="blue" />

            <FieldGroup label="D — Ratei e Risconti Attivi" color="purple" icon="📅" defaultOpen={false}>
              <Field label="Ratei Attivi"    {...f('rateiAttivi')} />
              <Field label="Risconti Attivi" {...f('risconiAttivi')} />
            </FieldGroup>
          </div>

          <SubtotalRow label="TOTALE ATTIVO" value={totaleAttivo} isTotal color="blue" />
        </div>

        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} color="var(--danger)" />
            <h2 style={{ margin: 0, color: 'var(--text-bright)', fontSize: '1rem', fontWeight: 700 }}>PASSIVO — Fonti di Finanziamento</h2>
          </div>

          <FieldGroup label="A — Patrimonio Netto"          color="green"   icon="🏛️" defaultOpen={true} subtotal={patrimonioNetto}>
            <Field label="Capitale Sociale"                 {...f('capitaleSociale')} />
            <Field label="Riserva Legale"                   {...f('riservaLegale')} />
            <Field label="Riserve Statutarie"               {...f('riserveStatutarie')} />
            <Field label="Riserve Straordinarie e Facoltative" {...f('riserveStraodinarie')} />
            <Field label="Utili Portati a Nuovo"            {...f('utiliPrecedenti')} />
            <Field label="Perdite Portate a Nuovo (−)"      {...f('perditePrecedenti')} hint="Inserire come valore positivo" />
          </FieldGroup>
          <SubtotalRow label="Totale A — Patrimonio Netto"  value={patrimonioNetto} isTotal color="green" />

          <div style={{ marginTop: '1.25rem' }}>
            <FieldGroup label="C — Debiti a Breve Termine"  color="red"     icon="⚡" defaultOpen={true} subtotal={debitiBreve}>
              <Field label="Debiti verso Banche (Breve)"    {...f('debitiBanche')} />
              <Field label="Debiti verso Fornitori"         {...f('debitiFornitori')} />
              <Field label="Debiti Tributari"               {...f('debitiTributari')} />
              <Field label="Debiti Previdenziali (INPS/INAIL)" {...f('debitiPrevidenziali')} />
              <Field label="Debiti verso Dipendenti"        {...f('debitiVsDipendenti')} />
              <Field label="Altri Debiti a Breve"           {...f('altriDebitiBreve')} />
            </FieldGroup>
            <SubtotalRow label="Subtotale Debiti Breve"     value={debitiBreve}   color="red" />

            <FieldGroup label="C — Debiti a Lungo Termine"  color="red"     icon="🏗️" defaultOpen={false} subtotal={debitiLungoT}>
              <Field label="Mutui Ipotecari"                {...f('mutui')} />
              <Field label="Debiti per Leasing Finanziario" {...f('debitiLeasing')} />
              <Field label="Obbligazioni Emesse"            {...f('obbligazioni')} />
              <Field label="Altri Debiti a Lungo"           {...f('debitiLungo')} />
            </FieldGroup>
            <SubtotalRow label="Subtotale Debiti Lungo"     value={debitiLungoT}  color="red" />

            <FieldGroup label="B — Fondi Rischi e Oneri"    color="warning" icon="🛡️" defaultOpen={false} subtotal={fondi}>
              <Field label="Fondo TFR (Trattamento Fine Rapporto)" {...f('fondoTFR')} />
              <Field label="Fondo per Rischi e Oneri Futuri"       {...f('fondoRischi')} />
              <Field label="Fondo Imposte Differite"               {...f('fondoImposte')} />
              <Field label="Fondo Svalutazione Crediti"            {...f('fondoSvalutazione')} />
            </FieldGroup>

            <FieldGroup label="E — Ratei e Risconti Passivi" color="purple" icon="📅" defaultOpen={false}>
              <Field label="Ratei Passivi"    {...f('rateiPassivi')} />
              <Field label="Risconti Passivi" {...f('riscontiPassivi')} />
            </FieldGroup>
          </div>

          <SubtotalRow label="Totale Debiti + Fondi"     value={totalePassivo} isTotal color="red" />
          <SubtotalRow label="TOTALE PASSIVO E NETTO"    value={totaleFonti}   isTotal color={quadrato ? 'green' : 'red'} />

          <div className={`balance-status ${quadrato ? 'balanced' : 'unbalanced'}`} style={{ marginTop: '1.5rem' }}>
            {quadrato
              ? <><CheckCircle2 size={22}/> Bilancio in pareggio ✓</>
              : <><AlertCircle  size={22}/> Differenza: {differenza.toLocaleString('it-IT')} €</>
            }
          </div>

          {totaleAttivo > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-bright)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                Composizione Fonti
              </h4>
              {[
                { label: 'Patrimonio Netto', value: Math.max(0, patrimonioNetto), color: 'var(--success)' },
                { label: 'Debiti Breve',     value: debitiBreve,                  color: 'var(--danger)'  },
                { label: 'Debiti Lungo',     value: debitiLungoT,                 color: 'var(--warning)' },
                { label: 'Fondi',            value: fondi,                        color: 'var(--purple)'  },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color, fontFamily: 'var(--mono)' }}>
                      {totaleFonti > 0 ? pct(value, totaleFonti) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${totaleFonti > 0 ? Math.min(100, (value / totaleFonti) * 100) : 0}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatoPatrimoniale;