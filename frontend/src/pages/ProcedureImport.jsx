import { useState, useRef } from 'react';
import axios from 'axios';
import { FileUp, CheckCircle2, AlertCircle, Loader2, ArrowLeft, FileType, Database, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProcedureImport() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8085/api/procedures/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setResult(response.data);
            setFile(null);
        } catch (err) {
            console.error('Import failed:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Import failed. Please ensure the file format is correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link to="/admin" className="inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase mb-8 transition-all hover:gap-3" style={{ color: 'var(--text-muted)' }}>
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                    <FileUp className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Import Procedure List
                    </h2>
                    <p className="text-lg font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                        Upload the latest <strong className="font-bold">Master TTGs.xlsx</strong> file
                    </p>
                </div>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 mb-10">
                <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <Database className="h-6 w-6 mb-3" style={{ color: 'var(--accent)' }} />
                    <h4 className="font-bold mb-1">Direct Sync</h4>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Imports are directly committed to the production database.</p>
                </div>
                <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <FileType className="h-6 w-6 mb-3" style={{ color: 'var(--success-text)' }} />
                    <h4 className="font-bold mb-1">Smart Parsing</h4>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Automatically detects specialities and maps ICD-10 codes.</p>
                </div>
                <div className="p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <History className="h-6 w-6 mb-3" style={{ color: 'var(--warning-text)' }} />
                    <h4 className="font-bold mb-1">Auto-Normalize</h4>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Runs normalization scripts after import to clean data.</p>
                </div>
            </div>

            <div 
                className={`relative border-2 border-dashed rounded-[32px] p-12 transition-all duration-300 text-center ${dragActive ? 'scale-105 border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                style={{ 
                    backgroundColor: dragActive ? 'var(--accent-bg)' : 'var(--bg-card)',
                    borderColor: dragActive ? 'var(--accent)' : 'var(--border)'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                />
                
                <div className="flex flex-col items-center">
                    <div className="p-6 rounded-3xl mb-4 shadow-inner" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <FileUp className={`h-12 w-12 transition-transform ${loading ? 'animate-bounce' : 'group-hover:scale-110'}`} style={{ color: 'var(--accent)' }} />
                    </div>
                    
                    {file ? (
                        <div className="animate-in zoom-in-95 duration-300">
                            <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                            <p className="text-sm font-bold mb-8" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setFile(null)}
                                    className="px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-white/5"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="px-8 py-3.5 rounded-xl font-black text-white shadow-xl flex items-center gap-2 transform transition-all active:scale-95"
                                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))' }}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
                                    {loading ? 'Processing...' : 'Run Import Now'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                                Drag & Drop Excel File
                            </p>
                            <p className="text-lg font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
                                or click here to browse your computer
                            </p>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="px-10 py-4 rounded-xl font-black shadow-lg transition-all hover:-translate-y-1 active:scale-95 border"
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Choose File
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-8 p-6 rounded-3xl flex items-start gap-4 animate-shake" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
                    <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-lg mb-1">Import Error Encountered</h4>
                        <p className="font-medium opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="mt-8 p-8 rounded-3xl border shadow-xl animate-in zoom-in-95 duration-500" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h4 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Import Complete</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-muted">Procedures Imported</p>
                            <p className="text-3xl font-black" style={{ color: 'var(--success-text)' }}>{result.data?.total_imported || 0}</p>
                        </div>
                        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-muted">Issues Flagged</p>
                            <p className="text-3xl font-black" style={{ color: result.data?.errors?.length > 0 ? 'var(--warning-text)' : 'var(--text-muted)' }}>
                                {result.data?.errors?.length || 0}
                            </p>
                        </div>
                    </div>

                    {result.data?.errors?.length > 0 && (
                        <div className="mt-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Flagged Rows:</p>
                            <ul className="space-y-2">
                                {result.data.errors.map((err, i) => (
                                    <li key={i} className="text-sm font-medium p-3 rounded-xl border-l-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--warning-text)', color: 'var(--text-secondary)' }}>
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
