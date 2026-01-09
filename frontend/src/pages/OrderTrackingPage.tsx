import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderTracking, OrderTracking } from '../services/api';
import { Clock, Truck, Package, MapPin, CheckCircle2, AlertCircle, Home } from 'lucide-react';

const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<OrderTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchTracking = () => {
            fetchOrderTracking(orderId) // L'API accepte string ou number
                .then(setData)
                .catch((err) => {
                    console.error('Erreur suivi commande:', err);
                    // On ne met une erreur que si on n'a pas déjà de données (pour éviter le clignotement lors du polling)
                    if (!data) setError('Impossible de récupérer le suivi de la commande.');
                })
                .finally(() => setLoading(false));
        };

        fetchTracking();

        // Polling toutes les 15 secondes pour mise à jour live
        const interval = setInterval(fetchTracking, 15000);
        return () => clearInterval(interval);
    }, [orderId]);

    const getOrderStatusLabel = (status: string) => {
        switch (status) {
            case 'en_attente': return 'En attente';
            case 'en_preparation': return 'En préparation';
            case 'prete': return 'Prête';
            case 'en_livraison': return 'En livraison';
            case 'livree': return 'Livrée';
            case 'annulee': return 'Annulée';
            default: return status;
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'en_attente': return "Votre commande est en cours de validation.";
            case 'en_preparation': return "Nos chefs préparent vos pizzas avec amour !";
            case 'prete': return "C'est prêt ! En attente de livraison ou retrait.";
            case 'en_livraison': return "Le livreur est en route vers chez vous.";
            case 'livree': return "Bon appétit !";
            case 'annulee': return "Cette commande a été annulée.";
            default: return "Traitement en cours...";
        }
    };

    const getDeliveryStatusLabel = (status: string | null | undefined) => {
        if (!status) return 'En attente';
        switch (status) {
            case 'non_assignée': return 'Recherche livreur...';
            case 'assignée': return 'Livreur assigné';
            case 'en_livraison': return 'En route';
            case 'livree': return 'Livrée';
            default: return status;
        }
    };

    // --- RENDER ---

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600 flex items-center gap-2">
                    <Clock className="animate-spin text-primary" size={24} />
                    <span className="font-medium">Chargement du suivi...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center border border-red-100">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Commande introuvable</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {error || "Nous ne parvenons pas à trouver cette commande. Vérifiez le numéro ou réessayez plus tard."}
                    </p>
                    <button onClick={() => navigate('/')} className="text-primary hover:underline font-medium">
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    // Extraction sécurisée des données pour éviter les crashs
    const isDelivery = data.mode === 'livraison';
    // On cherche l'adresse partout où elle pourrait être (structure API vs structure locale)
    const address = (data as any).address || data.delivery_address || data.customer?.address || data.customerInfo?.address;
    const customer = data.customer || data.customerInfo || {};
    const delivery = data.delivery || {};
    const totalAmount = Number(data.total_amount || data.total || 0);
    const creationDate = data.created_at || data.createdAt || new Date().toISOString();

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Header Carte */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-display font-bold text-gray-900">
                                    Commande #{String(data.id).slice(-6).toUpperCase()}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    data.status === 'livree' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {getOrderStatusLabel(data.status)}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm flex items-center gap-2">
                                <Clock size={14} />
                                {new Date(creationDate).toLocaleString('fr-FR', { 
                                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                                })}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="text-2xl font-bold text-primary">
                                {totalAmount.toFixed(2)} €
                            </p>
                            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {isDelivery ? <Truck size={14} /> : <Package size={14} />}
                                {isDelivery ? 'Livraison' : 'À emporter'}
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression simplifiée */}
                    <div className="mt-8 mb-4">
                        <p className="text-center text-lg font-medium text-gray-800 mb-2">
                            {getStatusDescription(data.status)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: 
                                    data.status === 'en_attente' ? '10%' :
                                    data.status === 'en_preparation' ? '40%' :
                                    data.status === 'prete' ? '70%' :
                                    data.status === 'en_livraison' ? '85%' :
                                    data.status === 'livree' ? '100%' : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Infos Client & Livraison */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Colonne Gauche : Client */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Home size={20} className="text-gray-400" />
                            Client
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium text-gray-900">Nom :</span> {customer.first_name || customer.name} {customer.last_name}</p>
                            <p><span className="font-medium text-gray-900">Tél :</span> {customer.phone}</p>
                            <p><span className="font-medium text-gray-900">Email :</span> {customer.email}</p>
                        </div>
                    </div>

                    {/* Colonne Droite : Livraison (si applicable) */}
                    {isDelivery && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-gray-400" />
                                Livraison
                            </h3>
                            {address ? (
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="font-medium text-gray-900">{address.street}</p>
                                    <p>{address.postal_code || address.postalCode} {address.city}</p>
                                    {address.additional_info && (
                                        <p className="italic mt-1 text-xs bg-yellow-50 p-2 rounded border border-yellow-100">
                                            " {address.additional_info} "
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Adresse non spécifiée</p>
                            )}

                            {/* Infos Livreur */}
                            {delivery.driver && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Votre livreur</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {delivery.driver.first_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {delivery.driver.first_name} {delivery.driver.last_name}
                                            </p>
                                            {delivery.driver.phone && (
                                                <p className="text-xs text-gray-500">{delivery.driver.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Détails du Panier */}
                {data.items && data.items.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Détails de la commande</h3>
                        <div className="divide-y divide-gray-100">
                            {data.items.map((item: any, index: number) => {
                                // Gestion sécurisée des prix et noms
                                const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
                                const isFree = item.isFree || unitPrice === 0;
                                const itemName = item.name || item.product_name || "Article";
                                
                                return (
                                    <div key={index} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-400 text-sm">
                                                {item.quantity}x
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {itemName}
                                                </p>
                                                {isFree && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                        Offert
                                                    </span>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-gray-500 italic">
                                                        Note: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                                            {isFree ? 'GRATUIT' : `${(unitPrice * item.quantity).toFixed(2)} €`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Ligne Frais de livraison si existe */}
                        {(data as any).delivery_fee && Number((data as any).delivery_fee) > 0 && (
                             <div className="py-3 flex justify-between items-center border-t border-gray-100 mt-2">
                                <span className="text-sm text-gray-600">Frais de livraison</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {Number((data as any).delivery_fee).toFixed(2)} €
                                </span>
                             </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-lg text-gray-900">Total payé</span>
                            <span className="font-bold text-xl text-primary">
                                {totalAmount.toFixed(2)} €
                            </span>
                        </div>
                    </div>
                )}

                <div className="text-center py-4">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-primary transition-colors">
                        ← Retourner à la page d'accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;