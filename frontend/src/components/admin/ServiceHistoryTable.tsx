import React from 'react';
import { formatPrice } from '../../utils/products';
import { Calendar, Clock, Euro, ShoppingBag } from 'lucide-react';

interface ServiceData {
    id: number;
    start_time: string;
    end_time?: string;
    total_revenue?: number;
    order_count?: number;
}

interface ServiceHistoryTableProps {
    history: ServiceData[];
}

export default function ServiceHistoryTable({ history }: ServiceHistoryTableProps) {
    if (history.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500">Aucun historique de service disponible.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-display font-bold text-xl text-dark">Historique des Services</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Ouverture</th>
                            <th className="px-6 py-4">Fermeture</th>
                            <th className="px-6 py-4 text-right">Commandes</th>
                            <th className="px-6 py-4 text-right">Chiffre d'affaires</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((service) => {
                            const startDate = new Date(service.start_time);
                            const endDate = service.end_time ? new Date(service.end_time) : null;

                            return (
                                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-dark font-medium">
                                            <Calendar size={16} className="text-gray-400" />
                                            {startDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {endDate ? (
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-400" />
                                                {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        ) : (
                                            <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">En cours</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 font-medium text-dark">
                                            {service.order_count}
                                            <ShoppingBag size={16} className="text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 font-bold text-primary">
                                            {formatPrice(service.total_revenue || 0)}
                                            <Euro size={16} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
