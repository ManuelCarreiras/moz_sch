import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import type { ThemeId } from '../constants/themes';

export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: ThemeId) => {
    setTheme(id);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn btn--small"
        title="Theme"
        aria-label={`Theme: ${theme}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          padding: '0.4rem 0.5rem',
          minWidth: '36px',
        }}
      >
        <span aria-hidden="true">{theme === 'light' ? '\u2600' : '\u263D'}</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            padding: '0.25rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '100px',
          }}
        >
          {availableThemes.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(opt.id as ThemeId)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.35rem 0.6rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: theme === opt.id ? 'var(--primary-light)' : 'transparent',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {t(opt.id === 'default' ? 'theme.dark' : 'theme.light')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
