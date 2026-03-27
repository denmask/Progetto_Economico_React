import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SummaryCard = ({ title, value, icon, color, trend, trendLabel }) => {
  const hasTrend = trend !== undefined && trend !== null;

  const trendColor  = trend > 0 ? '#0fd494' : trend < 0 ? '#ff4d6a' : '#6a7a9b';
  const TrendIcon   = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendPrefix = trend > 0 ? '+' : '';

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: 14,
        borderLeft: `4px solid ${color}`,
        background: 'linear-gradient(145deg, rgba(15,21,36,0.9), rgba(6,8,16,0.95))',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderLeftColor: color,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform    = 'translateY(-3px)';
        e.currentTarget.style.boxShadow    = `0 12px 40px rgba(0,0,0,0.5), 0 0 20px ${color}18`;
        e.currentTarget.style.borderColor  = `${color}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform    = 'translateY(0)';
        e.currentTarget.style.boxShadow    = 'none';
        e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.07)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, right: 0,
          width: 120, height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <p style={{
          color: '#6a7a9b',
          margin: 0,
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          {title}
        </p>
        <div style={{
          color: color,
          background: `${color}18`,
          border: `1px solid ${color}28`,
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)',
        fontWeight: 700,
        color: '#f0f4ff',
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        marginBottom: hasTrend ? '0.6rem' : 0,
      }}>
        {value}
      </div>

      {hasTrend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.72rem',
          fontWeight: 700,
          color: trendColor,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <TrendIcon size={13} />
          <span>{trendPrefix}{trend}%</span>
          {trendLabel && (
            <span style={{ color: '#4a5878', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;