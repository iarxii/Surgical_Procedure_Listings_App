import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, BarChart3, Layers, Clock, Hash,
    TrendingUp, Stethoscope, ArrowRight, Loader2, AlertTriangle
} from 'lucide-react';

const CHART_COLORS = [
    'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
    'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
];

const MOCK_STATS = {
    total_procedures: 258,
    total_specialities: 23,
    total_mappings: 1450,
    avg_ttg_days: 14,
    by_speciality: [
        { name: "General Surgery", count: 45 },
        { name: "Orthopaedics", count: 38 },
        { name: "Cardiology", count: 25 },
        { name: "Gynaecology", count: 22 },
        { name: "Neurology", count: 18 },
        { name: "Urology", count: 16 }
    ],
    ttg_distribution: [
        { label: "< 24h", count: 15 },
        { label: "1-3 Days", count: 45 },
        { label: "1 Week", count: 68 },
        { label: "1 Month", count: 82 },
        { label: "> 1 Month", count: 48 }
    ],
    by_level: [
        { name: "Emergency (E)", count: 35 },
        { name: "Tertiary (T)", count: 120 },
        { name: "Regional (R)", count: 103 }
    ],
    by_care_setting: [
        { name: "ICU", count: 45 },
        { name: "High Care", count: 70 },
        { name: "General Ward", count: 125 },
        { name: "Outpatient", count: 18 }
    ],
    recent_procedures: [
        { id: 1, procedure_name: "Appendectomy", speciality: "General Surgery", level: "R/T", ttg_days: 1 },
        { id: 2, procedure_name: "Coronary Bypass", speciality: "Cardiology", level: "T/C", ttg_days: 7 },
        { id: 3, procedure_name: "Hip Replacement", speciality: "Orthopaedics", level: "R/T", ttg_months: "3 months" },
        { id: 4, procedure_name: "Craniotomy", speciality: "Neurology", level: "T/C", ttg_days: 2 }
    ]
};

function KpiCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="dashboard-kpi-card group" style={{ '--card-accent': accent || 'var(--accent)' }}>
            <div className="dashboard-kpi-icon">
                <Icon className="h-6 w-6" />
            </div>
            <div className="dashboard-kpi-content">
                <span className="dashboard-kpi-value">{value}</span>
                <span className="dashboard-kpi-label">{label}</span>
            </div>
        </div>
    );
}

function HorizontalBarChart({ data, title, icon: Icon }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="dashboard-chart-card">
            <h3 className="dashboard-chart-title">
                <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                {title}
            </h3>
            <div className="dashboard-bar-list">
                {data.map((item, i) => (
                    <div key={item.name} className="dashboard-bar-item">
                        <div className="dashboard-bar-label">
                            <span className="dashboard-bar-name">{item.name}</span>
                            <span className="dashboard-bar-count">{item.count}</span>
                        </div>
                        <div className="dashboard-bar-track">
                            <div
                                className="dashboard-bar-fill"
                                style={{
                                    width: `${(item.count / maxCount) * 100}%`,
                                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                    animationDelay: `${i * 80}ms`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VerticalBarChart({ data, title, icon: Icon }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="dashboard-chart-card">
            <h3 className="dashboard-chart-title">
                <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                {title}
            </h3>
            <div className="dashboard-vbar-container">
                {data.map((item, i) => (
                    <div key={item.label} className="dashboard-vbar-col">
                        <span className="dashboard-vbar-count">{item.count}</span>
                        <div className="dashboard-vbar-track">
                            <div
                                className="dashboard-vbar-fill"
                                style={{
                                    height: `${(item.count / maxCount) * 100}%`,
                                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                    animationDelay: `${i * 120}ms`,
                                }}
                            />
                        </div>
                        <span className="dashboard-vbar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutChart({ data, title, icon: Icon }) {
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    let accumulated = 0;
    const segments = data.map((item, i) => {
        const start = accumulated;
        accumulated += (item.count / total) * 100;
        return { ...item, start, end: accumulated, color: CHART_COLORS[i % CHART_COLORS.length] };
    });

    const conicGradient = segments
        .map(s => `${s.color} ${s.start}% ${s.end}%`)
        .join(', ');

    return (
        <div className="dashboard-chart-card">
            <h3 className="dashboard-chart-title">
                <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                {title}
            </h3>
            <div className="dashboard-donut-wrapper">
                <div
                    className="dashboard-donut"
                    style={{ background: `conic-gradient(${conicGradient})` }}
                >
                    <div className="dashboard-donut-hole">
                        <span className="dashboard-donut-total">{total}</span>
                        <span className="dashboard-donut-total-label">Total</span>
                    </div>
                </div>
                <div className="dashboard-donut-legend">
                    {segments.map(s => (
                        <div key={s.name} className="dashboard-legend-item">
                            <span className="dashboard-legend-dot" style={{ backgroundColor: s.color }} />
                            <span className="dashboard-legend-name">{s.name}</span>
                            <span className="dashboard-legend-count">{s.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PillBars({ data, title, icon: Icon }) {
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    return (
        <div className="dashboard-chart-card">
            <h3 className="dashboard-chart-title">
                <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                {title}
            </h3>
            <div className="dashboard-pill-list">
                {data.map((item, i) => {
                    const pct = ((item.count / total) * 100).toFixed(1);
                    return (
                        <div key={item.name} className="dashboard-pill-item">
                            <div className="dashboard-pill-header">
                                <span className="dashboard-pill-name">{item.name}</span>
                                <span className="dashboard-pill-pct">{pct}%</span>
                            </div>
                            <div className="dashboard-pill-track">
                                <div
                                    className="dashboard-pill-fill"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                        animationDelay: `${i * 100}ms`,
                                    }}
                                />
                            </div>
                            <span className="dashboard-pill-count">{item.count} procedures</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8085/api/dashboard/stats');
                setStats(res.data);
                setIsMock(false);
            } catch (err) {
                console.warn('Backend unavailable, falling back to MOCK_STATS for Dashboard.');
                setStats(MOCK_STATS);
                setIsMock(true);
                // setError('Could not load dashboard data. Ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
                <p>Loading dashboard…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-root">
            {/* Page header */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">
                    <BarChart3 className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                    Dashboard Overview
                </h2>
                <p className="dashboard-subtitle">
                    Key metrics and visualizations for the surgical procedure catalogue.
                </p>
            </div>

            {isMock && (
                <div className="mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-in fade-in" 
                     style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                    <AlertTriangle className="h-5 w-5" />
                    Offline Preview Mode: Rendering Sample KPI Data.
                </div>
            )}

            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
                <KpiCard icon={Activity} label="Total Procedures" value={stats.total_procedures} accent="var(--chart-1)" />
                <KpiCard icon={Stethoscope} label="Specialities" value={stats.total_specialities} accent="var(--chart-2)" />
                <KpiCard icon={Hash} label="ICD Mappings" value={stats.total_mappings} accent="var(--chart-3)" />
                <KpiCard icon={Clock} label="Avg Clinical SLA (days)" value={stats.avg_ttg_days} accent="var(--chart-4)" />
            </div>

            {/* Charts – Row 1 */}
            <div className="dashboard-charts-row">
                <HorizontalBarChart data={stats.by_speciality} title="Procedures by Speciality" icon={Layers} />
                <VerticalBarChart data={stats.ttg_distribution} title="Clinical SLA Distribution" icon={TrendingUp} />
            </div>

            {/* Charts – Row 2 */}
            <div className="dashboard-charts-row">
                <DonutChart data={stats.by_level} title="Procedures by Level" icon={BarChart3} />
                <PillBars data={stats.by_care_setting} title="By Care Setting" icon={Stethoscope} />
            </div>

            {/* Recent Procedures Table */}
            <div className="dashboard-chart-card dashboard-table-card">
                <h3 className="dashboard-chart-title">
                    <Clock className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    Recently Added Procedures
                </h3>
                <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Procedure</th>
                                <th>Speciality</th>
                                <th>Level</th>
                                <th>Clinical SLA Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent_procedures.map(proc => (
                                <tr key={proc.id}>
                                    <td className="dashboard-table-name">{proc.procedure_name}</td>
                                    <td>
                                        <span className="dashboard-table-badge">{proc.speciality}</span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{proc.level || '—'}</td>
                                    <td style={{ fontWeight: 600 }}>
                                        {proc.ttg_days ? `${proc.ttg_days} days` : proc.ttg_months || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
