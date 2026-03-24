import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, ShieldCheck, Zap,
  TrendingUp, Scale, Target, FileText, ChevronRight,
} from 'lucide-react';

const features = [
  { icon: <Zap size={22} />,       title: 'Zero Server',    desc: 'Tutto lato client, nessun backend. React + localStorage.',     color: '#ffb340' },
  { icon: <BarChart3 size={22} />, title: 'Grafici Live',   desc: 'Aggiornamenti in tempo reale con Chart.js integrato.',          color: '#4f8ef7' },
  { icon: <ShieldCheck size={22}/>, title: 'Privacy Totale', desc: 'I dati restano nel tuo browser. Nessun account richiesto.',    color: '#0fd494' },
];

const sections = [
  { to: '/conto-economico',    icon: <TrendingUp size={20}/>, title: 'Conto Economico',     desc: 'Art. 2425 c.c. — Ricavi, Costi, EBITDA, EBIT, Utile d\'Esercizio', color: '#4f8ef7',  bg: 'rgba(79,142,247,0.07)'  },
  { to: '/stato-patrimoniale', icon: <Scale size={20}/>,      title: 'Stato Patrimoniale',  desc: 'Art. 2424 c.c. — Attivo, Passivo, Patrimonio, Indici bilancio',   color: '#00d4ff',  bg: 'rgba(0,212,255,0.07)'   },
  { to: '/preventivo',         icon: <Target size={20}/>,     title: 'Preventivo / Budget', desc: 'Budget vs Consuntivo — Analisi scostamenti per categoria',         color: '#0fd494',  bg: 'rgba(15,212,148,0.07)'  },
  { to: '/report',             icon: <FileText size={20}/>,   title: 'Report & Export',     desc: 'Prospetto consolidato — Esportazione PDF con un click',            color: '#a78bfa',  bg: 'rgba(167,139,250,0.07)' },
];

const css = `
  @keyframes heroUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes badgePop {
    0%  { opacity: 0; transform: scale(0.85) translateY(-8px); }
    65% { transform: scale(1.03) translateY(0); }
    100%{ opacity: 1; transform: scale(1); }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes orbDrift {
    0%,100%{ transform:translate(0,0) scale(1); }
    33%    { transform:translate(28px,-18px) scale(1.04); }
    66%    { transform:translate(-18px,14px) scale(0.97); }
  }
  @keyframes lineExpand {
    from { transform: scaleX(0); opacity:0; }
    to   { transform: scaleX(1); opacity:1; }
  }
  @keyframes dotPulse {
    0%,100%{ box-shadow:0 0 0 0 rgba(79,142,247,0.5); }
    50%    { box-shadow:0 0 0 5px rgba(79,142,247,0); }
  }

  /* Orbs */
  .h-orb {
    position:absolute; border-radius:50%;
    filter:blur(90px); pointer-events:none;
    animation:orbDrift 13s ease-in-out infinite;
  }

  /* Badge */
  .h-badge {
    display:inline-flex; align-items:center; gap:9px;
    padding:6px 16px; border-radius:6px;
    background:rgba(79,142,247,0.1);
    border:1px solid rgba(79,142,247,0.22);
    color:#7eb5f8;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:0.7rem; font-weight:700;
    letter-spacing:0.12em; text-transform:uppercase;
    margin-bottom:1.8rem;
    animation:badgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both;
    position:relative; z-index:1;
  }
  .h-dot {
    width:7px; height:7px; border-radius:50%;
    background:#4f8ef7; flex-shrink:0;
    animation:dotPulse 2s ease infinite;
  }

  /* Title */
  .h-title {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:clamp(2.1rem,4.5vw,3.4rem);
    font-weight:800;
    line-height:1.13;
    letter-spacing:-0.03em;
    color:#f0f4ff;
    margin:0 auto 1.1rem;
    max-width:660px;
    animation:heroUp 0.65s cubic-bezier(.22,1,.36,1) .25s both;
    position:relative; z-index:1;
    text-align:center;
  }
  .h-title-accent {
    color:#4f8ef7;
    position:relative; display:inline-block;
  }
  .h-title-accent::after {
    content:'';
    position:absolute; bottom:-4px; left:0; right:0;
    height:2px;
    background:linear-gradient(90deg,#4f8ef7,#00d4ff);
    transform-origin:left;
    animation:lineExpand 0.7s cubic-bezier(.22,1,.36,1) .9s both;
  }

  /* Sub */
  .h-sub {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:clamp(0.9rem,1.5vw,1.05rem);
    color:#8899bb; max-width:500px;
    margin:0 auto 2.5rem;
    line-height:1.8;
    animation:heroUp .6s ease .42s both;
    position:relative; z-index:1; text-align:center;
  }

  /* CTA */
  .h-cta {
    display:flex; gap:.8rem; justify-content:center;
    flex-wrap:wrap;
    animation:heroUp .6s ease .56s both;
    position:relative; z-index:1;
  }
  .h-btn-primary {
    display:inline-flex; align-items:center; gap:9px;
    padding:.82rem 1.9rem;
    background:#4f8ef7; color:#fff;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:.9rem; font-weight:700;
    border:none; border-radius:9px; cursor:pointer;
    box-shadow:0 0 24px rgba(79,142,247,.35),0 3px 10px rgba(0,0,0,.35);
    transition:all .22s ease;
  }
  .h-btn-primary:hover {
    background:#3d7ef5;
    box-shadow:0 0 40px rgba(79,142,247,.55),0 6px 18px rgba(0,0,0,.4);
    transform:translateY(-3px) scale(1.02);
  }
  .h-btn-ghost {
    display:inline-flex; align-items:center; gap:9px;
    padding:.82rem 1.9rem;
    background:rgba(255,255,255,.05); color:#eef2ff;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:.9rem; font-weight:700;
    border:1px solid rgba(255,255,255,.1); border-radius:9px; cursor:pointer;
    transition:all .22s ease;
  }
  .h-btn-ghost:hover {
    background:rgba(255,255,255,.09);
    border-color:rgba(255,255,255,.2);
    transform:translateY(-2px);
  }

  /* Feature cards */
  .h-feat {
    background:rgba(11,15,26,.97);
    border:1px solid rgba(255,255,255,.08);
    border-radius:13px; padding:1.9rem 1.5rem;
    text-align:center; cursor:default;
    position:relative; overflow:hidden;
    transition:
      transform .3s cubic-bezier(.34,1.56,.64,1),
      border-color .3s ease,
      box-shadow .3s ease;
  }
  .h-feat::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.03) 0%,transparent 55%);
    pointer-events:none;
  }
  .h-feat:hover {
    transform:translateY(-8px) scale(1.01);
    border-color:rgba(255,255,255,.14);
    box-shadow:0 24px 56px rgba(0,0,0,.5);
  }
  .h-feat-title {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:1rem; font-weight:800;
    color:#f0f4ff; margin-bottom:.5rem;
    letter-spacing:-.01em;
  }
  .h-feat-desc {
    font-size:.83rem; color:#4a5878; line-height:1.65;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  /* Section cards */
  .h-sec {
    border-radius:12px; padding:1.4rem 1.5rem;
    cursor:pointer; position:relative; overflow:hidden;
    display:flex; flex-direction:column; gap:7px;
    transition:
      transform .28s cubic-bezier(.34,1.56,.64,1),
      box-shadow .28s ease,
      border-color .28s ease;
  }
  .h-sec::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.025) 0%,transparent 50%);
    pointer-events:none;
  }
  .h-sec:hover {
    transform:translateY(-6px) scale(1.01);
    box-shadow:0 20px 48px rgba(0,0,0,.45);
  }
  .h-sec-title {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:1.05rem; font-weight:800;
    color:#f0f4ff; margin:0;
    letter-spacing:-.015em;
  }
  .h-sec-desc {
    font-size:.8rem; color:#4a5878;
    padding-left:44px; line-height:1.6;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  /* Sections heading */
  .h-sections-label {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:1.35rem; font-weight:800;
    color:#f0f4ff; text-align:center;
    margin-bottom:1.4rem; letter-spacing:-.02em;
  }

  /* Divider */
  .h-divider {
    height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
    margin:2.8rem 0;
    transform-origin:left;
    animation:lineExpand .8s ease .5s both;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <style>{css}</style>

      <section style={{
        position:'relative', overflow:'hidden',
        padding:'clamp(3.5rem,7vw,5.5rem) 1.5rem clamp(2.5rem,5vw,4rem)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        minHeight:'50vh',
      }}>
        <div className="h-orb" style={{ width:540,height:540,top:-100,left:'5%',  background:'rgba(79,142,247,.09)', animationDelay:'0s'   }} />
        <div className="h-orb" style={{ width:380,height:380,bottom:-70,right:'3%',background:'rgba(167,139,250,.07)',animationDelay:'-4s'  }} />
        <div className="h-orb" style={{ width:260,height:260,top:'40%',right:'18%',background:'rgba(0,212,255,.06)',  animationDelay:'-8s'  }} />

        <div className="h-badge">
          <span className="h-dot" />
          Fase 1 in sviluppo — 24 Marzo 2026
        </div>

        <h1 className="h-title">
          Gestisci i tuoi dati{' '}
          <span className="h-title-accent">Finanziari</span>
        </h1>

        <p className="h-sub">
          Uno strumento interattivo per PMI e professionisti. Conto Economico,
          Stato Patrimoniale, Preventivi e Report PDF — tutto nel browser.
        </p>

        <div className="h-cta">
          <button className="h-btn-primary" onClick={() => navigate('/conto-economico')}>
            Inizia Ora <ArrowRight size={16} />
          </button>
          <button className="h-btn-ghost" onClick={() => navigate('/report')}>
            Vedi Report <ChevronRight size={16} />
          </button>
        </div>
      </section>
      <div style={{ maxWidth:1340, margin:'0 auto', padding:'0 1.75rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.2rem', marginBottom:0 }}>
          {features.map(({ icon, title, desc, color }, i) => (
            <div
              key={i}
              className="h-feat"
              style={{ animation:`cardIn .5s cubic-bezier(.22,1,.36,1) ${.12+i*.1}s both` }}
            >
              <div style={{
                width:50,height:50, borderRadius:13,
                background:`${color}18`, border:`1px solid ${color}2e`,
                display:'flex',alignItems:'center',justifyContent:'center',
                margin:'0 auto .95rem', color,
                boxShadow:`0 0 18px ${color}18`,
              }}>
                {icon}
              </div>
              <div className="h-feat-title">{title}</div>
              <p className="h-feat-desc">{desc}</p>
            </div>
          ))}
        </div>

        <div className="h-divider" />

        <div className="h-sections-label">Sezioni del tool</div>

        {/* Section cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.1rem', marginBottom:'4rem' }}>
          {sections.map(({ to, icon, title, desc, color, bg }, i) => (
            <div
              key={i}
              className="h-sec"
              onClick={() => navigate(to)}
              style={{
                background:bg,
                border:`1px solid ${color}22`,
                animation:`cardIn .5s cubic-bezier(.22,1,.36,1) ${.2+i*.07}s both`,
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                <span style={{
                  color, background:`${color}1c`,
                  padding:'7px', borderRadius:9, display:'flex',
                  border:`1px solid ${color}28`,
                  boxShadow:`0 0 12px ${color}18`,
                  flexShrink:0,
                }}>
                  {icon}
                </span>
                <h3 className="h-sec-title">{title}</h3>
                <ChevronRight size={14} style={{ marginLeft:'auto', color:'#4a5878', flexShrink:0 }} />
              </div>
              <p className="h-sec-desc">{desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign:'center', fontSize:'.7rem', color:'#4a5878',
          borderTop:'1px solid rgba(255,255,255,.06)',
          paddingTop:'1.4rem', paddingBottom:'1rem',
          fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'.02em',
        }}>
          Financial Dashboard Tool — Denis Mascherin | Stage Front-End Developer | Progetto di Stage 2026
        </div>
      </div>

      <style>{`
        @media(max-width:640px){
          [style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}
          [style*="repeat(2,1fr)"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
};

export default Home;