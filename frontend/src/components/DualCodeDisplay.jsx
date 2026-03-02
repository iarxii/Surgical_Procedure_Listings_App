import React from 'react';

export default function DualCodeDisplay({ icd10, icd11, procedures }) {
    const dbMatch = procedures && procedures.length > 0 ? procedures[0] : null;

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ICD-10-CM Column */}
            <div
                className="rounded-2xl shadow-sm overflow-hidden flex flex-col h-full"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                }}
            >
                <div
                    className="px-6 py-5 flex-shrink-0"
                    style={{
                        backgroundColor: 'var(--icd10-heading-bg)',
                        borderBottom: '1px solid var(--icd10-heading-border)',
                    }}
                >
                    <h3 className="text-xl font-bold flex items-center drop-shadow-sm" style={{ color: 'var(--icd10-heading-text)' }}>
                        <span
                            className="text-white rounded-md px-2 py-1 text-sm mr-3 uppercase tracking-wider shadow-md"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            ICD-10-CM
                        </span>
                        NIH Query Results
                    </h3>
                    <p className="text-sm mt-2 font-medium" style={{ color: 'var(--accent)' }}>
                        Diagnosis codes specifying side or specifics
                    </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {dbMatch && dbMatch.icd_codes && dbMatch.icd_codes.length > 0 && (
                        <div
                            className="mb-8 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
                            style={{
                                backgroundColor: 'var(--icd10-bg)',
                                border: '1px solid var(--icd10-border)',
                            }}
                        >
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center" style={{ color: 'var(--icd10-text)' }}>
                                <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: 'var(--success-text)' }}></span>
                                Primary Match (Internal DB)
                            </h4>
                            {dbMatch.icd_codes.map(code => (
                                <div key={code.id} className="flex justify-between items-start">
                                    <span
                                        className="font-mono text-xl font-extrabold px-2 py-1 rounded shadow-sm"
                                        style={{
                                            color: 'var(--icd10-text)',
                                            backgroundColor: 'color-mix(in srgb, var(--icd10-bg) 70%, var(--bg-card))',
                                        }}
                                    >
                                        {code.code}
                                    </span>
                                    <span className="text-sm flex-1 ml-4 mt-1 leading-snug" style={{ color: 'var(--icd10-text)' }}>
                                        {code.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                        NIH API Suggestions
                    </h4>
                    {icd10 && icd10.length > 0 ? (
                        <ul className="space-y-2" style={{ borderColor: 'var(--border)' }}>
                            {icd10.slice(0, 7).map((item, index) => (
                                <li
                                    key={index}
                                    className="py-3 flex rounded-lg px-3 -mx-3 cursor-default transition-colors"
                                    style={{ border: '1px solid transparent' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <span className="font-mono font-semibold w-24 flex-shrink-0 text-lg" style={{ color: 'var(--text-primary)' }}>
                                        {item.code}
                                    </span>
                                    <span className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {item.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center p-8 rounded-xl"
                            style={{
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px dashed var(--border)',
                            }}
                        >
                            <p className="text-sm italic">No direct suggestions found from NIH.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ICD-11 Column */}
            <div
                className="rounded-2xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                }}
            >
                <div
                    className="px-6 py-5 flex-shrink-0"
                    style={{
                        backgroundColor: 'var(--icd11-heading-bg)',
                        borderBottom: '1px solid var(--icd11-heading-border)',
                    }}
                >
                    <h3 className="text-xl font-bold flex items-center drop-shadow-sm" style={{ color: 'var(--icd11-heading-text)' }}>
                        <span
                            className="text-white rounded-md px-2 py-1 text-sm mr-3 uppercase tracking-wider shadow-md"
                            style={{ backgroundColor: 'var(--icd11-badge-bg)' }}
                        >
                            ICD-11
                        </span>
                        WHO Query Results
                    </h3>
                    <p className="text-sm mt-2 font-medium" style={{ color: 'var(--icd11-heading-text)' }}>
                        Base code typically followed by postcoordination
                    </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                        WHO API Suggestions
                    </h4>
                    {icd11 && icd11.length > 0 ? (
                        <ul className="space-y-2">
                            {icd11.map((item, index) => (
                                <li
                                    key={index}
                                    className="py-3 flex rounded-lg px-3 -mx-3 cursor-default transition-colors"
                                    style={{ border: '1px solid transparent' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--icd11-hover)';
                                        e.currentTarget.style.borderColor = 'var(--icd11-hover-border)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <span className="font-mono font-semibold w-24 flex-shrink-0 text-lg" style={{ color: 'var(--text-primary)' }}>
                                        {item.code}
                                    </span>
                                    <span className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {item.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center p-8 rounded-xl"
                            style={{
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px dashed var(--border)',
                            }}
                        >
                            <p className="text-sm italic">No direct suggestions found from WHO.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
