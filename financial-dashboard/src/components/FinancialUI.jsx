import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

const fmt = (n) => {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

function useMountClass(className) {
  const ref = useRef(null);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !ref.current) return;
    applied.current = true;
    const el = ref.current;
    el.classList.add(className);
    const remove = () => el.classList.remove(className);
    el.addEventListener('animationend', remove, { once: true });
    return () => el.removeEventListener('animationend', remove);
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
              fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 700,
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

export const Field = ({ label, name, value, onChange, hint, allowNegative = false }) => {
  const [display, setDisplay] = useState(
    value === 0 || value === '' || value == null ? '' : String(value)
  );

  useEffect(() => {
    const num = Number(value);
    setDisplay(num === 0 ? '' : String(num));
  }, [value]);

  const emit = useCallback(
    (num) => {
      const truncated = Math.trunc(num);
      const safe = isNaN(truncated) ? 0 : truncated;
      onChange({ target: { name, value: String(safe) } });
      return safe;
    },
    [name, onChange]
  );

  const handleChange = (e) => {
    const raw = e.target.value;
    setDisplay(raw);
    if (raw === '' || raw === '-') {
      emit(0);
      return;
    }
    const n = parseFloat(raw);
    if (!isNaN(n)) emit(n);
  };

  const handleBlur = (e) => {
    const n = parseFloat(e.target.value);
    const safe = isNaN(n) ? 0 : Math.trunc(n);
    setDisplay(safe === 0 ? '' : String(safe));
    emit(safe);
  };

  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const displayRef = useRef(display);
  useEffect(() => { displayRef.current = display; }, [display]);

  const spin = useCallback(
    (dir) => {
      const cur = parseFloat(displayRef.current) || 0;
      const next = Math.trunc(cur) + dir;
      const str = next === 0 ? '' : String(next);
      setDisplay(str);
      displayRef.current = str;
      emit(next);
    },
    [emit]
  );

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
      <div className="field-input-wrap">
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
    green: 'var(--success)', red: 'var(--danger)', blue: 'var(--primary)',
    cyan: 'var(--accent)', purple: 'var(--purple)', warning: 'var(--warning)',
  };
  const c = colorMap[color] || 'var(--text-bright)';
  return (
    <div
      className={`subtotal-row${isTotal ? ' total' : ''}`}
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

export const KpiCard = ({ label, value, sub, color = 'blue', icon }) => {
  const ref = useMountClass('kpi-mount');

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
      <div className="kpi-value">
        {typeof value === 'number'
          ? value.toLocaleString('it-IT', { minimumFractionDigits: 0 }) + ' €'
          : value}
      </div>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  );
};