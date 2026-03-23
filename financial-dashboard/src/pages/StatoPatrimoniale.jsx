import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { Landmark, Wallet, Scale } from 'lucide-react';

const StatoPatrimoniale = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const sp = state.statoPatrimoniale;

  const handleChange = (e) => {
    dispatch({ 
      type: 'UPDATE_SP', 
      payload: { [e.target.name]: parseFloat(e.target.value) || 0 } 
    });
  };

  const totaleAttivo = (sp.cassa || 0) + (sp.creditiComm || 0) + (sp.rimanenze || 0) + (sp.immobilizzazioni || 0);
  const totalePassivo = (sp.debitiBreve || 0) + (sp.debitiLungo || 0) + (sp.fondoTFR || 0);
  const netto = (sp.capitaleSociale || 0) + (sp.riserve || 0);

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '2rem', borderBottom: '4px solid var(--accent)' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Scale size={32} color="var(--accent)" /> Stato Patrimoniale
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Analisi degli Impieghi (Attivo) e delle Fonti (Passivo e Netto).</p>
      </div>

      <div className="grid">
        <div className="card">
          <h2 style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Landmark size={24} /> Attivo (Impieghi)
          </h2>
          <div className="input-group">
            <label>Cassa e Banca</label>
            <input type="number" name="cassa" value={sp.cassa} onChange={handleChange} step="100" />
            
            <label>Crediti Commerciali</label>
            <input type="number" name="creditiComm" value={sp.creditiComm} onChange={handleChange} step="100" />
            
            <label>Rimanenze di Magazzino</label>
            <input type="number" name="rimanenze" value={sp.rimanenze} onChange={handleChange} step="100" />
            
            <label>Immobilizzazioni Nette</label>
            <input type="number" name="immobilizzazioni" value={sp.immobilizzazioni} onChange={handleChange} step="500" />
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
            <h3 style={{ margin: 0 }}>Totale Attivo: {totaleAttivo.toLocaleString()} €</h3>
          </div>
        </div>

        <div className="card">
          <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={24} /> Passivo e Netto (Fonti)
          </h2>
          <div className="input-group">
            <label>Debiti verso Fornitori</label>
            <input type="number" name="debitiBreve" value={sp.debitiBreve} onChange={handleChange} step="100" />
            
            <label>Debiti Bancari / Mutui</label>
            <input type="number" name="debitiLungo" value={sp.debitiLungo} onChange={handleChange} step="500" />
            
            <label>Fondo TFR</label>
            <input type="number" name="fondoTFR" value={sp.fondoTFR} onChange={handleChange} step="100" />
            
            <label>Capitale Sociale e Riserve</label>
            <input type="number" name="capitaleSociale" value={sp.capitaleSociale} onChange={handleChange} step="1000" />
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '12px' }}>
            <h3 style={{ margin: 0 }}>Totale Fonti: {(totalePassivo + netto).toLocaleString()} €</h3>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', border: sp.cassa > 0 ? '1px solid var(--glass-border)' : '1px solid var(--danger)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Controllo Quadratura Bilancio (Attivo - Fonti)</p>
        <h2 style={{ color: (totaleAttivo - (totalePassivo + netto)) === 0 ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
          Differenza: {(totaleAttivo - (totalePassivo + netto)).toLocaleString()} €
        </h2>
      </div>
    </div>
  );
};

export default StatoPatrimoniale;