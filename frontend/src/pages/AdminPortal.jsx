import { Link } from 'react-router-dom';
import { LayoutGrid, FileUp, Users, ShieldAlert, ChevronRight, Database, Settings } from 'lucide-react';

export default function AdminPortal() {
    const adminActions = [
        {
            title: 'Excel Import',
            description: 'Update clinical SLA targets and procedure mappings from Excel files.',
            icon: FileUp,
            path: '/admin/import',
            color: 'var(--accent)',
            bg: 'var(--accent-bg)'
        },
        {
            title: 'User Management',
            description: 'Manage admin access and clinical user permissions (Coming Soon).',
            icon: Users,
            path: '#',
            color: 'var(--success-text)',
            bg: 'var(--success-bg)',
            disabled: true
        },
        {
            title: 'System Audit',
            description: 'Review logs of clinical data modifications and imports.',
            icon: ShieldAlert,
            path: '#',
            color: 'var(--warning-text)',
            bg: 'var(--warning-bg)',
            disabled: true
        }
    ];

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                    <LayoutGrid className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Administrative Control
                    </h2>
                    <p className="text-lg font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage system data and secure access
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {adminActions.map((action, idx) => (
                    <Link 
                        key={idx}
                        to={action.disabled ? '#' : action.path}
                        className={`group relative p-8 rounded-3xl transition-all duration-300 border shadow-sm ${action.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-1'}`}
                        style={{ 
                            backgroundColor: 'var(--bg-card)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: action.bg, color: action.color }}
                            >
                                <action.icon className="h-8 w-8" />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                                {action.title}
                            </h3>
                            
                            <p className="text-base leading-relaxed mb-auto" style={{ color: 'var(--text-muted)' }}>
                                {action.description}
                            </p>
                            
                            {!action.disabled && (
                                <div className="mt-8 flex items-center font-bold text-sm tracking-widest uppercase gap-2 transition-all group-hover:gap-4" style={{ color: action.color }}>
                                    Manage Now <ChevronRight className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-3xl border border-dashed flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            System Status
                        </p>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            Database Version: V4 (Active)
                        </p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/5 shadow-sm" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <Settings className="h-5 w-5" /> Maintenance Mode
                </button>
            </div>
        </main>
    );
}
