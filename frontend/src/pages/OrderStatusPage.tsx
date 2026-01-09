import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderHistoryStore } from '../store/useOrderHistoryStore';
import { CheckCircle, Clock, MapPin, ChefHat, Truck, XCircle, Home, ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../types';

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
    { status: 'en_attente', label: 'Confirmée', icon: CheckCircle },
    { status: 'en_preparation', label: 'En cuisine', icon: ChefHat },
    { status: 'en_livraison', label: 'En route', icon: Truck },
    { status: 'livree', label: 'Livrée', icon: MapPin },
];

export const OrderStatusPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { getOrder, updateOrderStatus } = useOrderHistoryStore();
    
    // getOrder renvoie une commande ou undefined
    const order = getOrder(orderId || '');

    // Simulation logic (for demo purposes)
    const simulateProgress = () => {
        if (!order) return;

        const currentStatus = order.status;
        let nextStatus: OrderStatus | null = null;

        // Mapping des statuts pour la simulation
        switch (currentStatus) {
            case 'en_attente': 
            case 'En cours': // Compatibilité ancien statut
                nextStatus = 'en_preparation'; 
                break;
            case 'en_preparation': 
            case 'En préparation':
                nextStatus = 'en_livraison'; 
                break;
            case 'en_livraison': 
            case 'En livraison':
                nextStatus = 'livree'; 
                break;
            default: break;
        }

        if (nextStatus) {
            // On force la conversion en nombre car l'API attend un number, mais l'ID peut être string
            updateOrderStatus(Number(order.id), nextStatus);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-dark mb-4">Commande introuvable</h2>
                    <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    // Normalisation des statuts pour l'affichage de la barre de progression
    // On essaie de matcher le statut actuel avec l'une des étapes
    const normalizedStatus = steps.find(s => s.status === order.status || s.label === order.status) ? order.status : 'en_attente';
    const currentStepIndex = steps.findIndex(s => s.status === normalizedStatus);
    const isCancelled = order.status === 'annulee' || order.status === 'Annulée';

    // Récupération sécurisée des données (Nouveau format vs Ancien format)
    const totalDisplay = Number(order.total_amount || order.total || 0).toFixed(2);
    const dateDisplay = new Date(order.created_at || order.createdAt || Date.now()).toLocaleString('fr-FR');
    const orderIdDisplay = String(order.id).slice(-6).toUpperCase();

    // Gestion intelligente du client (supporte customer object ET customerInfo legacy)
    const customerName = order.customer?.first_name 
        ? `${order.customer.first_name} ${order.customer.last_name}` 
        : (order.customerInfo?.name || 'Client');
    
    const customerPhone = order.customer?.phone || order.customerInfo?.phone || '';

    // Gestion de l'adresse
    const address = order.delivery?.address || order.customer?.address || order.customerInfo?.address;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <Link to="/mon-compte" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
                        ← Retour à mes commandes
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-dark">
                        Suivi de commande
                    </h1>
                    <p className="text-gray-600">Commande #{orderIdDisplay}</p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-dark mb-1">
                                {isCancelled ? 'Commande Annulée' : `Statut : ${order.status}`}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {dateDisplay}
                            </p>
                        </div>
                        {/* Simulation Button */}
                        {!isCancelled && order.status !== 'livree' && order.status !== 'Livrée' && (
                            <button
                                onClick={simulateProgress}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded border border-gray-300 transition-colors"
                            >
                                Simuler progression
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {!isCancelled ? (
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                            ></div>

                            <div className="relative z-10 flex justify-between">
                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    return (
                                        <div key={step.status} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-300'
                                                }`}>
                                                <step.icon size={20} />
                                            </div>
                                            <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                            <XCircle size={24} />
                            <div>
                                <p className="font-bold">Cette commande a été annulée.</p>
                                <p className="text-sm">Contactez-nous pour plus d'informations.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="font-display text-xl font-bold text-dark mb-6">Détails de la commande</h3>

                    <div className="space-y-4 mb-6">
                        {order.items.map((item: any, index: number) => {
                            // Sécurisation des valeurs item
                            const unitPrice = item.unitPrice || item.unit_price || item.price || 0;
                            const subtotal = item.subtotal || (unitPrice * item.quantity);
                            const isFree = item.isFree || unitPrice === 0;
                            const name = item.name || item.product_name || "Produit";

                            return (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-primary">{item.quantity}x</span>
                                        <span className="text-dark">{name}</span>
                                    </div>
                                    <span className="font-medium text-dark">
                                        {isFree ? 'OFFERT' : `${Number(subtotal).toFixed(2)} €`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="font-bold text-lg text-dark">Total</span>
                        <span className="font-display font-bold text-2xl text-primary">{totalDisplay} €</span>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-dark mb-2 flex items-center gap-2">
                                <Home size={18} className="text-gray-400" /> Client
                            </h4>
                            <p className="text-gray-600">{customerName}</p>
                            <p className="text-gray-600">{customerPhone}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-dark mb-2 flex items-center gap-2">
                                {order.mode === 'livraison' ? <Truck size={18} className="text-gray-400" /> : <ShoppingBag size={18} className="text-gray-400" />}
                                {order.mode === 'livraison' ? 'Livraison' : 'Retrait'}
                            </h4>
                            
                            {order.mode === 'livraison' && address ? (
                                <>
                                    <p className="text-gray-600">{address.street}</p>
                                    <p className="text-gray-600">{address.postalCode || address.postal_code} {address.city}</p>
                                </>
                            ) : (
                                <p className="text-gray-600">À retirer au restaurant</p>
                            )}

                            {order.scheduledTime && (
                                <p className="text-primary font-medium mt-2">
                                    {order.scheduledTime === 'ASAP'
                                        ? (order.mode === 'livraison' ? 'Livraison dès que possible' : 'Retrait dès que possible')
                                        : `Prévu pour ${order.scheduledTime}`
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};