import React, { useContext, useState } from 'react';
import FinancialContext from '../context/FinancialContext';
import { Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';

const fmt = (n) => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €';

const defaultCategories = [
  { id: 1, nome: 'Ricavi Vendite', budget: 0, consuntivo: 0 },
  { id: 2, nome: 'Costi del Personale', budget: 0, consuntivo: 0 },
  { id: 3, nome: 'Acquisti e Forniture', budget: 0, consuntivo: 0 },
  { id: 4, nome: 'Servizi Esterni', budget: 0, consuntivo: 0 },
  { id: 5, nome: 'Ammortamenti', budget: 0, consuntivo: 0 },
  { id: 6, nome: 'Oneri Finanziari', budget: 0, consuntivo: 0 },
];

const Preventivo = () => {
  const { state, dispatch } = useContext(FinancialContext);

  const [categorie, setCategorie] = useState(defaultCategories);
  const [newNome, setNewNome] = useState('');

  const { budget, consuntivo } = state.preventivo;

  const handleGlobalChange = (e) => {
    dispatch({ type: 'UPDATE_PREV', payload: { [e.target.name]: parseFloat(e.target.value) || 0 } });
  };

  const updateCat = (id, field, val) => {
    setCategorie(prev => prev.map(c => c.id === id ? { ...c, [field]: parseFloat(val) || 0 } : c));
  };

  const addCat = () => {
    if (!newNome.trim()) return;
    setCategorie(prev => [...prev, { id: Date.now(), nome: newNome.trim(), budget: 0, consuntivo: 0 }]);
    setNewNome('');
  };

  const removeCat = (id) => setCategorie(prev => prev.filter(c => c.id !== id));

  const totalBudget = categorie.reduce((a, c) => a + c.budget, 0);
  const totalConsuntivo = categorie.reduce((a, c) => a + c.consuntivo, 0);

  const scostamento = consuntivo - budget;
  const percentuale = budget !== 0 ? ((scostamento / budget) * 100).toFixed(1) : 0;
  const isPositive = scostamento >= 0;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-bright)', margin: 0 }}>
          <Target size={28} color="var(--success)" />
          Preventivo / Budget
        </h1>
        <p style={{ marginTop: 6 }}>Confronto Budget vs Consuntivo con analisi degli scostamenti per categoria</p>
      </div>

      {/* Globale */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card animate-in">
          <h3 style={{ color: 'var(--text-bright)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Valori Globali
          </h3>
          <div className="field">
            <label>Budget Previsionale (€)</label>
            <input type="number" name="budget" value={budget || ''} placeholder="0" onChange={handleGlobalChange} />
          </div>
          <div className="field">
            <label>Consuntivo Reale (€)</label>
            <input type="number" name="consuntivo" value={consuntivo || ''} placeholder="0" onChange={handleGlobalChange} />
          </div>
        </div>

        <div className="card animate-in" style={{
          border: `1px solid ${isPositive ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          background: isPositive ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Analisi Scostamento
            </span>
            {isPositive
              ? <CheckCircle2 size={22} color="var(--success)" />
              : <AlertCircle size={22} color="var(--danger)" />}
          </div>
          <div style={{
            fontSize: '2.5rem', fontFamily: 'var(--mono)', fontWeight: 800,
            color: isPositive ? 'var(--success)' : 'var(--danger)',
            marginBottom: '0.5rem',
          }}>
            {isPositive ? '+' : ''}{scostamento.toLocaleString('it-IT')} €
          </div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: isPositive ? 'var(--success)' : 'var(--danger)', marginBottom: '0.5rem' }}>
            {isPositive ? <TrendingUp size={16} style={{ display: 'inline' }}/> : <TrendingDown size={16} style={{ display: 'inline' }}/>}
            {' '}{percentuale}% rispetto al budget
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isPositive
              ? '✓ Performance superiore alle aspettative.'
              : '⚠ Performance inferiore al budget prefissato.'}
          </p>
        </div>
      </div>

      {/* Tabella categorie */}
      <div className="card animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ color: 'var(--text-bright)', margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            📋 Budget per Categoria
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newNome}
              onChange={e => setNewNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCat()}
              placeholder="Nuova categoria..."
              style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.45rem 0.8rem',
                color: 'var(--text-bright)', fontSize: '0.82rem',
                fontFamily: 'var(--font)', outline: 'none', minWidth: 180,
              }}
            />
            <button className="btn btn-primary" onClick={addCat} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Plus size={14}/> Aggiungi
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Categoria', 'Budget (€)', 'Consuntivo (€)', 'Scostamento', '%', ''].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: h === 'Categoria' ? 'left' : 'right',
                    color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorie.map(cat => {
                const sc = cat.consuntivo - cat.budget;
                const pct = cat.budget !== 0 ? ((sc / cat.budget) * 100).toFixed(1) : '—';
                const pos = sc >= 0;
                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.55rem 0.8rem', color: 'var(--text-bright)', fontWeight: 500 }}>{cat.nome}</td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right' }}>
                      <input type="number" value={cat.budget || ''} placeholder="0"
                        onChange={e => updateCat(cat.id, 'budget', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 6,
                          padding: '0.3rem 0.6rem', color: 'var(--text-bright)', fontFamily: 'var(--mono)',
                          fontSize: '0.82rem', width: 110, textAlign: 'right', outline: 'none' }} />
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right' }}>
                      <input type="number" value={cat.consuntivo || ''} placeholder="0"
                        onChange={e => updateCat(cat.id, 'consuntivo', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 6,
                          padding: '0.3rem 0.6rem', color: 'var(--text-bright)', fontFamily: 'var(--mono)',
                          fontSize: '0.82rem', width: 110, textAlign: 'right', outline: 'none' }} />
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', fontFamily: 'var(--mono)',
                      fontWeight: 700, color: pos ? 'var(--success)' : 'var(--danger)' }}>
                      {pos ? '+' : ''}{sc.toLocaleString('it-IT')} €
                    </td>
                    <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', fontFamily: 'var(--mono)',
                      color: pos ? 'var(--success)' : 'var(--danger)', fontSize: '0.8rem' }}>
                      {pct !== '—' ? `${pct}%` : '—'}
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right' }}>
                      <button onClick={() => removeCat(cat.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-bright)' }}>
                <td style={{ padding: '0.7rem 0.8rem', fontWeight: 700, color: 'var(--text-bright)' }}>TOTALE</td>
                <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)' }}>
                  {fmt(totalBudget)}
                </td>
                <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)' }}>
                  {fmt(totalConsuntivo)}
                </td>
                <td style={{ padding: '0.7rem 0.8rem', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700,
                  color: (totalConsuntivo - totalBudget) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {(totalConsuntivo - totalBudget) >= 0 ? '+' : ''}{(totalConsuntivo - totalBudget).toLocaleString('it-IT')} €
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Preventivo;