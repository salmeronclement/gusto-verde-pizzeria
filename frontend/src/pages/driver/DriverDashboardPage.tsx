import React, { useEffect, useState } from 'react';
import {
    getDriverOrders,
    startDelivery,
    completeDelivery,
    DriverOrder
} from '../../services/api';
import {
    MapPin,
    Phone,
    Navigation,
    CheckCircle,
    Clock,
    Package,
    AlertTriangle,
    MessageCircle,
    ArrowRight,
    X
} from 'lucide-react';

const DriverDashboardPage: React.FC = () => {
    const [orders, setOrders] = useState<DriverOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Checklist Modal State
    const [checklistOrder, setChecklistOrder] = useState<DriverOrder | null>(null);

    const fetchOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await getDriverOrders();
            setOrders(data);
        } catch (error) {
            console.error("Erreur chargement commandes:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), 10000);
        return () => clearInterval(interval);
    }, []);

    // 1. Action "Je pars" -> Ouvre la modale
    const handleStartClick = (order: DriverOrder) => {
        setChecklistOrder(order);
    };

    // 2. Confirmation Checklist -> Appel API Start
    const confirmStartDelivery = async () => {
        if (!checklistOrder) return;

        setProcessingId(checklistOrder.id);
        try {
            await startDelivery(checklistOrder.id);
            // Optimistic update
            setOrders(prev => prev.map(o =>
                o.id === checklistOrder.id ? { ...o, status: 'en_livraison', delivery_status: 'en_livraison' } : o
            ));
            setChecklistOrder(null);
        } catch (error) {
            alert("Erreur lors du départ");
        } finally {
            setProcessingId(null);
        }
    };

    // 3. Action "Terminé" -> Appel API Complete
    const handleCompleteDelivery = async (orderId: number) => {
        if (!window.confirm("Confirmer la livraison effectuée ?")) return;

        setProcessingId(orderId);
        try {
            await completeDelivery(orderId);
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error) {
            alert("Erreur lors de la validation");
        } finally {
            setProcessingId(null);
        }
    };

    // Helper pour SMS
    const sendSms = (phone: string, message: string) => {
        window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Titre */}
            <h1 className="text-2xl font-black px-2">
                Mes Courses
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {orders.length}
                </span>
            </h1>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                        <Package size={48} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold">Aucune course en attente</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Profitez de la pause ! Les nouvelles commandes apparaîtront ici automatiquement.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => {
                        const isStarted = order.status === 'en_livraison';

                        return (
                            <div
                                key={order.id}
                                className={`rounded-2xl shadow-sm overflow-hidden border transition-colors ${isStarted
                                    ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800'
                                    : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                                    }`}
                            >
                                {/* Header Carte */}
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-lg font-bold text-gray-800 dark:text-gray-100">#{order.id}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="font-bold text-xl text-red-600 dark:text-red-400">
                                            {Number(order.total_amount).toFixed(2)} €
                                        </div>
                                    </div>

                                    {/* Badge Statut */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isStarted
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                        {isStarted ? (
                                            <><Navigation size={12} /> EN ROUTE</>
                                        ) : (
                                            <><Clock size={12} /> ASSIGNÉE</>
                                        )}
                                    </div>
                                </div>

                                {/* Corps Carte */}
                                <div className="p-4 space-y-4">

                                    {/* Client & Adresse */}
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <MapPin className="text-red-500" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{order.customer.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug mt-0.5">
                                                {order.customer.address}
                                            </p>
                                            {/* Google Maps Link */}
                                            {/* Google Maps Link - Prominent Style */}
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors w-full justify-center sm:w-auto"
                                            >
                                                <Navigation size={18} /> 📍 OUVRIR LE GPS
                                            </a>
                                        </div>
                                    </div>

                                    {/* NOTE CLIENT - Très visible pour le livreur */}
                                    {order.comment ? (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex items-start gap-3">
                                            <div className="text-2xl">💬</div>
                                            <div>
                                                <div className="text-xs font-bold text-yellow-800 dark:text-yellow-200 uppercase mb-1">Note du client</div>
                                                <p className="text-yellow-900 dark:text-yellow-100 font-bold text-lg">"{order.comment}"</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* DEBUG: Afficher toutes les données reçues */}
                                    {/* <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(order, null, 2)}</pre> */}

                                    {/* Actions Rapides (SMS) */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => sendSms(order.customer.phone, "Bonjour, votre livreur Dolce Pizza arrive dans 5 min !")}
                                            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <MessageCircle size={14} /> J'arrive (5min)
                                        </button>
                                        <button
                                            onClick={() => sendSms(order.customer.phone, "Bonjour, je suis devant chez vous !")}
                                            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <MapPin size={14} /> Je suis là
                                        </button>
                                        <a
                                            href={`tel:${order.customer.phone}`}
                                            className="w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                                        >
                                            <Phone size={16} />
                                        </a>
                                    </div>

                                    {/* Détail Commande (Résumé) */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Commande</div>
                                        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                            {order.items
                                                .filter(item => item.product_name !== "Frais de livraison")
                                                .map((item, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>
                                                            <span className="font-bold">{item.quantity}x</span> {item.product_name}
                                                            {Number(item.unit_price) === 0 && (
                                                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 font-bold uppercase tracking-wider">
                                                                    🎁 Offert
                                                                </span>
                                                            )}
                                                        </span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>

                                    {/* Bouton Principal d'Action */}
                                    <div className="pt-2">
                                        {!isStarted ? (
                                            <button
                                                onClick={() => handleStartClick(order)}
                                                disabled={processingId === order.id}
                                                className="w-full py-4 bg-primary hover:bg-yellow-600 text-white rounded-xl font-black text-lg shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                            >
                                                🚀 JE PARS
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCompleteDelivery(order.id)}
                                                disabled={processingId === order.id}
                                                className="w-full py-4 bg-forest hover:bg-green-900 text-white rounded-xl font-black text-lg shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                            >
                                                <CheckCircle size={24} /> TERMINÉ
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODALE CHECKLIST (Anti-Oubli) */}
            {checklistOrder && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

                        {/* Header Modale */}
                        <div className="bg-primary p-4 flex justify-between items-center text-white">
                            <h2 className="font-black text-lg flex items-center gap-2">
                                <AlertTriangle size={20} /> VÉRIFICATION
                            </h2>
                            <button onClick={() => setChecklistOrder(null)} className="p-1 hover:bg-white/20 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Contenu Checklist */}
                        <div className="p-6 space-y-6">
                            <p className="text-gray-600 dark:text-gray-300 font-medium text-center">
                                Avant de partir, confirmez que vous avez bien pris tous les articles pour la commande <span className="font-bold text-gray-900 dark:text-white">#{checklistOrder.id}</span> :
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 max-h-[40vh] overflow-y-auto">
                                <ul className="space-y-3">
                                    {checklistOrder.items
                                        .filter(item => item.product_name !== "Frais de livraison")
                                        .map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-lg">
                                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    <span className="font-bold">{item.quantity}x</span> {item.product_name}
                                                </span>
                                            </li>
                                        ))}
                                    {/* Rappel Boissons/Sauces */}
                                    <li className="flex items-center gap-3 text-lg pt-2 border-t border-dashed border-gray-300 dark:border-gray-700 text-orange-600 dark:text-orange-400 font-bold">
                                        <span className="text-2xl">🥤</span>
                                        <span>Boissons & Sauces ?</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={confirmStartDelivery}
                                className="w-full py-4 bg-primary hover:bg-yellow-600 text-white rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                C'EST TOUT BON, JE FONCE ! <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DriverDashboardPage;
