import React, { useContext } from 'react';
import FinancialContext from '../context/FinancialContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Preventivo = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const { budget, consuntivo } = state.preventivo;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'UPDATE_PREV',
      payload: { [name]: parseFloat(value) || 0 }
    });
  };

  const scostamento = consuntivo - budget;
  const percentuale = budget !== 0 ? ((scostamento / budget) * 100).toFixed(1) : 0;
  const isPositive = scostamento >= 0;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Budget vs Consuntivo</h2>
      
      <div className="grid">
        <div className="card">
          <h3>Inserimento Valori</h3>
          <div className="input-group">
            <label>Budget Previsionale (€)</label>
            <input type="number" name="budget" value={budget} onChange={handleInputChange} />
          </div>
          <div className="input-group">
            <label>Consuntivo Reale (€)</label>
            <input type="number" name="consuntivo" value={consuntivo} onChange={handleInputChange} />
          </div>
        </div>

        <div className="card" style={{ 
          borderLeft: `8px solid ${isPositive ? '#22c55e' : '#ef4444'}`,
          background: isPositive ? '#f0fdf4' : '#fef2f2' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Analisi Scostamento</h4>
            {isPositive ? <CheckCircle2 color="#22c55e" /> : <AlertCircle color="#ef4444" />}
          </div>
          
          <h2 style={{ color: isPositive ? '#166534' : '#991b1b', margin: '1rem 0' }}>
            {isPositive ? '+' : ''}{scostamento.toLocaleString()} €
          </h2>
          
          <p style={{ fontWeight: '600', color: isPositive ? '#166534' : '#991b1b' }}>
            {percentuale}% rispetto al budget
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {isPositive 
              ? "Ottimo! La performance ha superato le aspettative previste." 
              : "Attenzione: la performance è inferiore al budget prefissato."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Preventivo;