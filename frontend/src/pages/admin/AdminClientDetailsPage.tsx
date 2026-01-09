import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Plus, Minus, Save, ShoppingBag, Package } from 'lucide-react';
import { formatPrice } from '../../utils/products';

interface Customer {
    id: number;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    loyalty_points: number;
    created_at: string;
}

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

interface CustomerDetails {
    customer: Customer;
    orders: Order[];
}

const statusColors: Record<string, string> = {
    'en_attente': 'bg-yellow-100 text-yellow-800',
    'en_preparation': 'bg-blue-100 text-blue-800',
    'en_livraison': 'bg-purple-100 text-purple-800',
    'livree': 'bg-green-100 text-green-800',
    'annulee': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_preparation': 'En préparation',
    'en_livraison': 'En livraison',
    'livree': 'Livrée',
    'annulee': 'Annulée',
};

export default function AdminClientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [savingPoints, setSavingPoints] = useState(false);

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const response = await fetch(`http://51.68.229.173/api/admin/customers/${id}`);
            const data = await response.json();
            setDetails(data);
            setLoyaltyPoints(data.customer.loyalty_points);
        } catch (error) {
            console.error('Error fetching customer details:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLoyalty = async (newPoints: number) => {
        if (newPoints < 0) return;

        setSavingPoints(true);
        try {
            const response = await fetch(
                `http://51.68.229.173/api/admin/customers/${id}/loyalty`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ loyalty_points: newPoints }),
                }
            );

            if (response.ok) {
                setLoyaltyPoints(newPoints);
                if (details) {
                    setDetails({
                        ...details,
                        customer: { ...details.customer, loyalty_points: newPoints }
                    });
                }
            }
        } catch (error) {
            console.error('Error updating loyalty:', error);
        } finally {
            setSavingPoints(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Client non trouvé</p>
                <button onClick={() => navigate('/admin/clients')} className="text-primary hover:underline">
                    Retour à la liste
                </button>
            </div>
        );
    }

    const { customer, orders } = details;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/clients')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
                >
                    <ArrowLeft size={20} />
                    Retour aux clients
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-dark mb-2">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-2">
                                    <span className="font-medium">Email:</span> {customer.email}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-medium">Téléphone:</span> {customer.phone}
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Membre depuis:</span>{' '}
                                    {new Date(customer.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Loyalty Card */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 min-w-[280px]">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="text-orange-600" size={24} />
                                <h3 className="font-bold text-orange-900 text-lg">Fidélité</h3>
                            </div>
                            <div className="flex items-center justify-center gap-4 mb-3">
                                <button
                                    onClick={() => updateLoyalty(loyaltyPoints - 1)}
                                    disabled={loyaltyPoints === 0 || savingPoints}
                                    className="bg-white hover:bg-orange-50 border-2 border-orange-300 text-orange-600 rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <div className="text-center">
                                    <p className="text-5xl font-display font-bold text-orange-600">
                                        {loyaltyPoints}
                                    </p>
                                    <p className="text-sm text-orange-700 font-medium">Tampons 🍕</p>
                                </div>
                                <button
                                    onClick={() => updateLoyalty(loyaltyPoints + 1)}
                                    disabled={savingPoints}
                                    className="bg-white hover:bg-orange-50 border-2 border-orange-300 text-orange-600 rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {savingPoints && (
                                <p className="text-center text-xs text-orange-600">Enregistrement...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-primary" size={24} />
                        <h2 className="text-2xl font-display font-bold text-dark">
                            Historique des commandes
                        </h2>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                            {orders.length}
                        </span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Package size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Aucune commande pour ce client</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-dark text-lg">
                                                Commande #{order.id}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {order.mode === 'livraison' ? '🚚 Livraison' : '🛍️ À emporter'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-display font-bold text-primary">
                                            {formatPrice(order.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-bold text-gray-700 mb-2">Articles commandés :</p>
                                    <ul className="space-y-1">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                                <span>
                                                    {item.quantity}x {item.product_name}
                                                </span>
                                                <span className="font-medium">
                                                    {formatPrice(item.quantity * item.unit_price)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
