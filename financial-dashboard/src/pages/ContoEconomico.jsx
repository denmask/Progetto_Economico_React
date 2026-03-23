import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const ContoEconomico = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const { ricavi, costi, ammortamenti } = state.contoEconomico;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'UPDATE_CE',
      payload: { [name]: parseFloat(value) || 0 }
    });
  };

  const ebitda = ricavi - costi;
  const ebit = ebitda - ammortamenti;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Gestione Conto Economico</h2>
      
      <div className="grid">
        <div className="card">
          <h3>Inserimento Dati</h3>
          <div className="input-group">
            <label>Ricavi / Fatturato (€)</label>
            <input type="number" name="ricavi" value={ricavi} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Costi Operativi (€)</label>
            <input type="number" name="costi" value={costi} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Ammortamenti (€)</label>
            <input type="number" name="ammortamenti" value={ammortamenti} onChange={handleInputChange} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', borderLeft: '5px solid #22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
              <TrendingUp size={20} /> <strong>EBITDA</strong>
            </div>
            <h2 style={{ margin: '0.5rem 0', color: '#166534' }}>{ebitda.toLocaleString()} €</h2>
          </div>

          <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', borderLeft: '5px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
              <DollarSign size={20} /> <strong>EBIT (Risultato Operativo)</strong>
            </div>
            <h2 style={{ margin: '0.5rem 0', color: '#1e40af' }}>{ebit.toLocaleString()} €</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContoEconomico;