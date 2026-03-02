import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function AuthorizedProcedures({ onSelectProcedure }) {
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8085/api/procedures/catalog');
                setProcedures(response.data.data);
            } catch (err) {
                console.error("Failed to fetch custom catalog:", err);
                setError("Could not load authorized procedures list.");
            } finally {
                setLoading(false);
            }
        };

        fetchCatalog();
    }, []);

    if (loading) {
        return (
            <div className="mt-12 text-center animate-pulse" style={{ color: 'var(--text-muted)' }}>
                <div className="h-5 rounded-full w-48 mb-4 mx-auto" style={{ backgroundColor: 'var(--border)' }}></div>
                <div className="h-4 rounded-full max-w-[360px] mx-auto mb-2.5" style={{ backgroundColor: 'var(--border)' }}></div>
                <div className="h-4 rounded-full mb-2.5 mx-auto max-w-[300px]" style={{ backgroundColor: 'var(--border)' }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="mt-12 rounded-xl p-4 flex items-center shadow-sm"
                style={{
                    backgroundColor: 'var(--error-bg)',
                    color: 'var(--error-text)',
                    border: '1px solid var(--error-border)',
                }}
            >
                <AlertCircle className="h-5 w-5 mr-3" />
                {error}
            </div>
        );
    }

    if (procedures.length === 0) {
        return null;
    }

    // Group procedures by speciality
    const groupedProcedures = procedures.reduce((acc, proc) => {
        const category = proc.speciality || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(proc);
        return acc;
    }, {});

    return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                        <BookOpen className="h-5 w-5" />
                    </div>
                    Authorized Procedure List
                </h3>
                <span
                    className="text-sm font-semibold px-3 py-1 rounded-full shadow-sm"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                    }}
                >
                    {procedures.length} Procedures
                </span>
            </div>

            <div className="space-y-10">
                {Object.entries(groupedProcedures).map(([speciality, items]) => (
                    <div key={speciality} className="relative">
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-4" style={{ color: 'var(--accent)' }}>
                            {speciality}
                            <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
                            >
                                {items.length}
                            </span>
                            <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-accent)' }}></div>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(proc => (
                                <button
                                    key={proc.id}
                                    onClick={() => onSelectProcedure(proc.procedure_name)}
                                    className="text-left group flex flex-col justify-between rounded-xl p-4 shadow-sm transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                                        e.currentTarget.style.borderColor = 'var(--border-accent)';
                                        e.currentTarget.style.boxShadow = `0 10px 15px var(--shadow-color)`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                >
                                    <p className="font-semibold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                                        {proc.procedure_name}
                                    </p>
                                    <div className="flex items-center justify-between text-xs font-medium w-full mt-auto" style={{ color: 'var(--text-muted)' }}>
                                        <span
                                            className="px-2 py-0.5 rounded transition-colors"
                                            style={{
                                                backgroundColor: 'var(--bg-secondary)',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            TTG: {proc.ttg_days ? `${proc.ttg_days} Days` : proc.ttg_months}
                                        </span>
                                        {proc.icd_codes && proc.icd_codes.length > 0 && (
                                            <span className="font-mono tracking-wide text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                                {proc.icd_codes.map(c => c.code).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
