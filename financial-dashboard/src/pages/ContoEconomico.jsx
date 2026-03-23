import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ContoEconomico = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const ce = state.contoEconomico;

  const handleChange = (e) => {
    dispatch({ 
      type: 'UPDATE_CE', 
      payload: { [e.target.name]: parseFloat(e.target.value) || 0 } 
    });
  };

  const totaleRicavi = (ce.ricaviVendita || 0) + (ce.canoniLocazione || 0) + (ce.interessiAttivi || 0) + (ce.rimanenzeFinali || 0) + (ce.plusvalenze || 0);
  const totaleCosti = (ce.acquistiMerci || 0) + (ce.personale || 0) + (ce.serviziTecnici || 0);
  const ebitda = totaleRicavi - totaleCosti;
  const utile = ebitda - (ce.ammortamenti || 0) - (ce.oneriFinanziari || 0) - (ce.imposte || 0);

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '2rem', borderBottom: '4px solid var(--primary)' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <TrendingUp size={32} color="var(--primary)" /> Analisi Conto Economico
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Gestione ricavi e costi d'esercizio basata su riclassificazione bilancio.</p>
      </div>

      <div className="grid">
        <section className="card">
          <h3 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ArrowUpRight size={20}/> Entrate e Ricavi
          </h3>
          <div className="input-group">
            <label>Ricavi di Vendita</label>
            <input type="number" name="ricaviVendita" value={ce.ricaviVendita} onChange={handleChange} step="100" />
            
            <label>Rimanenze Finali</label>
            <input type="number" name="rimanenzeFinali" value={ce.rimanenzeFinali} onChange={handleChange} step="50" />
            
            <label>Canoni Locazione</label>
            <input type="number" name="canoniLocazione" value={ce.canoniLocazione} onChange={handleChange} step="50" />
            
            <label>Plusvalenze / Altri</label>
            <input type="number" name="plusvalenze" value={ce.plusvalenze} onChange={handleChange} step="10" />
          </div>
        </section>

        <section className="card">
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ArrowDownRight size={20}/> Costi Operativi
          </h3>
          <div className="input-group">
            <label>Acquisti Merci</label>
            <input type="number" name="acquistiMerci" value={ce.acquistiMerci} onChange={handleChange} step="100" />
            
            <label>Costi Personale</label>
            <input type="number" name="personale" value={ce.personale} onChange={handleChange} step="100" />
            
            <label>Servizi e Manutenzioni</label>
            <input type="number" name="serviziTecnici" value={ce.serviziTecnici} onChange={handleChange} step="50" />
            
            <label>Ammortamenti</label>
            <input type="number" name="ammortamenti" value={ce.ammortamenti} onChange={handleChange} step="10" />
          </div>
        </section>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--success)' }}>
          <span style={{ color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>Margine Operativo (EBITDA)</span>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff' }}>{ebitda.toLocaleString()} €</h2>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--primary)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>Utile d'Esercizio</span>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff' }}>{utile.toLocaleString()} €</h2>
        </div>
      </div>
    </div>
  );
};

export default ContoEconomico;