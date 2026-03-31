import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = [
    { key: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
    { key: 'ocean', label: 'Ocean', swatch: '#0891b2' },
    { key: 'sunset', label: 'Sunset', swatch: '#ea580c' },
    { key: 'forest', label: 'Forest', swatch: '#16a34a' },
    { key: 'rose', label: 'Rose', swatch: '#e11d48' },
    { key: 'slate', label: 'Slate', swatch: '#64748b' },
];

const STORAGE_KEY = 'spl-theme';

function getInitial() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved?.theme && saved?.mode) return saved;
    } catch { /* ignore */ }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { theme: 'ocean', mode: prefersDark ? 'dark' : 'light' };
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [state, setState] = useState(getInitial);

    // Sync <html> attributes + localStorage whenever state changes
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', state.theme);
        root.setAttribute('data-mode', state.mode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const setTheme = useCallback((theme) => {
        setState((prev) => ({ ...prev, theme }));
    }, []);

    const toggleMode = useCallback(() => {
        setState((prev) => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
    }, []);

    return (
        <ThemeContext.Provider value={{ ...state, setTheme, toggleMode, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}
