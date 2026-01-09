import React, { useEffect, useState } from 'react';
import { getServiceHistory, Service } from '../../services/api';
import { Calendar, Search, Eye, FileText, TrendingUp, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/products';
import ServiceDetailsModal from '../../components/admin/ServiceDetailsModal';

export default function AdminHistoryPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await getServiceHistory();
            setServices(data);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historique des Services</h1>
                    <p className="text-gray-500">Consultez les performances des services passés (Z de caisse)</p>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horaires</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Chiffre d'Affaires</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Commandes</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Panier Moyen</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Chargement de l'historique...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                                        <p>Aucun service clôturé trouvé</p>
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr
                                        key={service.id}
                                        onClick={() => setSelectedServiceId(service.id)}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <Calendar size={16} className="text-gray-400" />
                                                {service.start_time ? new Date(service.start_time).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {service.start_time ? new Date(service.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            {' - '}
                                            {service.end_time ? new Date(service.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En cours'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-gray-900">{formatPrice(service.total_revenue || 0)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                <ShoppingBag size={12} /> {service.order_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                                            {formatPrice(service.average_ticket || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 group-hover:text-primary transition-colors">
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modale Détails */}
            {selectedServiceId && (
                <ServiceDetailsModal
                    serviceId={selectedServiceId}
                    onClose={() => setSelectedServiceId(null)}
                />
            )}
        </div>
    );
}