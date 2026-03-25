import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import Home from './pages/Home';
import ContoEconomico from './pages/ContoEconomico';
import StatoPatrimoniale from './pages/StatoPatrimoniale';
import Preventivo from './pages/Preventivo';
import Report from './pages/Report';
import StoricoDati from './pages/StoricoDati';
import Navbar from './components/Navbar';
import './styles/global.css';

function App() {
  return (
    <FinancialProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conto-economico" element={<ContoEconomico />} />
          <Route path="/stato-patrimoniale" element={<StatoPatrimoniale />} />
          <Route path="/preventivo" element={<Preventivo />} />
          <Route path="/report" element={<Report />} />
          <Route path="/storico/:anno" element={<StoricoDati />} />
        </Routes>
      </Router>
    </FinancialProvider>
  );
}

export default App;