import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderHistoryStore } from '../store/useOrderHistoryStore';

export default function ConfirmationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCartStore();
    const { addOrder } = useOrderHistoryStore();

    const state = location.state as {
        orderId?: string;
        total?: number;
        mode?: string;
        items?: any[];
    };

    // Use passed ID or generate one if missing (fallback)
    const orderId = state?.orderId;

    React.useEffect(() => {
        console.log('ConfirmationPage: orderId', orderId);
        if (orderId) {
            // Créer un objet commande minimal pour l'historique
            const newOrder: any = {
                id: orderId,
                created_at: new Date().toISOString(),
                status: 'en attente', // Statut initial par défaut
                total: state?.total || 0,
                total_amount: state?.total || 0,
                mode: state?.mode || 'emporter',
                items: state?.items || []
            };

            console.log('ConfirmationPage: adding to history store', newOrder);
            addOrder(newOrder);

            // Clear cart now that we are safely here
            clearCart();
        }
    }, [orderId, clearCart, addOrder]);

    if (!orderId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucune commande trouvée</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-white px-6 py-2 rounded-lg"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl p-12 shadow-xl border-2 border-primary text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-white" size={60} />
                    </div>

                    {/* Success Message */}
                    <h1 className="font-display text-5xl font-bold text-dark mb-6">
                        Commande confirmée !
                    </h1>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
                        <p className="text-sm text-gray-600 mb-2">Numéro de commande</p>
                        <p className="font-mono text-3xl font-bold text-primary mb-4">
                            #{orderId}
                        </p>
                        {state?.total !== undefined && (
                            <p className="text-lg font-medium text-gray-900">
                                Montant total : {Number(state.total).toFixed(2)} €
                            </p>
                        )}
                        {state?.mode && (
                            <div className="mt-2 inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                                {state.mode === 'livraison' ? 'Livraison' : 'À emporter'}
                            </div>
                        )}
                    </div>

                    <p className="text-xl text-gray-700 mb-8">
                        Merci pour votre commande ! 🍕<br />
                        <span className="text-base text-gray-500">
                            Nous la préparons avec soin. Vous pouvez suivre son avancement en temps réel.
                        </span>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(`/suivi-commande/${orderId}`)}
                            className="bg-primary hover:bg-secondary text-white font-bold px-8 py-4 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            Suivre ma commande
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 py-4 rounded-lg transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}