import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';

const StatoPatrimoniale = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const { attivoCircolante, immobilizzazioni, passivoBreve, passivoLungo, patrimonioNetto } = state.statoPatrimoniale;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'UPDATE_SP',
      payload: { [name]: parseFloat(value) || 0 }
    });
  };

  const totaleAttivo = attivoCircolante + immobilizzazioni;
  const totalePassivo = passivoBreve + passivoLungo + patrimonioNetto;
  const currentRatio = passivoBreve !== 0 ? (attivoCircolante / passivoBreve).toFixed(2) : 0;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Stato Patrimoniale</h2>
      <div className="grid">
        <div className="card">
          <h4 style={{ color: '#2563eb' }}>ATTIVO</h4>
          <div className="input-group">
            <label>Attivo Circolante</label>
            <input type="number" name="attivoCircolante" value={attivoCircolante} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Immobilizzazioni</label>
            <input type="number" name="immobilizzazioni" value={immobilizzazioni} onChange={handleInputChange} />
          </div>
          <hr />
          <p><strong>Totale Attivo: {totaleAttivo.toLocaleString()} €</strong></p>
        </div>

        <div className="card">
          <h4 style={{ color: '#ef4444' }}>PASSIVO & NETTO</h4>
          <div className="input-group">
            <label>Passività a breve</label>
            <input type="number" name="passivoBreve" value={passivoBreve} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Patrimonio Netto</label>
            <input type="number" name="patrimonioNetto" value={patrimonioNetto} onChange={handleInputChange} />
          </div>
          <hr />
          <p><strong>Bilancio: {totalePassivo.toLocaleString()} €</strong></p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h4>Indice di Liquidità</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentRatio >= 1.5 ? '#22c55e' : '#f59e0b' }}>
            {currentRatio}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Ratio (Attivo Circ. / Passivo Breve)</p>
        </div>
      </div>
    </div>
  );
};

export default StatoPatrimoniale;