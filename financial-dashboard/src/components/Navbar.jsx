import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={{ background: '#1e293b', padding: '1rem', color: 'white' }}>
    <div className="container" style={{ display: 'flex', gap: '2rem', padding: 0 }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
      <Link to="/conto-economico" style={{ color: 'white', textDecoration: 'none' }}>Conto Economico</Link>
      <Link to="/stato-patrimoniale" style={{ color: 'white', textDecoration: 'none' }}>Stato Patrimoniale</Link>
      <Link to="/report" style={{ color: 'white', textDecoration: 'none' }}>Report</Link>
    </div>
  </nav>
);

export default Navbar;