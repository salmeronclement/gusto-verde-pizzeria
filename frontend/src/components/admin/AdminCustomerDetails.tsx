import { useState, useEffect } from 'react';
import { getAdminCustomerDetails } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Gift, Calendar, ShoppingBag, Truck, Package } from 'lucide-react';

interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    category: string;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    mode: string;
    items: OrderItem[];
}

interface Customer {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    loyalty_points: number;
    created_at: string;
}

interface AdminCustomerDetailsProps {
    customerId: number;
    onClose: () => void;
}

export default function AdminCustomerDetails({ customerId, onClose }: AdminCustomerDetailsProps) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomerDetails();
    }, [customerId]);

    const fetchCustomerDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAdminCustomerDetails(customerId);
            setCustomer(data.customer);
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Error fetching customer details:', err);
            setError('Impossible de charger les données du client');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatItems = (items: OrderItem[]) => {
        return items.map(item => `${item.quantity}x ${item.product_name}`).join(', ');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
            'en_preparation': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En préparation' },
            'prete': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Prête' },
            'en_livraison': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En livraison' },
            'livree': { bg: 'bg-green-100', text: 'text-green-800', label: 'Livrée' },
            'recuperee': { bg: 'bg-green-100', text: 'text-green-800', label: 'Récupérée' },
            'annulee': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' }
        };
        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getModeBadge = (mode: string) => {
        if (mode === 'livraison') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    <Truck size={12} /> Livraison
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                <Package size={12} /> Emporter
            </span>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-white/30 rounded w-48 mb-2"></div>
                                        <div className="h-4 bg-white/30 rounded w-32"></div>
                                    </div>
                                ) : customer ? (
                                    <>
                                        <h2 className="text-3xl font-display font-bold mb-1">
                                            {customer.first_name} {customer.last_name}
                                        </h2>
                                        <p className="text-white/80 text-sm flex items-center gap-2">
                                            <Calendar size={14} />
                                            Client depuis le {formatDate(customer.created_at)}
                                        </p>
                                    </>
                                ) : null}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors p-1"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">
                                {error}
                            </div>
                        ) : customer ? (
                            <div className="p-6 space-y-6">
                                {/* Carte d'identité */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Téléphone */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Phone className="text-primary" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Téléphone</p>
                                            <p className="text-lg font-bold text-dark">{customer.phone || 'Non renseigné'}</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <Mail className="text-blue-600" size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                                            <p className="text-sm font-medium text-dark truncate">{customer.email}</p>
                                        </div>
                                    </div>

                                    {/* Points Fidélité */}
                                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 flex items-center gap-4 border-2 border-orange-200">
                                        <div className="bg-orange-100 p-3 rounded-lg">
                                            <Gift className="text-orange-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-orange-600 uppercase font-bold">Fidélité</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {customer.loyalty_points} 🍕
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Historique des commandes */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShoppingBag className="text-primary" size={20} />
                                        <h3 className="text-lg font-bold text-dark">
                                            Historique des commandes
                                        </h3>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                                            {orders.length} commande{orders.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                            <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                                            <p>Aucune commande pour ce client</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                            Date / Heure
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                            Mode
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                            Produits
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                                                            Total
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {orders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <p className="text-sm font-medium text-dark">
                                                                    {formatDateTime(order.created_at)}
                                                                </p>
                                                                <p className="text-xs text-gray-400">#{order.id}</p>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {getModeBadge(order.mode)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-gray-700 max-w-xs truncate" title={formatItems(order.items)}>
                                                                    {formatItems(order.items) || 'Aucun produit'}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                <span className="text-sm font-bold text-dark">
                                                                    {Number(order.total_amount).toFixed(2)} €
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                                {getStatusBadge(order.status)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            Fermer
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
