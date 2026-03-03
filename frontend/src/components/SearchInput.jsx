import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ onSearch, externalValue }) {
    const [query, setQuery] = useState(externalValue || '');
    const skipDebounceRef = useRef(false);

    useEffect(() => {
        if (externalValue !== undefined && externalValue !== query) {
            skipDebounceRef.current = true;
            setQuery(externalValue);
        }
    }, [externalValue]);

    useEffect(() => {
        // Skip the debounce if the query was set externally (e.g. from procedure selection)
        if (skipDebounceRef.current) {
            skipDebounceRef.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            if (query.length >= 3 || query.length === 0) {
                onSearch(query);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    return (
        <div className="relative max-w-2xl w-full mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 transition-colors" style={{ color: 'var(--text-muted)' }} />
            </div>
            <input
                type="text"
                className="block w-full pl-12 pr-12 py-4 border-2 border-transparent shadow-md rounded-2xl leading-5 text-lg transition-all focus:outline-none focus:ring-4"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    boxShadow: `0 4px 6px var(--shadow-color)`,
                    '--tw-ring-color': 'color-mix(in srgb, var(--accent) 20%, transparent)',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.parentElement.querySelector('.lucide-search').style.color = 'var(--accent)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.parentElement.querySelector('.lucide-search').style.color = 'var(--text-muted)';
                }}
                placeholder="Search for a surgical procedure (e.g. Breast Cancer, Appendectomy)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => { setQuery(''); onSearch(''); }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none transition-colors cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    aria-label="Clear search"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
