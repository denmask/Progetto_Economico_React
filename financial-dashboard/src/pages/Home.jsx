import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, ShieldCheck, Zap,
  TrendingUp, Scale, Target, FileText, ChevronRight,
} from 'lucide-react';

const features = [
  { icon: <Zap size={20} />,        title: 'Zero Server',    desc: 'Tutto lato client, nessun backend. React + localStorage.',    color: '#ffb340' },
  { icon: <BarChart3 size={20} />,  title: 'Grafici Live',   desc: 'Aggiornamenti in tempo reale con Chart.js integrato.',         color: '#4f8ef7' },
  { icon: <ShieldCheck size={20}/>, title: 'Privacy Totale', desc: 'I dati restano nel tuo browser. Nessun account richiesto.',   color: '#0fd494' },
];

const sections = [
  { to: '/conto-economico',    icon: <TrendingUp size={19}/>, title: 'Conto Economico',     desc: 'Art. 2425 c.c. — Ricavi, Costi, EBITDA, EBIT, Utile d\'Esercizio', color: '#4f8ef7',  bg: 'rgba(79,142,247,0.06)'   },
  { to: '/stato-patrimoniale', icon: <Scale size={19}/>,      title: 'Stato Patrimoniale',  desc: 'Art. 2424 c.c. — Attivo, Passivo, Patrimonio, Indici bilancio',   color: '#00d4ff',  bg: 'rgba(0,212,255,0.06)'    },
  { to: '/preventivo',         icon: <Target size={19}/>,     title: 'Preventivo / Budget', desc: 'Budget vs Consuntivo — Analisi scostamenti per categoria',         color: '#0fd494',  bg: 'rgba(15,212,148,0.06)'   },
  { to: '/report',             icon: <FileText size={19}/>,   title: 'Report & Export',     desc: 'Prospetto consolidato — Esportazione PDF con un click',            color: '#a78bfa',  bg: 'rgba(167,139,250,0.06)'  },
];

const css = `
/* ─── KEYFRAMES ──────────────────────────────────────────── */
@keyframes heroUp {
  from { opacity:0; transform:translateY(28px); }
  to   { opacity:1; transform:translateY(0);    }
}
@keyframes badgePop {
  0%  { opacity:0; transform:scale(0.82) translateY(-10px); }
  65% { transform:scale(1.04) translateY(0); }
  100%{ opacity:1; transform:scale(1); }
}
@keyframes cardIn {
  from { opacity:0; transform:translateY(20px) scale(0.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes orbDrift {
  0%,100%{ transform:translate(0,0) scale(1); }
  33%    { transform:translate(30px,-22px) scale(1.05); }
  66%    { transform:translate(-20px,16px) scale(0.97); }
}
@keyframes lineExpand {
  from { transform:scaleX(0); opacity:0; }
  to   { transform:scaleX(1); opacity:1; }
}
@keyframes dotPulse {
  0%,100%{ opacity:0.7; box-shadow:0 0 0 0 rgba(15,212,148,0.5); }
  50%    { opacity:1;   box-shadow:0 0 0 4px rgba(15,212,148,0); }
}
@keyframes gradShift {
  0%,100%{ background-position: 0% 50%; }
  50%    { background-position: 100% 50%; }
}
@keyframes shimmerSlide {
  from { transform:translateX(-100%) skewX(-15deg); }
  to   { transform:translateX(300%) skewX(-15deg); }
}
@keyframes borderGlow {
  0%,100%{ opacity:0.5; }
  50%    { opacity:1; }
}

/* ─── AMBIENT ORBS ───────────────────────────────────────── */
.h-orb {
  position:absolute; border-radius:50%;
  filter:blur(100px); pointer-events:none;
  animation:orbDrift 14s ease-in-out infinite;
}

/* ─── BADGE ──────────────────────────────────────────────── */
.h-badge {
  display:inline-flex; align-items:center; gap:9px;
  padding:5px 16px 5px 12px;
  border-radius:99px;
  background:rgba(15,212,148,0.08);
  border:1px solid rgba(15,212,148,0.22);
  color:rgba(15,212,148,0.9);
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:0.68rem; font-weight:700;
  letter-spacing:0.13em; text-transform:uppercase;
  margin-bottom:2rem;
  animation:badgePop 0.55s cubic-bezier(.34,1.56,.64,1) 0.1s both;
  position:relative; z-index:1;
}
.h-dot {
  width:6px; height:6px; border-radius:50%;
  background:var(--success); flex-shrink:0;
  animation:dotPulse 2s ease infinite;
}

/* ─── HERO TITLE ─────────────────────────────────────────── */
.h-title {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:clamp(2.2rem,4.8vw,3.6rem);
  font-weight:800; line-height:1.1;
  letter-spacing:-0.035em;
  color:#f0f4ff;
  margin:0 auto 1.1rem;
  max-width:700px;
  animation:heroUp 0.65s cubic-bezier(.22,1,.36,1) .22s both;
  position:relative; z-index:1;
  text-align:center;
}

/* Animated gradient word */
.h-title-accent {
  background: linear-gradient(
    135deg,
    #4f8ef7 0%,
    #00d4ff 30%,
    #a78bfa 60%,
    #4f8ef7 100%
  );
  background-size:300% 300%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:gradShift 4s ease infinite;
  position:relative;
  display:inline-block;
}
.h-title-accent::after {
  content:'';
  position:absolute; bottom:-5px; left:0; right:0;
  height:2px;
  background:linear-gradient(90deg,#4f8ef7,#00d4ff,#a78bfa);
  background-size:200% 100%;
  border-radius:2px;
  transform-origin:left;
  animation:lineExpand 0.7s cubic-bezier(.22,1,.36,1) .9s both, gradShift 3s ease 1s infinite;
}

/* ─── HERO SUB ───────────────────────────────────────────── */
.h-sub {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:clamp(0.9rem,1.4vw,1.02rem);
  color:#7a8fb0; max-width:480px;
  margin:0 auto 2.8rem;
  line-height:1.85;
  animation:heroUp .6s ease .4s both;
  position:relative; z-index:1; text-align:center;
}

/* ─── CTA BUTTONS ────────────────────────────────────────── */
.h-cta {
  display:flex; gap:.85rem; justify-content:center;
  flex-wrap:wrap;
  animation:heroUp .6s ease .52s both;
  position:relative; z-index:1;
}
.h-btn-primary {
  display:inline-flex; align-items:center; gap:9px;
  padding:.8rem 2rem;
  background:linear-gradient(135deg,#4f8ef7,#3a7ff5);
  color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.88rem; font-weight:700;
  border:none; border-radius:10px; cursor:pointer;
  box-shadow:0 0 28px rgba(79,142,247,.38), 0 4px 14px rgba(0,0,0,.4);
  transition:all .25s cubic-bezier(.34,1.56,.64,1);
  position:relative; overflow:hidden;
}
.h-btn-primary::before {
  content:'';
  position:absolute; top:0; left:-60%;
  width:40%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
  transform:skewX(-15deg);
  transition:left .45s ease;
}
.h-btn-primary:hover::before { left:150%; }
.h-btn-primary:hover {
  background:linear-gradient(135deg,#5b9bff,var(--primary));
  box-shadow:0 0 44px rgba(79,142,247,.58), 0 6px 22px rgba(0,0,0,.45);
  transform:translateY(-3px) scale(1.02);
}
.h-btn-ghost {
  display:inline-flex; align-items:center; gap:9px;
  padding:.8rem 2rem;
  background:rgba(255,255,255,.04); color:#e8eeff;
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.88rem; font-weight:700;
  border:1px solid rgba(255,255,255,.1); border-radius:10px; cursor:pointer;
  transition:all .22s ease; backdrop-filter:blur(6px);
}
.h-btn-ghost:hover {
  background:rgba(255,255,255,.08);
  border-color:rgba(255,255,255,.22);
  transform:translateY(-2px);
  box-shadow:0 8px 28px rgba(0,0,0,.35);
}

/* ─── FEATURE CARDS ──────────────────────────────────────── */
.h-feat {
  background:rgba(11,15,26,.9);
  border:1px solid rgba(255,255,255,.07);
  border-radius:14px; padding:2rem 1.6rem;
  text-align:center; cursor:default;
  position:relative; overflow:hidden;
  backdrop-filter:blur(10px);
  transition:
    transform .3s cubic-bezier(.34,1.56,.64,1),
    border-color .3s ease,
    box-shadow .3s ease;
}
/* Top shine gradient */
.h-feat::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(160deg,rgba(255,255,255,.04) 0%,transparent 50%);
  pointer-events:none; border-radius:inherit;
}
/* Hover glow border pseudo */
.h-feat::after {
  content:''; position:absolute; inset:-1px;
  border-radius:14px;
  background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.06) 100%);
  opacity:0; transition:opacity .3s ease; pointer-events:none;
}
.h-feat:hover {
  transform:translateY(-9px) scale(1.01);
  box-shadow:0 28px 60px rgba(0,0,0,.55);
}
.h-feat:hover::after { opacity:1; }

.h-feat-icon {
  width:52px; height:52px; border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 1.1rem;
  position:relative;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
}
.h-feat:hover .h-feat-icon {
  transform:scale(1.1) translateY(-2px);
}

.h-feat-title {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.98rem; font-weight:800;
  color:#ecf0ff; margin-bottom:.5rem;
  letter-spacing:-.015em;
}
.h-feat-desc {
  font-size:.81rem; color:#4a5878; line-height:1.7;
  font-family:'Plus Jakarta Sans',sans-serif;
}

/* ─── DIVIDER ────────────────────────────────────────────── */
.h-divider {
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
  margin:3rem 0 2.6rem;
  transform-origin:left;
  animation:lineExpand .9s ease .5s both;
}

/* ─── SECTIONS LABEL ─────────────────────────────────────── */
.h-sections-label {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:1.3rem; font-weight:800;
  color:#f0f4ff; text-align:center;
  margin-bottom:1.6rem; letter-spacing:-.025em;
}
.h-sections-sub {
  font-size:.82rem; color:#4a5878;
  text-align:center; margin-top:-.9rem;
  margin-bottom:2rem;
  font-family:'Plus Jakarta Sans',sans-serif;
}

/* ─── SECTION CARDS ──────────────────────────────────────── */
.h-sec {
  border-radius:13px; padding:1.5rem 1.6rem;
  cursor:pointer; position:relative; overflow:hidden;
  display:flex; flex-direction:column; gap:8px;
  backdrop-filter:blur(10px);
  transition:
    transform .3s cubic-bezier(.34,1.56,.64,1),
    box-shadow .3s ease,
    border-color .3s ease;
}
.h-sec::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(150deg,rgba(255,255,255,.03) 0%,transparent 55%);
  pointer-events:none; border-radius:inherit;
}
/* Animated right-side glow on hover */
.h-sec::after {
  content:''; position:absolute;
  right:-40px; top:50%; width:80px; height:80px;
  border-radius:50%; transform:translateY(-50%);
  opacity:0; transition:opacity .35s ease;
  pointer-events:none; filter:blur(30px);
}
.h-sec:hover { transform:translateY(-6px) scale(1.01); box-shadow:0 22px 52px rgba(0,0,0,.5); }
.h-sec:hover::after { opacity:1; }

.h-sec-header {
  display:flex; align-items:center; gap:11px;
}
.h-sec-icon {
  padding:8px; border-radius:10px;
  display:flex; flex-shrink:0;
  transition:transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease;
}
.h-sec:hover .h-sec-icon { transform:scale(1.12) rotate(-3deg); }

.h-sec-title {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:1rem; font-weight:800;
  color:#f0f4ff; margin:0;
  letter-spacing:-.015em;
}
.h-sec-arrow {
  margin-left:auto; flex-shrink:0;
  color:#3a4a6a;
  transition:transform .22s ease, color .22s ease;
}
.h-sec:hover .h-sec-arrow { transform:translateX(3px); color:#6a7a9b; }

.h-sec-desc {
  font-size:.79rem; color:#3a4a6a;
  padding-left:42px; line-height:1.65;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:color .22s ease;
}
.h-sec:hover .h-sec-desc { color:#4a5a7b; }

/* ─── FOOTER ─────────────────────────────────────────────── */
.h-footer {
  text-align:center; font-size:.68rem; color:#2e3a52;
  border-top:1px solid rgba(255,255,255,.05);
  padding:1.5rem 0 1rem;
  font-family:'Plus Jakarta Sans',sans-serif;
  letter-spacing:.04em;
  display:flex; align-items:center; justify-content:center; gap:12px;
  flex-wrap:wrap;
}
.h-footer-sep { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,.12); }

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media(max-width:640px){
  .h-feat-grid  { grid-template-columns:1fr !important; }
  .h-sec-grid   { grid-template-columns:1fr !important; }
  .h-title      { font-size:1.9rem; }
}
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <style>{css}</style>
      <section style={{
        position:'relative', overflow:'hidden',
        padding:'clamp(4rem,8vw,6rem) 1.5rem clamp(3rem,5vw,4.5rem)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        minHeight:'52vh',
      }}>
        <div className="h-orb" style={{ width:580,height:580,top:-120,left:'2%',  background:'rgba(79,142,247,.07)',  animationDelay:'0s'   }} />
        <div className="h-orb" style={{ width:420,height:420,bottom:-80,right:'2%',background:'rgba(167,139,250,.06)',animationDelay:'-5s'  }} />
        <div className="h-orb" style={{ width:280,height:280,top:'45%',right:'20%',background:'rgba(0,212,255,.05)',  animationDelay:'-9s'  }} />

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
            Inizia Ora <ArrowRight size={15} />
          </button>
          <button className="h-btn-ghost" onClick={() => navigate('/report')}>
            Vedi Report <ChevronRight size={15} />
          </button>
        </div>
      </section>

      <div style={{ maxWidth:1340, margin:'0 auto', padding:'0 1.75rem' }}>
        <div className="h-feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.2rem' }}>
          {features.map(({ icon, title, desc, color }, i) => (
            <div
              key={i}
              className="h-feat"
              style={{ animation:`cardIn .5s cubic-bezier(.22,1,.36,1) ${.1+i*.1}s both` }}
            >
              <div
                className="h-feat-icon"
                style={{
                  background:`${color}16`,
                  border:`1px solid ${color}2a`,
                  boxShadow:`0 0 20px ${color}18`,
                  color,
                }}
              >
                {icon}
              </div>
              <div className="h-feat-title">{title}</div>
              <p className="h-feat-desc">{desc}</p>
            </div>
          ))}
        </div>

        <div className="h-divider" />

        <div className="h-sections-label">Sezioni del tool</div>
        <p className="h-sections-sub">Seleziona una sezione per iniziare</p>
        <div className="h-sec-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.1rem', marginBottom:'4rem' }}>
          {sections.map(({ to, icon, title, desc, color, bg }, i) => (
            <div
              key={i}
              className="h-sec"
              onClick={() => navigate(to)}
              style={{
                background:bg,
                border:`1px solid ${color}1e`,
                animation:`cardIn .5s cubic-bezier(.22,1,.36,1) ${.18+i*.08}s both`,
              }}
            >
              <div style={{
                position:'absolute', right:-30, top:'50%',
                width:80, height:80, borderRadius:'50%',
                background:color, filter:'blur(35px)',
                opacity:0, transform:'translateY(-50%)',
                transition:'opacity .35s ease',
                pointerEvents:'none',
              }} className="h-sec-glow" />

              <div className="h-sec-header">
                <span
                  className="h-sec-icon"
                  style={{ color, background:`${color}18`, border:`1px solid ${color}26`, boxShadow:`0 0 14px ${color}18` }}
                >
                  {icon}
                </span>
                <h3 className="h-sec-title">{title}</h3>
                <ChevronRight size={14} className="h-sec-arrow" />
              </div>
              <p className="h-sec-desc">{desc}</p>
            </div>
          ))}
        </div>

        <div className="h-footer">
          <span>Financial Dashboard Tool</span>
          <span className="h-footer-sep" />
          <span>Denis Mascherin</span>
          <span className="h-footer-sep" />
          <span>Stage Front‑End Developer</span>
          <span className="h-footer-sep" />
          <span>Progetto di Stage 2026</span>
        </div>
      </div>

      <style>{`
        .h-sec:hover .h-sec-glow { opacity: 0.12 !important; }
      `}</style>
    </div>
  );
};

export default Home;