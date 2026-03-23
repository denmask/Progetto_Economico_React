import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '8px 16px', 
          background: 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '20px', 
          color: 'var(--primary)', 
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          ✨ Disponibile Fase 1: Sviluppo Core [cite: 53]
        </div>
        
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
          Domina i tuoi dati <br />
          <span style={{ background: 'linear-gradient(to right, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Finanziari
          </span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Uno strumento interattivo senza server [cite: 10, 20] per professionisti e PMI[cite: 14, 15]. 
          Gestisci Conto Economico e Stato Patrimoniale in un'unica dashboard[cite: 11, 30].
        </p>

        <button className="btn" onClick={() => navigate('/conto-economico')}>
          Inizia Ora <ArrowRight size={20} />
        </button>

        <div className="grid" style={{ marginTop: '5rem', opacity: 0.8 }}>
          <div style={{ textAlign: 'center' }}>
            <Zap color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: 0 }}>Zero Server</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tutto lato client [cite: 20, 21]</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <BarChart3 color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: 0 }}>Grafici Live</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualizzazione immediata </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ShieldCheck color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: 0 }}>Privacy Totale</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dati solo nel tuo browser [cite: 21, 63]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;