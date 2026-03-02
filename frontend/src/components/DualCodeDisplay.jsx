import React from 'react';

export default function DualCodeDisplay({ icd10, icd11, procedures }) {
    const dbMatch = procedures && procedures.length > 0 ? procedures[0] : null;

    return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ICD-10-CM Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="bg-indigo-50 px-6 py-5 border-b border-indigo-100 flex-shrink-0">
                    <h3 className="text-xl font-bold text-indigo-900 flex items-center shadow-indigo-100 drop-shadow-sm">
                        <span className="bg-indigo-600 shadow-md text-white rounded-md px-2 py-1 text-sm mr-3 uppercase tracking-wider">ICD-10-CM</span>
                        NIH Query Results
                    </h3>
                    <p className="text-sm text-indigo-700 mt-2 font-medium">Diagnosis codes specifying side or specifics</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {dbMatch && dbMatch.icd_codes && dbMatch.icd_codes.length > 0 && (
                        <div className="mb-8 bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm transition-all hover:shadow-md">
                            <h4 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-3 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                Primary Match (Internal DB)
                            </h4>
                            {dbMatch.icd_codes.map(code => (
                                <div key={code.id} className="flex justify-between items-start">
                                    <span className="font-mono text-xl font-extrabold text-green-900 bg-green-100 px-2 py-1 rounded shadow-sm">{code.code}</span>
                                    <span className="text-green-800 text-sm flex-1 ml-4 mt-1 leading-snug">{code.description}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">NIH API Suggestions</h4>
                    {icd10 && icd10.length > 0 ? (
                        <ul className="divide-y divide-gray-100 space-y-2">
                            {icd10.slice(0, 7).map((item, index) => (
                                <li key={index} className="py-3 flex hover:bg-gray-50 transition-colors rounded-lg px-3 -mx-3 border border-transparent hover:border-gray-100 cursor-default">
                                    <span className="font-mono font-semibold text-gray-900 w-24 flex-shrink-0 text-lg">{item.code}</span>
                                    <span className="text-gray-700 text-sm font-medium leading-relaxed">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm italic">No direct suggestions found from NIH.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ICD-11 Column */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <div className="bg-teal-50 px-6 py-5 border-b border-teal-100 flex-shrink-0">
                    <h3 className="text-xl font-bold text-teal-900 flex items-center shadow-teal-100 drop-shadow-sm">
                        <span className="bg-teal-600 shadow-md text-white rounded-md px-2 py-1 text-sm mr-3 uppercase tracking-wider">ICD-11</span>
                        WHO Query Results
                    </h3>
                    <p className="text-sm text-teal-700 mt-2 font-medium">Base code typically followed by postcoordination</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">WHO API Suggestions</h4>
                    {icd11 && icd11.length > 0 ? (
                        <ul className="divide-y divide-gray-100 space-y-2">
                            {icd11.map((item, index) => (
                                <li key={index} className="py-3 flex hover:bg-teal-50/50 transition-colors rounded-lg px-3 -mx-3 border border-transparent hover:border-teal-100/30 cursor-default">
                                    <span className="font-mono font-semibold text-gray-900 w-24 flex-shrink-0 text-lg">{item.code}</span>
                                    <span className="text-gray-700 text-sm font-medium leading-relaxed">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm italic">No direct suggestions found from WHO.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
