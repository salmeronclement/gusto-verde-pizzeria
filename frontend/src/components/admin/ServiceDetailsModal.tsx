import React, { useEffect, useState } from 'react';
import { X, TrendingUp, ShoppingBag, Euro, Calendar, Clock } from 'lucide-react';
import { getServiceDetails, ServiceDetails } from '../../services/api';
import { formatPrice } from '../../utils/products';

interface ServiceDetailsModalProps {
    serviceId: number;
    onClose: () => void;
}

export default function ServiceDetailsModal({ serviceId, onClose }: ServiceDetailsModalProps) {
    const [data, setData] = useState<ServiceDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getServiceDetails(serviceId)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [serviceId]);

    if (loading && !data) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">Chargement...</div>;
    if (!data) return null;

    // Sécurisation des données (valeurs par défaut si undefined)
    const service = data.service || { start_time: new Date().toISOString(), end_time: null };
    const stats = data.stats || { revenue: 0, orderCount: 0, averageTicket: 0, topItems: [] };
    const orders = data.orders || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar size={24} className="text-orange-500" />
                            Service du {new Date(service.start_time).toLocaleDateString()}
                        </h2>
                        <p className="text-gray-400 mt-1 flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1"><Clock size={14} /> Début : {new Date(service.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {service.end_time && <span className="flex items-center gap-1"><Clock size={14} /> Fin : {new Date(service.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Euro size={14} /> Chiffre d'Affaires
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{formatPrice(stats.revenue || 0)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ShoppingBag size={14} /> Commandes
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats.orderCount || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <TrendingUp size={14} /> Panier Moyen
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{formatPrice(stats.averageTicket || 0)}</div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Top Ventes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                                🏆 Top Ventes
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Produit</th>
                                            <th className="px-4 py-2 text-right">Qté</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(stats.topItems || []).map((item: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-4 py-2 text-right font-mono">{item.quantity}</td>
                                                <td className="px-4 py-2 text-right text-gray-500">{formatPrice(item.total_revenue)}</td>
                                            </tr>
                                        ))}
                                        {(!stats.topItems || stats.topItems.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">Aucune donnée</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Liste Commandes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                                📝 Historique Commandes
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Cmd #</th>
                                            <th className="px-4 py-2">Heure</th>
                                            <th className="px-4 py-2">Tél.</th>
                                            <th className="px-4 py-2 text-right">Montant</th>
                                            <th className="px-4 py-2 text-center">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order: any) => (
                                            <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-2 font-bold text-gray-900">
                                                    #{order.id}
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-2 font-mono text-xs">
                                                    {order.phone || order.customer?.phone || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold">
                                                    {formatPrice(order.total_amount || order.total)}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'livree' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'annulee' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Aucune commande</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}