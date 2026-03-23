import React, { useContext, useRef } from 'react';
import FinancialContext from '../context/FinancialContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText } from 'lucide-react';

const Report = () => {
  const { state } = useContext(FinancialContext);
  const reportRef = useRef();

  const exportPDF = () => {
    const input = reportRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Report_Finanziario.pdf');
    });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Analisi Finale e Report</h2>
        <button className="btn" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> Scarica PDF
        </button>
      </div>

      <div ref={reportRef} className="card" style={{ padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <FileText size={48} color="#2563eb" />
          <h1>Prospetto Finanziario</h1>
          <p>Generato il: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid">
          <div>
            <h4>Performance Economica</h4>
            <p>Ricavi Totali: <strong>{state.contoEconomico.ricavi} €</strong></p>
            <p>EBITDA: <strong>{state.contoEconomico.ricavi - state.contoEconomico.costi} €</strong></p>
          </div>
          <div>
            <h4>Solidità Patrimoniale</h4>
            <p>Patrimonio Netto: <strong>{state.statoPatrimoniale.patrimonioNetto} €</strong></p>
            <p>Totale Attivo: <strong>{state.statoPatrimoniale.attivoCircolante + state.statoPatrimoniale.immobilizzazioni} €</strong></p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
          Note: Questo report è stato generato automaticamente tramite il Financial Dashboard Tool[cite: 11].
        </div>
      </div>
    </div>
  );
};

export default Report;