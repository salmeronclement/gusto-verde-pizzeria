import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserOrders } from '../../services/api';
import { useOrderHistoryStore } from '../../store/useOrderHistoryStore';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Package, Clock, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoyaltyRewardCard from '../../components/LoyaltyRewardCard';
import { Product } from '../../types';

export default function ClientPage() {
    const [apiOrders, setApiOrders] = useState<any[]>([]);
    const { user, logout, refreshProfile } = useAuthStore();
    // On garde useOrderHistoryStore comme fallback ou pour l'instant
    const { orders: historyOrders } = useOrderHistoryStore();

    const { addItem, items: cartItems } = useCartStore();
    const { settings } = useSettingsStore();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            refreshProfile();
            getUserOrders(user.id).then(data => {
                if (Array.isArray(data)) {
                    setApiOrders(data);
                }
            }).catch(console.error);
        }
    }, [user?.id]); // Refresh quand user ID change ou mount

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Fonction pour gérer l'ajout de récompense depuis le dashboard client
    const handleAddReward = (product: Product) => {
        addItem({
            id: product.id,
            productId: product.id,
            name: `${product.name} 🎁`,
            price: 0,
            unitPrice: 0,
            subtotal: 0,
            quantity: 1,
            category: product.category,
            description: product.description,
            image: product.imageUrl,
            isReward: true,
            isFree: false,
            isPromoEligible: false
        } as any);
        alert("Récompense ajoutée au panier !");
        navigate('/panier');
    };

    if (!user) return <div className="p-8 text-center">Chargement du profil...</div>;

    // Priorité à l'API, sinon historique local
    const displayOrders = apiOrders.length > 0 ? apiOrders : historyOrders;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Profil */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <UserIcon size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Bonjour, {user.first_name} !
                                </h1>
                                <p className="text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <LogOut size={18} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Carte de Fidélité */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Ma Fidélité</h2>
                    {settings?.loyalty_program ? (
                        <LoyaltyRewardCard
                            user={user}
                            settings={settings.loyalty_program}
                            cartItems={cartItems}
                            onAddReward={handleAddReward}
                        />
                    ) : (
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                            Programme de fidélité non disponible.
                        </div>
                    )}
                </div>

                {/* Historique des Commandes */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Mes Dernières Commandes</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {displayOrders.length > 0 ? (
                            displayOrders.map((order: any) => (
                                <div key={order.id} className="p-4 sm:p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono font-bold text-lg text-gray-900">
                                                #{String(order.id).slice(-6).toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'livree' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package size={14} /> {order.items?.length || 0} articles
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className="font-bold text-lg text-primary">
                                            {Number(order.total_amount || order.total).toFixed(2)} €
                                        </span>
                                        <Link
                                            to={`/suivi-commande/${order.id}`}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Détails
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Vous n'avez pas encore passé de commande.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}