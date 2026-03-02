import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({ onSearch }) {
    const [query, setQuery] = useState('');

    useEffect(() => {
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
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border-2 border-transparent bg-white shadow-md rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg transition-all hover:bg-gray-50 focus:bg-white"
                placeholder="Search for a surgical procedure (e.g. Breast Cancer, Appendectomy)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
