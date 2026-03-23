import React from 'react';

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <div className="card" style={{ 
      padding: '1.5rem', 
      borderLeft: `6px solid ${color}`,
      background: `linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{title}</p>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{value}</h2>
        </div>
        <div style={{ color: color, background: `${color}20`, padding: '10px', borderRadius: '12px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;