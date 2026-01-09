import React, { useState, useEffect } from 'react';
import { Gift, Lock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../types';
import { getProducts } from '../services/api';

interface LoyaltySelectorProps {
    user: any;
    settings: any;
}

const LoyaltySelector: React.FC<LoyaltySelectorProps> = ({ user, settings }) => {
    const { items, addItem, removeItem } = useCartStore();
    const [eligiblePizzas, setEligiblePizzas] = useState<Product[]>([]);

    // Check if user has enough points
    const targetPoints = settings?.target_pizzas || 10;
    const hasEnoughPoints = (user?.loyalty_points || 0) >= targetPoints;

    // Check if reward is already in cart
    const existingReward = items.find(item => item.isReward);
    const selectedRewardId = existingReward ? String(existingReward.productId) : 'none';

    // Calculate if user has a paid pizza in cart (for locking mechanism)
    const hasPaidPizza = items.some(item =>
        !item.isReward &&
        !item.isFree &&
        (item.unitPrice || 0) > 0 &&
        item.category &&
        (item.category.toLowerCase().includes('pizza') ||
            item.category === 'pizzas_rouge' ||
            item.category === 'pizzas_blanche')
    );

    // Determine lock state
    const requirePurchase = settings?.require_purchase_for_reward ?? false;
    const isLocked = requirePurchase && !hasPaidPizza;

    // Fetch eligible pizzas
    useEffect(() => {
        const fetchEligible = async () => {
            try {
                const products = await getProducts();
                // On filtre les pizzas éligibles (ou toutes les pizzas par défaut)
                const eligible = products.filter((p: any) => 
                    p.category.includes('pizza') || p.is_loyalty_eligible
                );
                setEligiblePizzas(eligible);
            } catch (err) {
                console.error("Failed to load loyalty pizzas", err);
            }
        };
        fetchEligible();
    }, []);

    // Handle user selection
    const handleRewardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pizzaId = e.target.value;

        // 1. Remove existing reward if any
        if (existingReward && existingReward.productId) {
            // removeItem(id, isFree, isReward) -> ici c'est un Reward
            removeItem(existingReward.productId, false, true);
        }

        // 2. Add new reward if selected
        if (pizzaId !== 'none') {
            const pizza = eligiblePizzas.find(p => String(p.id) === pizzaId);
            if (pizza) {
                addItem({
                    id: pizza.id,
                    productId: pizza.id,
                    name: `${pizza.name} 🎁`,
                    price: 0,
                    unitPrice: 0,
                    subtotal: 0,
                    quantity: 1,
                    category: pizza.category,
                    description: pizza.description,
                    image: pizza.image,
                    isReward: true,
                    isFree: false,
                    isPromoEligible: false
                } as any); // "as any" pour passer la validation stricte
            }
        }
    };

    // Render nothing if user not logged in or not enough points
    if (!user || !hasEnoughPoints) return null;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 mb-8 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full text-white ${isLocked ? 'bg-gray-400' : 'bg-orange-500'}`}>
                    <Gift size={24} />
                </div>
                <div>
                    <h3 className="font-display text-2xl font-bold text-orange-900">
                        Programme Fidélité 🎁
                    </h3>
                    <p className="text-orange-700 text-sm font-medium">
                        Vous avez <span className="font-bold">{user.loyalty_points}</span> tampons
                    </p>
                </div>
            </div>

            {isLocked ? (
                // CASE: LOCKED
                <div className="bg-white/80 border-l-4 border-gray-400 p-4 rounded-r-lg flex items-start gap-3">
                    <Lock className="text-gray-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-gray-800 font-bold text-sm">Récompense verrouillée</p>
                        <p className="text-gray-600 text-sm mt-1">
                            Ajoutez au moins une pizza payante à votre panier pour débloquer votre cadeau.
                        </p>
                    </div>
                </div>
            ) : (
                // CASE: UNLOCKED
                <div className="space-y-3">
                    <p className="text-gray-700">
                        Bravo ! Vous avez assez de points. Choisissez votre récompense :
                    </p>

                    <div className="relative">
                        <select
                            value={selectedRewardId}
                            onChange={handleRewardChange}
                            className="w-full p-4 pl-4 pr-10 border-2 border-orange-300 rounded-xl font-medium text-gray-800 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer appearance-none"
                        >
                            <option value="none">-- Choisir une pizza offerte --</option>
                            {eligiblePizzas.map(pizza => (
                                <option key={pizza.id} value={pizza.id}>
                                    {pizza.name} (0€)
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-orange-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {selectedRewardId !== 'none' && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-pulse">
                            ✅ Pizza ajoutée au panier !
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoyaltySelector;