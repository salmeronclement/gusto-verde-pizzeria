import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderHistoryStore } from '../../store/useOrderHistoryStore';
import { CheckCircle, Clock, MapPin, ChefHat, Truck, XCircle, Home } from 'lucide-react';
import { OrderStatus, Order } from '../../types';

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
    { status: 'en_attente', label: 'Reçue', icon: Clock },
    { status: 'en_preparation', label: 'En cuisine', icon: ChefHat },
    { status: 'en_livraison', label: 'En route', icon: Truck },
    { status: 'livree', label: 'Livrée', icon: MapPin },
];

const OrderDetailsPage: React.FC = () => {
    // Le paramètre URL s'appelle "id" ou "orderId" selon ton routeur, je mets "id" ici pour matcher
    const { id } = useParams<{ id: string }>();
    const { getOrders } = useOrderHistoryStore();
    
    const [order, setOrder] = useState<Order | undefined>(undefined);

    useEffect(() => {
        if (id) {
            // Comparaison string vs string pour éviter les erreurs
            const found = getOrders().find(o => String(o.id) === String(id));
            setOrder(found);
        }
    }, [id, getOrders]);

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-dark mb-4">Commande introuvable</h2>
                    <Link to="/mon-compte" className="text-primary hover:underline">Retour à mes commandes</Link>
                </div>
            </div>
        );
    }

    // Normalisation du statut pour l'affichage de la progression
    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'annulee' || order.status === 'Annulée';

    // Sécurisation des données
    const totalDisplay = Number(order.total_amount || order.total || 0).toFixed(2);
    const dateDisplay = new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('fr-FR');
    
    // Client info (supporte les deux formats de données)
    const clientName = order.customer?.first_name 
        ? `${order.customer.first_name} ${order.customer.last_name}` 
        : order.customerInfo?.name || 'Client';
        
    const clientPhone = order.customer?.phone || order.customerInfo?.phone || '';
    const address = order.delivery?.address || order.customer?.address || order.customerInfo?.address;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link to="/mon-compte" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
                        ← Retour à mes commandes
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-dark">
                        Détails de la commande
                    </h1>
                    <p className="text-gray-600">Commande #{String(order.id).slice(-6).toUpperCase()} • {dateDisplay}</p>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-dark">
                            {isCancelled ? 'Commande Annulée' : `Statut : ${order.status}`}
                        </h2>
                        <span className="font-display font-bold text-2xl text-primary">{totalDisplay}€</span>
                    </div>

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
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-300'
                                                }`}>
                                                <step.icon size={16} />
                                            </div>
                                            <span className={`text-xs mt-2 font-medium hidden sm:block ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                            <XCircle size={20} />
                            Cette commande a été annulée.
                        </div>
                    )}
                </div>

                {/* Info Client & Livraison */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Home size={18}/> Client</h3>
                        <p className="font-medium">{clientName}</p>
                        <p className="text-gray-600">{clientPhone}</p>
                        <p className="text-gray-600">{order.customer?.email || order.customerInfo?.email}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Truck size={18}/> Livraison</h3>
                        <p className="capitalize font-medium mb-1">{order.mode}</p>
                        {order.mode === 'livraison' && address && (
                            <div className="text-gray-600 text-sm">
                                <p>{address.street}</p>
                                <p>{address.postal_code || address.postalCode} {address.city}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Articles */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                        Articles commandés
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item: any, idx: number) => {
                            const unitPrice = item.unitPrice || item.unit_price || item.price || 0;
                            const totalItem = item.subtotal || (unitPrice * item.quantity);
                            const isFree = item.isFree || unitPrice === 0;

                            return (
                                <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg">
                                            {item.quantity}x
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name || item.product_name}</p>
                                            {item.notes && <p className="text-xs text-gray-500 italic">Note: {item.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {isFree ? 'OFFERT' : `${Number(totalItem).toFixed(2)} €`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailsPage;