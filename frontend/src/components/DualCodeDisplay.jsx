import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_SHOW = 10;

function CodeResultList({ items, initialShow = INITIAL_SHOW, hoverBg, hoverBorder }) {
    const [expanded, setExpanded] = useState(false);
    const [groupExpand, setGroupExpand] = useState({});
    const displayItems = expanded ? items : items.slice(0, initialShow);
    const hasMore = items.length > initialShow;

    // Group items by matched_query if available (code-based search)
    const hasGroups = items.some(item => item.matched_query);

    // Build grouped structure
    let groupedItems = null;
    if (hasGroups) {
        const groups = {};
        const groupOrder = [];
        items.forEach(item => {
            const key = item.matched_query || '_ungrouped';
            if (!groups[key]) {
                groups[key] = { label: key, source: item.match_source, items: [] };
                groupOrder.push(key);
            }
            groups[key].items.push(item);
        });
        groupedItems = groupOrder.map(key => groups[key]);
    }

    const toggleGroup = (key) => setGroupExpand(prev => ({ ...prev, [key]: !prev[key] }));

    const renderItem = (item, index) => (
        <li
            key={`${item.code}-${index}`}
            className="py-3 flex rounded-lg px-3 -mx-3 cursor-default transition-colors"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg || 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = hoverBorder || 'var(--border)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            <span className="font-mono font-semibold w-28 flex-shrink-0 text-lg" style={{ color: 'var(--text-primary)' }}>
                {item.code}
            </span>
            <span className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.title}
            </span>
        </li>
    );

    // Grouped rendering for code-based searches
    if (hasGroups && groupedItems) {
        return (
            <div className="space-y-4">
                {groupedItems.map((group) => {
                    const isOpen = groupExpand[group.label] !== false; // default open
                    const sourceLabel = group.source === 'code' ? 'Main Code' : group.source === 'sub_code' ? 'Sub-Code' : 'Name';
                    return (
                        <div key={group.label}>
                            <button
                                onClick={() => toggleGroup(group.label)}
                                className="flex items-center gap-2 w-full text-left mb-2 py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                            >
                                {isOpen ? <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />}
                                <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent)' }}>{group.label}</span>
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}>
                                    {sourceLabel}
                                </span>
                                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{group.items.length} results</span>
                            </button>
                            {isOpen && (
                                <ul className="space-y-1" style={{ borderColor: 'var(--border)' }}>
                                    {group.items.map((item, idx) => renderItem(item, idx))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Flat list rendering (text searches)
    return (
        <>
            <ul className="space-y-2" style={{ borderColor: 'var(--border)' }}>
                {displayItems.map((item, index) => renderItem(item, index))}
            </ul>
            {hasMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                    style={{
                        color: 'var(--accent)',
                        backgroundColor: 'var(--accent-bg)',
                        border: '1px solid var(--border-accent)',
                    }}
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4" /> Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" /> Show All {items.length} Results
                        </>
                    )}
                </button>
            )}
        </>
    );
}

export default function DualCodeDisplay({ icd10, icd11, procedures }) {

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
                        <a
                            href="https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                                color: 'var(--accent)',
                                backgroundColor: 'var(--accent-bg)',
                                border: '1px solid var(--border-accent)',
                            }}
                            title="View NIH ClinicalTables ICD-10-CM API"
                        >
                            <ExternalLink className="h-3 w-3" /> NIH API
                        </a>
                    </h3>
                    <p className="text-sm mt-2 font-medium" style={{ color: 'var(--accent)' }}>
                        Diagnosis codes specifying side or specifics
                    </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                        NIH API Suggestions
                        {icd10 && icd10.length > 0 && (
                            <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                                {icd10.length}
                            </span>
                        )}
                    </h4>
                    {icd10 && icd10.length > 0 ? (
                        <CodeResultList
                            items={icd10}
                            hoverBg="var(--bg-secondary)"
                            hoverBorder="var(--border)"
                        />
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
                        <a
                            href="https://icd.who.int/browse/2024-01/mms/en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                                color: 'var(--icd11-heading-text)',
                                backgroundColor: 'var(--icd11-hover)',
                                border: '1px solid var(--icd11-heading-border)',
                            }}
                            title="Browse WHO ICD-11 Classification"
                        >
                            <ExternalLink className="h-3 w-3" /> WHO ICD-11
                        </a>
                    </h3>
                    <p className="text-sm mt-2 font-medium" style={{ color: 'var(--icd11-heading-text)' }}>
                        Base code typically followed by postcoordination
                    </p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                        WHO API Suggestions
                        {icd11 && icd11.length > 0 && (
                            <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--icd11-hover)', color: 'var(--icd11-heading-text)' }}>
                                {icd11.length}
                            </span>
                        )}
                    </h4>
                    {icd11 && icd11.length > 0 ? (
                        <CodeResultList
                            items={icd11}
                            hoverBg="var(--icd11-hover)"
                            hoverBorder="var(--icd11-hover-border)"
                        />
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
