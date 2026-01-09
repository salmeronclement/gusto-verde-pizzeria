import React, { useEffect, useState } from 'react';
import { useServiceStore } from '../../store/useServiceStore';
import ServiceHistoryTable from '../../components/admin/ServiceHistoryTable';
import EndOfServiceModal from '../../components/admin/EndOfServiceModal';
import { Play, Square, Euro, ShoppingBag, Clock, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../utils/products';

export default function AdminDashboardPage() {
    const {
        serviceStatus,
        currentService,
        serviceHistory,
        isLoading,
        error,
        fetchServiceStatus,
        fetchServiceHistory,
        openService,
        closeService
    } = useServiceStore();

    const [showEndModal, setShowEndModal] = useState(false);
    const [lastServiceStats, setLastServiceStats] = useState<any>(null);

    // Initialisation stricte
    useEffect(() => {
        fetchServiceStatus();
        fetchServiceHistory();

        // Refresh status every minute
        const interval = setInterval(() => {
            fetchServiceStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const isOpen = serviceStatus === 'open';

    const handleOpenService = async () => {
        await openService();
        // Le store gère maintenant le cas "Déjà ouvert" en forçant le refresh
    };

    const handleCloseService = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir clôturer le service ?')) {
            const stats = await closeService();
            if (stats) {
                setLastServiceStats(stats);
                setShowEndModal(true);
                fetchServiceHistory();
            }
        }
    };

    // Force Close (Secours)
    const handleForceClose = async () => {
        if (window.confirm('ATTENTION : Ceci est une fermeture de secours. Êtes-vous sûr ?')) {
            await closeService();
            fetchServiceStatus();
        }
    }

    // Loading State
    if (isLoading && !currentService && serviceHistory.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-gray-900">Pilotage du Service</h1>
                {isOpen && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm animate-pulse">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        SERVICE EN COURS
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex justify-between items-center">
                    <p>{error}</p>
                    <button
                        onClick={handleForceClose}
                        className="text-xs bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded flex items-center gap-1"
                    >
                        <AlertTriangle size={12} />
                        Forcer la fermeture
                    </button>
                </div>
            )}

            {/* Service Control Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8 text-center">
                    {!isOpen ? (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                <Clock size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-dark mb-2">Le service est actuellement fermé</h2>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Les clients peuvent passer des pré-commandes. Ouvrez le service pour les traiter et commencer la session.
                                </p>
                            </div>
                            <button
                                onClick={handleOpenService}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                            >
                                <Play size={24} fill="currentColor" />
                                {isLoading ? 'Ouverture...' : 'OUVRIR LE SERVICE'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Live Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-1">Chiffre d'affaires</p>
                                        <h3 className="text-4xl font-bold text-blue-900">
                                            {formatPrice(currentService?.current_revenue || 0)}
                                        </h3>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl text-blue-600 shadow-sm">
                                        <Euro size={32} />
                                    </div>
                                </div>
                                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-1">Commandes</p>
                                        <h3 className="text-4xl font-bold text-orange-900">
                                            {currentService?.current_orders || 0}
                                        </h3>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl text-orange-600 shadow-sm">
                                        <ShoppingBag size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleCloseService}
                                    disabled={isLoading}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 mx-auto border border-red-200"
                                >
                                    <Square size={20} fill="currentColor" />
                                    CLÔTURER LE SERVICE
                                </button>
                                <p className="text-xs text-gray-400 mt-3">
                                    Cela générera le Z de caisse et fermera les commandes en ligne.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <ServiceHistoryTable history={serviceHistory} />

            {/* End of Service Modal */}
            {showEndModal && lastServiceStats && (
                <EndOfServiceModal
                    stats={lastServiceStats}
                    onClose={() => setShowEndModal(false)}
                />
            )}
        </div>
    );
}
