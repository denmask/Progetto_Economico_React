import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FinancialContext, { ANNI, ANNO_CORRENTE } from '../context/FinancialContext';
import { Calendar, ExternalLink } from 'lucide-react';

const AnnoSelector = () => {
  const { state, dispatch } = useContext(FinancialContext);
  const navigate = useNavigate();
  const selected = state.annoSelezionato;

  return (
    <div className="anno-selector">
      <span className="anno-selector-label">
        <Calendar size={13} />
        Esercizio
      </span>
      <div className="anno-tabs">
        {ANNI.map(anno => (
          <div key={anno} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              className={`anno-tab${selected === anno ? ' active' : ''}${anno === ANNO_CORRENTE ? ' current' : ''}`}
              onClick={() => dispatch({ type: 'SET_ANNO', anno })}
            >
              {anno}
              {anno === ANNO_CORRENTE && <span className="anno-dot" />}
            </button>
            <button
              title={`Vedi storico ${anno}`}
              onClick={() => navigate(`/storico/${anno.replace('/', '-')}`)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 5,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <ExternalLink size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnoSelector;