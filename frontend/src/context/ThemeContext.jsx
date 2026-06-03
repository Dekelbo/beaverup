import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// --- Create shared theme state ---
const ThemeContext = createContext(null);
const THEME_KEY = 'beaverup-theme';

// --- Load saved theme preference ---
function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return 'light';
}

// --- Provide theme controls to the app ---
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      isDarkMode,
      theme,
      toggleTheme: () => setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'))
    }),
    [isDarkMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// --- Read theme context safely ---
function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}

export { ThemeProvider, useTheme };
