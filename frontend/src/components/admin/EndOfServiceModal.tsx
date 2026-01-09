import React from 'react';
import { formatPrice } from '../../utils/products';
import { X, CheckCircle, Euro, ShoppingBag, TrendingUp, Star } from 'lucide-react';

interface ServiceStats {
    totalRevenue: number;
    orderCount: number;
    averageTicket: number;
    topItem: string;
}

interface EndOfServiceModalProps {
    stats: ServiceStats;
    onClose: () => void;
}

export default function EndOfServiceModal({ stats, onClose }: EndOfServiceModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-green-600 p-6 text-white text-center">
                    <div className="mx-auto bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-display font-bold">Service Terminé !</h2>
                    <p className="text-green-100 mt-1">Récapitulatif de la session (Z de caisse)</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Chiffre d'affaires</div>
                            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                                {formatPrice(stats.totalRevenue)}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Commandes</div>
                            <div className="text-2xl font-bold text-dark flex items-center justify-center gap-1">
                                {stats.orderCount} <ShoppingBag size={18} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-blue-800">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} />
                                <span className="font-medium">Panier Moyen</span>
                            </div>
                            <span className="font-bold">{formatPrice(stats.averageTicket)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-yellow-800">
                            <div className="flex items-center gap-2">
                                <Star size={18} />
                                <span className="font-medium">Top Produit</span>
                            </div>
                            <span className="font-bold text-sm">{stats.topItem}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full bg-dark hover:bg-black text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        Confirmer et Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
