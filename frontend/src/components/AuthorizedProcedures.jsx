import { useState, useMemo } from 'react';
import { BookOpen, AlertCircle, CheckCircle2, Filter, ChevronDown } from 'lucide-react';

export default function AuthorizedProcedures({ onSelectProcedure, catalogData }) {
    const { procedures = [], specialities = [], loaded = false, error = null } = catalogData || {};

    // Filter state
    const [showMappedOnly, setShowMappedOnly] = useState(false);
    const [selectedSpeciality, setSelectedSpeciality] = useState('all');

    // Helper: check verification status
    const isIcd10Verified = (proc) => !!proc.icd10_verified_at;
    const isIcd11Verified = (proc) => !!proc.icd11_verified_at;
    const isAnyVerified = (proc) => isIcd10Verified(proc) || isIcd11Verified(proc);
    const isBothVerified = (proc) => isIcd10Verified(proc) && isIcd11Verified(proc);

    // Derived: filtered procedures
    const filtered = useMemo(() => {
        let list = procedures;
        if (showMappedOnly) {
            list = list.filter(p => isAnyVerified(p));
        }
        if (selectedSpeciality !== 'all') {
            list = list.filter(p => p.speciality === selectedSpeciality);
        }
        return list;
    }, [procedures, showMappedOnly, selectedSpeciality]);

    // Derived: grouped procedures
    const groupedProcedures = useMemo(() => {
        return filtered.reduce((acc, proc) => {
            const category = proc.speciality || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push(proc);
            return acc;
        }, {});
    }, [filtered]);

    // Count helpers
    const verifiedCount = useMemo(() =>
        procedures.filter(p => isAnyVerified(p)).length,
        [procedures]);

    if (!loaded) {
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

    return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
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
                    {filtered.length === procedures.length
                        ? `${procedures.length} Procedures`
                        : `${filtered.length} / ${procedures.length} Procedures`}
                </span>
            </div>

            {/* Filter Bar */}
            <div
                className="flex flex-wrap items-center gap-3 mb-8 p-3 rounded-xl"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                }}
            >
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <Filter className="h-4 w-4" />
                    Filters
                </div>

                {/* Verified-only toggle pill */}
                <button
                    onClick={() => setShowMappedOnly(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                    style={{
                        backgroundColor: showMappedOnly ? 'var(--success-bg)' : 'var(--bg-card)',
                        color: showMappedOnly ? 'var(--success-text)' : 'var(--text-muted)',
                        border: `1px solid ${showMappedOnly ? 'var(--success-border)' : 'var(--border)'}`,
                        boxShadow: showMappedOnly ? '0 0 8px var(--success-border)' : 'none',
                    }}
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Only
                    <span
                        className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                            backgroundColor: showMappedOnly ? 'var(--success-text)' : 'var(--text-muted)',
                            color: showMappedOnly ? 'var(--success-bg)' : 'var(--bg-card)',
                        }}
                    >
                        {verifiedCount}
                    </span>
                </button>

                {/* Speciality dropdown */}
                <div className="relative ml-auto">
                    <select
                        value={selectedSpeciality}
                        onChange={(e) => setSelectedSpeciality(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-semibold cursor-pointer"
                        style={{
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            outline: 'none',
                        }}
                    >
                        <option value="all">All Specialities</option>
                        {specialities.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                    />
                </div>
            </div>

            {/* Empty filter state */}
            {filtered.length === 0 && (
                <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                    <Filter className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-semibold">No procedures match the current filters.</p>
                    <p className="text-sm mt-1">Try adjusting the filters above.</p>
                </div>
            )}

            {/* Grouped procedure cards */}
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
                            {items.map(proc => {
                                const hasIcd10 = isIcd10Verified(proc);
                                const hasIcd11 = isIcd11Verified(proc);
                                const hasBoth = hasIcd10 && hasIcd11;
                                const hasAny = hasIcd10 || hasIcd11;

                                // Choose left bar color
                                const barColor = hasBoth
                                    ? 'linear-gradient(180deg, var(--success-text), var(--icd11-badge-bg))'
                                    : hasIcd10
                                        ? 'var(--success-text)'
                                        : hasIcd11
                                            ? 'var(--icd11-badge-bg)'
                                            : 'transparent';

                                const borderColor = hasAny ? 'var(--success-border)' : 'var(--border)';

                                return (
                                    <button
                                        key={proc.id}
                                        onClick={() => onSelectProcedure(proc)}
                                        className="text-left group flex flex-col justify-between rounded-xl p-4 shadow-sm transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer relative overflow-hidden"
                                        style={{
                                            backgroundColor: 'var(--bg-card)',
                                            border: `1px solid ${borderColor}`,
                                            boxShadow: hasAny
                                                ? `0 0 0 1px ${borderColor}, 0 2px 8px var(--shadow-color)`
                                                : undefined,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                                            e.currentTarget.style.borderColor = 'var(--border-accent)';
                                            e.currentTarget.style.boxShadow = `0 10px 15px var(--shadow-color)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                            e.currentTarget.style.borderColor = borderColor;
                                            e.currentTarget.style.boxShadow = hasAny
                                                ? `0 0 0 1px ${borderColor}, 0 2px 8px var(--shadow-color)`
                                                : '';
                                        }}
                                    >
                                        {/* Left accent bar for verified procedures */}
                                        {hasAny && (
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                                style={{ background: barColor }}
                                            />
                                        )}

                                        {/* Verification badges — top right */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                            {hasIcd10 && (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        backgroundColor: 'var(--success-bg)',
                                                        color: 'var(--success-text)',
                                                        border: '1px solid var(--success-border)',
                                                    }}
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    ICD-10
                                                </span>
                                            )}
                                            {hasIcd11 && (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        backgroundColor: 'var(--icd11-heading-bg)',
                                                        color: 'var(--icd11-heading-text)',
                                                        border: '1px solid var(--icd11-heading-border)',
                                                    }}
                                                >
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    ICD-11
                                                </span>
                                            )}
                                        </div>

                                        <p className="font-semibold leading-tight mb-4 pr-20" style={{ color: 'var(--text-primary)' }}>
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
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
