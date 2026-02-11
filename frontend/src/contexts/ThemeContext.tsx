import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUser } from './AuthContext';
import { THEMES, type ThemeId } from '../constants/themes';

const STORAGE_KEY_PREFIX = 'theme_';

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  availableThemes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function loadStoredTheme(userId: string | undefined): ThemeId {
  if (!userId) return 'default';
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (stored && THEMES.some((t) => t.id === stored)) {
      return stored as ThemeId;
    }
  } catch {
    // ignore
  }
  return 'default';
}

function applyTheme(themeId: ThemeId) {
  if (themeId === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const user = useUser();
  const [theme, setThemeState] = useState<ThemeId>(() =>
    loadStoredTheme(user?.id)
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const stored = loadStoredTheme(user?.id);
    setThemeState(stored);
    applyTheme(stored);
  }, [user?.id]);

  const setTheme = (themeId: ThemeId) => {
    if (!user?.id) return;
    setThemeState(themeId);
    applyTheme(themeId);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, themeId);
    } catch {
      // ignore
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    availableThemes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
