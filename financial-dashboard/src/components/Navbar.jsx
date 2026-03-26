import { Link, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Scale, Target, FileText, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const links = [
  { to: '/',                   label: 'Dashboard',          icon: <BarChart3 size={15}/> },
  { to: '/conto-economico',    label: 'Conto Economico',    icon: <TrendingUp size={15}/> },
  { to: '/stato-patrimoniale', label: 'Stato Patrimoniale', icon: <Scale size={15}/> },
  { to: '/preventivo',         label: 'Preventivo',         icon: <Target size={15}/> },
  { to: '/report',             label: 'Report',             icon: <FileText size={15}/> },
];

const navStyle = `
  .nav-root {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(6,8,16,0.82);
    backdrop-filter: blur(24px) saturate(1.6);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }
  .nav-root.scrolled {
    background: rgba(6,8,16,0.96);
    box-shadow: 0 4px 32px rgba(0,0,0,0.5);
  }
  .nav-inner {
    max-width: 1360px;
    margin: 0 auto;
    padding: 0 1.75rem;
    display: flex;
    align-items: center;
    height: 62px;
    justify-content: space-between;
  }
  .nav-logo {
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 11px;
    transition: opacity 0.2s;
  }
  .nav-logo:hover { opacity: 0.85; }
  .nav-logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg, #4f8ef7, #00d4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 18px rgba(79,142,247,0.45);
    flex-shrink: 0;
    transition: box-shadow 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .nav-logo:hover .nav-logo-icon {
    box-shadow: 0 0 30px rgba(79,142,247,0.7);
    transform: scale(1.08) rotate(-4deg);
  }
  .nav-logo-text {
    color: #eef2ff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
  }
  .nav-links {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.44rem 0.9rem;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.83rem;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  .nav-link::after {
    content: '';
    position: absolute;
    top: 0;
    left: -60%;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: skewX(-15deg);
    transition: left 0.4s ease;
  }
  .nav-link:hover::after { left: 150%; }
  .nav-link.inactive { color: #6a7a9b; }
  .nav-link.inactive:hover {
    color: #c0ccee;
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.1);
    transform: translateY(-1px);
  }
  .nav-link.active {
    color: #4f8ef7;
    background: rgba(79,142,247,0.12);
    border-color: rgba(79,142,247,0.28);
    box-shadow: 0 0 16px rgba(79,142,247,0.2);
  }
  .nav-link.active:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 24px rgba(79,142,247,0.35);
  }
  .nav-hamburger {
    display: none !important;
    background: none;
    border: none;
    color: #6a7a9b;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
  }
  .nav-hamburger:hover { color: #c0ccee; background: rgba(255,255,255,0.06); }
  .nav-mobile-menu {
    overflow: hidden;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1);
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .nav-mobile-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.9rem 1.75rem;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  @media (max-width: 800px) {
    .nav-links     { display: none !important; }
    .nav-hamburger { display: flex !important; }
  }
`;

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav-root${scrolled ? ' scrolled' : ''}`}>
      <style>{navStyle}</style>
      <div className="nav-inner">

        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <BarChart3 size={17} color="#fff" />
          </div>
          <span className="nav-logo-text">FinDash</span>
        </Link>

        <div className="nav-links">
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${pathname === to ? 'active' : 'inactive'}`}
            >
              {icon} {label}
            </Link>
          ))}
        </div>

        <button className="nav-hamburger" onClick={() => setOpen(o => !o)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className="nav-mobile-menu" style={{ maxHeight: open ? 400 : 0 }}>
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="nav-mobile-link"
            onClick={() => setOpen(false)}
            style={{
              color: pathname === to ? '#4f8ef7' : '#6a7a9b',
              background: pathname === to ? 'rgba(79,142,247,0.08)' : 'transparent',
              borderLeft: pathname === to ? '3px solid #4f8ef7' : '3px solid transparent',
            }}
          >
            {icon} {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;