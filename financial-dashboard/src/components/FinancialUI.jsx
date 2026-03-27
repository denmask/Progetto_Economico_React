import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

function useMountClass(className) {
  const ref     = useRef(null);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !ref.current) return;
    applied.current = true;
    const el = ref.current;
    el.classList.add(className);
    el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
  }, []);

  return ref;
}

export const FieldGroup = ({ label, color = 'blue', icon, children, subtotal, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useMountClass('animate-in');

  return (
    <div className="accordion-section" ref={ref}>
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <h3>
          <span className={`section-title ${color}`}>{icon} {label}</span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {subtotal !== undefined && (
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: color === 'green' ? 'var(--success)' : color === 'red' ? 'var(--danger)' : 'var(--primary)',
            }}>
              {fmt(subtotal)}
            </span>
          )}
          <ChevronDown size={16} className={`accordion-chevron${open ? ' open' : ''}`} />
        </div>
      </div>
      <div className={`accordion-body${open ? ' open' : ''}`}>
        <div className="grid-2">{children}</div>
      </div>
    </div>
  );
};

export const Field = ({ label, name, value, onChange, hint }) => {
  const [display, setDisplay] = useState(
    value === 0 || value === '' || value == null ? '' : String(value)
  );

  useEffect(() => {
    const num = Number(value);
    setDisplay(num === 0 ? '' : String(num));
  }, [value]);

  const currentNum = parseFloat(display) || 0;
  const inputColor = currentNum > 0
    ? 'rgba(15,212,148,0.65)'
    : currentNum < 0
    ? 'rgba(255,77,106,0.65)'
    : undefined;

  const emit = useCallback((num) => {
    const safe = isNaN(Math.trunc(num)) ? 0 : Math.trunc(num);
    onChange({ target: { name, value: String(safe) } });
    return safe;
  }, [name, onChange]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setDisplay(raw);
    if (raw === '' || raw === '-') { emit(0); return; }
    const n = parseFloat(raw);
    if (!isNaN(n)) emit(n);
  };

  const handleBlur = (e) => {
    const safe = isNaN(parseFloat(e.target.value)) ? 0 : Math.trunc(parseFloat(e.target.value));
    setDisplay(safe === 0 ? '' : String(safe));
    emit(safe);
  };

  const timerRef    = useRef(null);
  const intervalRef = useRef(null);
  const displayRef  = useRef(display);
  useEffect(() => { displayRef.current = display; }, [display]);

  const spin = useCallback((dir) => {
    const next = Math.trunc(parseFloat(displayRef.current) || 0) + dir;
    const str  = next === 0 ? '' : String(next);
    setDisplay(str);
    displayRef.current = str;
    emit(next);
  }, [emit]);

  const startPress = (dir) => {
    spin(dir);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => spin(dir), 55);
    }, 360);
  };

  const stopPress = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div
        className="field-input-wrap"
        style={inputColor ? { borderColor: inputColor, boxShadow: `0 0 0 2px ${inputColor}22` } : {}}
      >
        <button
          type="button"
          className="field-spin-btn"
          onMouseDown={() => startPress(-1)}
          onMouseUp={stopPress}
          onMouseLeave={stopPress}
          onTouchStart={(e) => { e.preventDefault(); startPress(-1); }}
          onTouchEnd={stopPress}
          tabIndex={-1}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          name={name}
          value={display}
          placeholder="0"
          onChange={handleChange}
          onBlur={handleBlur}
          autoComplete="off"
          style={inputColor ? { color: inputColor } : {}}
        />
        <button
          type="button"
          className="field-spin-btn"
          onMouseDown={() => startPress(1)}
          onMouseUp={stopPress}
          onMouseLeave={stopPress}
          onTouchStart={(e) => { e.preventDefault(); startPress(1); }}
          onTouchEnd={stopPress}
          tabIndex={-1}
        >
          +
        </button>
      </div>
      {hint && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {hint}
        </span>
      )}
    </div>
  );
};

export const SubtotalRow = ({ label, value, isTotal = false, color }) => {
  const colorMap = {
    green:   'var(--success)',
    red:     'var(--danger)',
    blue:    'var(--primary)',
    cyan:    'var(--accent)',
    purple:  'var(--purple)',
    warning: 'var(--warning)',
  };
  const c = colorMap[color] || 'var(--text-bright)';

  return (
    <div
      className={`subtotal-row${isTotal ? ` total ${color}` : ''}`}
      style={isTotal && color ? { borderColor: `${c}40`, background: `${c}10` } : {}}
    >
      <span style={{ color: isTotal ? c : 'var(--text)', fontFamily: 'var(--font)' }}>
        {label}
      </span>
      <span style={{ color: c, fontFamily: 'var(--mono)', fontWeight: isTotal ? 700 : 500 }}>
        {typeof value === 'number'
          ? value.toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €'
          : '—'}
      </span>
    </div>
  );
};

export const KpiCard = ({ label, value, sub, color = 'blue', icon, prevValue }) => {
  const ref = useMountClass('kpi-mount');

  const hasTrend   = prevValue !== undefined && prevValue !== null && prevValue !== 0;
  const delta      = hasTrend ? value - prevValue : 0;
  const deltaPct   = hasTrend ? ((delta / Math.abs(prevValue)) * 100).toFixed(1) : null;
  const trendUp    = delta >= 0;
  const trendColor = trendUp ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={`kpi-card ${color}`} ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="kpi-label">{label}</span>
        {icon && (
          <span style={{ opacity: 0.4, color: 'var(--text-muted)', flexShrink: 0 }}>
            {icon}
          </span>
        )}
      </div>
      <div className="kpi-inner-glow" />
      <div className="kpi-value">
        {typeof value === 'number'
          ? value.toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €'
          : value}
      </div>
      {sub && <span className="kpi-sub">{sub}</span>}
      {hasTrend && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: '0.4rem',
          fontSize: '0.68rem',
          fontFamily: 'var(--mono)',
          fontWeight: 700,
          color: trendColor,
        }}>
          {trendUp
            ? <TrendingUp size={11} />
            : <TrendingDown size={11} />
          }
          <span>{trendUp ? '+' : ''}{deltaPct}% vs anno prec.</span>
        </div>
      )}
    </div>
  );
};