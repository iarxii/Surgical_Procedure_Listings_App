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
            <div className="mt-12 text-center text-gray-400 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-200 w-48 mb-4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-200 max-w-[360px] mx-auto mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-200 mb-2.5 mx-auto max-w-[300px]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-12 bg-red-50 text-red-600 rounded-xl p-4 flex items-center shadow-sm">
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
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    Authorized Procedure List
                </h3>
                <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                    {procedures.length} Procedures
                </span>
            </div>

            <div className="space-y-10">
                {Object.entries(groupedProcedures).map(([speciality, items]) => (
                    <div key={speciality} className="relative">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-4">
                            {speciality}
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{items.length}</span>
                            <div className="h-px bg-indigo-100 flex-1"></div>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(proc => (
                                <button
                                    key={proc.id}
                                    onClick={() => onSelectProcedure(proc.procedure_name)}
                                    className="text-left group bg-white flex flex-col justify-between hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full"
                                >
                                    <p className="font-semibold text-gray-900 group-hover:text-indigo-900 leading-tight mb-4">
                                        {proc.procedure_name}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium w-full mt-auto">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                                            TTG: {proc.ttg_days ? `${proc.ttg_days} Days` : proc.ttg_months}
                                        </span>
                                        {proc.icd_codes && proc.icd_codes.length > 0 && (
                                            <span className="text-gray-400 group-hover:text-indigo-500 transition-colors font-mono tracking-wide text-[11px]">
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
