import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Euro, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { getDriverHistory } from '../../services/api';

interface HistoryItem {
    service_id: number;
    start_time: string;
    total_amount: string;
    first_name: string;
    last_name: string;
    street: string;
    postal_code: string;
    city: string;
    delivered_at: string;
    status: string;
}

export default function DriverHistoryPage() {
    const [history, setHistory] = useState<Record<string, HistoryItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedService, setExpandedService] = useState<string | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getDriverHistory();

                // Group by Service (Date)
                const grouped = data.reduce((acc: any, item: HistoryItem) => {
                    const date = new Date(item.start_time);
                    const key = date.toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                    }) + (date.getHours() < 15 ? ' - Midi' : ' - Soir');

                    if (!acc[key]) acc[key] = [];
                    acc[key].push(item);
                    return acc;
                }, {});

                setHistory(grouped);
            } catch (error) {
                console.error('Erreur historique:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const toggleExpand = (key: string) => {
        setExpandedService(expandedService === key ? null : key);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-gray-900">Mes Services Passés</h1>

            {loading && <p className="text-center text-gray-500 mt-10">Chargement...</p>}

            {!loading && Object.keys(history).length === 0 && (
                <div className="text-center text-gray-500 mt-10 bg-white p-6 rounded-xl shadow-sm">
                    <Clock size={40} className="mx-auto text-gray-300 mb-2" />
                    <p>Aucun historique disponible.</p>
                </div>
            )}

            <div className="space-y-3">
                {Object.entries(history).map(([serviceKey, items]) => (
                    <div key={serviceKey} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                        {/* Service Header */}
                        <button
                            onClick={() => toggleExpand(serviceKey)}
                            className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-2 rounded-lg text-red-600">
                                    <Calendar size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800 capitalize">
                                        {serviceKey}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {items.length} courses • {items.reduce((sum, i) => sum + Number(i.total_amount), 0).toFixed(2)} €
                                    </div>
                                </div>
                            </div>
                            {expandedService === serviceKey ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>

                        {/* List of Deliveries */}
                        {expandedService === serviceKey && (
                            <div className="border-t border-gray-100 bg-gray-50">
                                {items.map((item, idx) => (
                                    <div key={idx} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center">
                                        <div className="flex items-start gap-3">
                                            <div className="text-xs font-bold text-gray-400 mt-1 w-10">
                                                {item.status === 'non_livree' ? (
                                                    <span className="text-red-500">❌</span>
                                                ) : (
                                                    new Date(item.delivered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold leading-tight ${item.status === 'non_livree' ? 'text-red-600 line-through' : 'text-gray-800'}`}>
                                                    {item.street}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.city}
                                                </p>
                                                {item.status === 'non_livree' && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                                                        ⛔ Non Effectuée
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`font-bold text-sm ${item.status === 'non_livree' ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {Number(item.total_amount).toFixed(2)} €
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
