import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import type { LanguageId } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage();
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

  const handleSelect = (id: LanguageId) => {
    setLanguage(id);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn btn--small"
        title={t('common.language')}
        aria-label={`Language: ${language}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          padding: '0.4rem 0.5rem',
          minWidth: '36px',
        }}
      >
        <span aria-hidden="true">🌐</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Language options"
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
          {availableLanguages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(lang.id as LanguageId)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.35rem 0.6rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: language === lang.id ? 'var(--primary-light)' : 'transparent',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {t(`language.${lang.id}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
