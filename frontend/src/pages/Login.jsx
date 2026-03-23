import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login(email, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div 
                className="max-w-md w-full rounded-3xl shadow-2xl p-8 transform transition-all duration-500 animate-in fade-in zoom-in-95"
                style={{ 
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 25px 50px -12px var(--shadow-color)'
                }}
            >
                <div className="text-center mb-8">
                    <div 
                        className="inline-flex p-4 rounded-2xl text-white mb-4 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
                    >
                        <Activity className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        Administrative Login
                    </h2>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Secure access for clinical administrators
                    </p>
                </div>

                {error && (
                    <div 
                        className="mb-6 p-4 rounded-xl flex items-center gap-3 animate-shake"
                        style={{ 
                            backgroundColor: 'var(--error-bg)', 
                            border: '1px solid var(--error-border)', 
                            color: 'var(--error-text)' 
                        }}
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 transition-colors group-focus-within:text-accent" style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-accent/20 focus:outline-none"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)'
                                }}
                                placeholder="admin@health.gov.za"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 transition-colors group-focus-within:text-accent" style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 rounded-xl border transition-all focus:ring-2 focus:ring-accent/20 focus:outline-none"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)'
                                }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 rounded-xl font-black text-white shadow-xl transform transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                        style={{ 
                            background: 'linear-gradient(to right, var(--accent), var(--accent-dark))',
                            boxShadow: '0 10px 15px -3px var(--shadow-color)'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Login to Dashboard'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

