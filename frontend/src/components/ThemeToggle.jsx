import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { mode, theme, toggleMode, setTheme, themes } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const isDark = mode === 'dark';

    return (
        <div className="flex items-center gap-2" ref={ref}>
            {/* Quick light/dark toggle */}
            <button
                onClick={toggleMode}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                    backgroundColor: 'var(--accent-bg)',
                    color: 'var(--accent)',
                }}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-hidden"
            >
                <span
                    className="block transition-transform duration-500"
                    style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </span>
            </button>

            {/* Theme palette dropdown */}
            <div className="relative">
                <button
                    onClick={() => setOpen((o) => !o)}
                    aria-label="Choose color theme"
                    style={{
                        backgroundColor: 'var(--accent-bg)',
                        color: 'var(--accent)',
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-sm font-semibold"
                >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Theme</span>
                    <ChevronDown
                        className="h-3.5 w-3.5 transition-transform duration-300"
                        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                </button>

                {open && (
                    <div
                        className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div
                            className="px-4 py-3 text-xs font-bold uppercase tracking-widest border-b"
                            style={{
                                color: 'var(--text-muted)',
                                borderColor: 'var(--border)',
                            }}
                        >
                            Color Theme
                        </div>
                        <div className="p-2 space-y-0.5">
                            {themes.map((t) => {
                                const active = t.key === theme;
                                return (
                                    <button
                                        key={t.key}
                                        onClick={() => { setTheme(t.key); setOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group"
                                        style={{
                                            backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {/* Swatch */}
                                        <span
                                            className="w-5 h-5 rounded-full ring-2 ring-offset-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                            style={{
                                                backgroundColor: t.swatch,
                                                ringColor: active ? t.swatch : 'transparent',
                                                boxShadow: active
                                                    ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${t.swatch}`
                                                    : `0 0 0 2px var(--bg-card)`,
                                            }}
                                        />
                                        {/* Label */}
                                        <span
                                            className="text-sm font-medium flex-1 text-left"
                                            style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
                                        >
                                            {t.label}
                                        </span>
                                        {/* Checkmark */}
                                        {active && (
                                            <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mode indicator in dropdown */}
                        <div
                            className="px-4 py-3 border-t flex items-center justify-between"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <span
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            <button
                                onClick={toggleMode}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                                style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
                            >
                                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
