import React, { useState, useEffect } from 'react';
import { Gift, Lock, Check, Star } from 'lucide-react';
import { Product, User, CartItem, LoyaltyProgram } from '../types';
import { getProducts } from '../services/api';
import { useCartStore } from '../store/useCartStore';

interface LoyaltyRewardCardProps {
    user: User;
    settings: LoyaltyProgram;
    cartItems: CartItem[];
    onAddReward: (product: Product) => void;
}

export default function LoyaltyRewardCard({ user, settings, cartItems, onAddReward }: LoyaltyRewardCardProps) {
    const { removeItem } = useCartStore();
    const [eligiblePizzas, setEligiblePizzas] = useState<Product[]>([]);
    
    // Points et éligibilité
    const points = user.loyalty_points || 0;
    const target = settings?.target_pizzas || 10;
    const isEligible = points >= target;
    
    // Calcul de la progression
    const progress = Math.min((points / target) * 100, 100);
    const remaining = Math.max(target - points, 0);

    // Vérifier si une récompense est déjà dans le panier
    const existingReward = cartItems.find(item => item.isReward);
    const selectedRewardId = existingReward ? String(existingReward.productId) : 'none';

    // Vérifier si le verrouillage est actif (nécessite un achat payant)
    // On considère qu'il faut au moins un article payant (non offert, non récompense)
    const hasPaidItem = cartItems.some(item => !item.isReward && !item.isFree && (item.unitPrice || 0) > 0);
    const isLocked = (settings?.require_purchase_for_reward) && !hasPaidItem;

    // Chargement des produits éligibles
    useEffect(() => {
        getProducts().then((all: any) => {
            const eligible = Array.isArray(all) ? all.filter((p: any) => 
                p.category.includes('pizza') && 
                (p.is_loyalty_eligible === true || p.is_loyalty_eligible === 1)
            ) : [];
            
            // Fallback: si aucune pizza marquée, on prend toutes les pizzas
            if (eligible.length === 0 && Array.isArray(all)) {
                 setEligiblePizzas(all.filter((p: any) => p.category.includes('pizza')));
            } else {
                 setEligiblePizzas(eligible);
            }
        });
    }, []);

    const handleRewardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pizzaId = e.target.value;

        if (pizzaId === 'none') return;

        // 1. Supprimer l'ancienne récompense s'il y en a une
        if (existingReward && existingReward.productId) {
            removeItem(existingReward.productId, false, true);
        }

        // 2. Ajouter la nouvelle via la fonction du parent
        const pizza = eligiblePizzas.find(p => String(p.id) === pizzaId);
        if (pizza) {
            onAddReward(pizza);
        }
    };

    return (
        <div className="bg-gradient-to-r from-forest to-green-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-yellow-400 opacity-10 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Gift className="text-yellow-400" size={20} />
                            Programme Fidélité
                        </h3>
                        <p className="text-green-100 text-sm">Gusto Verde Family</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-yellow-400">{points}</span>
                        <span className="text-sm text-green-100 block">points</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-green-100 mb-1">
                        <span>Progression</span>
                        <span>{points}/{target}</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Zone d'action (Sélection ou Info) */}
                {isEligible ? (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        {isLocked ? (
                            <div className="flex items-start gap-3">
                                <Lock className="text-gray-300 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold text-white text-sm">Récompense débloquée ! 🔓</p>
                                    <p className="text-green-100 text-xs mt-1">
                                        Ajoutez d'abord une pizza payante au panier pour pouvoir sélectionner votre cadeau.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-yellow-400 mb-2">
                                    Félicitations ! Choisissez votre pizza offerte :
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRewardId}
                                        onChange={handleRewardChange}
                                        className="w-full p-3 pl-4 pr-10 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-sm font-medium cursor-pointer appearance-none"
                                    >
                                        <option value="none">-- Cliquez pour choisir --</option>
                                        {eligiblePizzas.map(pizza => (
                                            <option key={pizza.id} value={pizza.id}>
                                                {pizza.name} (Offerte)
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <Gift size={16} />
                                    </div>
                                </div>
                                {selectedRewardId !== 'none' && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-green-200 animate-pulse">
                                        <Check size={16} /> Pizza ajoutée au panier !
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Info Text si pas assez de points */
                    <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <div className="bg-yellow-400/20 p-2 rounded-full">
                            <Star className="text-yellow-400" size={16} fill="currentColor" />
                        </div>
                        <p className="text-sm">
                            Plus que <span className="font-bold text-yellow-400">{remaining} commandes</span> pour votre pizza offerte !
                        </p>
                    </div>
                )}

                {/* User Name Footer */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-green-200 font-mono uppercase tracking-wider">
                    <span>{user.first_name} {user.last_name}</span>
                    <span>#{String(user.id).padStart(6, '0')}</span>
                </div>
            </div>
        </div>
    );
};