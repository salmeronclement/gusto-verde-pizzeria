import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatPrice } from '../utils/products';
import { Minus, Plus, Trash2, ShoppingBag, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProducts } from '../services/api';
import { Product } from '../types';
import LoyaltyRewardCard from '../components/LoyaltyRewardCard';
import { useAuthStore } from '../store/useAuthStore';

export const Cart: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { settings, fetchPublicSettings } = useSettingsStore();

    // Derived state
    const promo = settings?.promo_offer;

    const {
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        getTotal,
        getFreeItemAllowance,
        orderComment,
        setOrderComment
    } = useCartStore();

    // Auto-remove reward if not eligible anymore
    useEffect(() => {
        const rewardItem = items.find(i => i.isReward);
        if (rewardItem) {
            // 1. Must be logged in
            if (!user) {
                removeItem(rewardItem.productId);
                return;
            }
            // 2. Loyalty must be enabled
            if (!settings?.loyalty_program?.enabled) {
                removeItem(rewardItem.productId);
                return;
            }
            // 3. Must have enough points
            const points = user.loyalty_points || 0;
            const target = settings.loyalty_program.target_pizzas || 10;
            if (points < target) {
                console.log("Removing reward: insufficient points", points);
                removeItem(rewardItem.productId);
            }
        }
    }, [items, user, settings, removeItem]);

    const [products, setProducts] = React.useState<Product[]>([]);
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);

    const { allowed: allowedFree, current: currentFree } = getFreeItemAllowance();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPublicSettings();


        getProducts().then((all: any) => {
            setAllProducts(all);
            const eligible = all.filter((p: any) => {
                const cat = (p.category || '').toLowerCase();
                const isPizza = ['pizza', 'classique', 'signature', 'gourmande', 'base crème', 'base tomate'].some(k => cat.includes(k));
                return isPizza && (p.is_promo_eligible !== undefined ? p.is_promo_eligible : true);
            });
            setProducts(eligible);
        });
    }, []);

    const total = getTotal();
    const minOrder = settings?.min_order || 0;
    const isMinOrderMet = total >= minOrder;


    const isCartEmpty = items.length === 0;

    if (isCartEmpty) {
        return (
            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
                        <div className="flex justify-center mb-6">
                            <ShoppingBag className="text-gray-400" size={80} />
                        </div>
                        <h2 className="font-display text-4xl font-bold text-dark mb-4">
                            Votre panier est vide
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Ajoutez des pizzas délicieuses à votre panier pour continuer
                        </p>
                        <button
                            onClick={() => navigate('/nos-pizzas')}
                            className="inline-block bg-primary hover:bg-secondary text-white font-bold px-8 py-4 rounded-lg transition-colors"
                        >
                            Découvrir la carte
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl md:text-5xl font-bold text-dark mb-6 md:mb-10 text-center md:text-left">
                    Votre Panier
                </h1>

                {/* Loyalty Reward Section */}
                {user && settings?.loyalty_program?.enabled && (
                    <LoyaltyRewardCard
                        user={user}
                        settings={settings.loyalty_program}
                        cartItems={items}
                        onAddReward={(product) => {
                            addItem({
                                ...product,
                                productId: String(product.id),
                                price: 0,
                                unitPrice: 0,
                                quantity: 1,
                                isReward: true,
                                isFree: false // Explicitly NOT an offer item, but a reward
                            } as any);
                        }}
                    />
                )}

                {/* Dynamic Promo Banner */}
                {promo?.enabled && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6 flex items-center gap-4 text-purple-900 shadow-sm">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <Gift size={28} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-xl">Offre du moment</p>
                            <p className="text-lg">
                                <span className="font-bold">{promo.buy_quantity} achetées</span> = <span className="font-bold">{promo.get_quantity} offerte{promo.get_quantity > 1 ? 's' : ''}</span> !
                            </p>
                            {allowedFree > currentFree && (
                                <div className="mt-3">
                                    <p className="text-sm font-bold text-green-600 mb-2 animate-pulse">
                                        🎉 Bravo ! Vous avez droit à une pizza offerte (limitée à 1 par commande) :
                                    </p>

                                    <div className="flex gap-2 max-w-md">
                                        <select
                                            className="flex-1 p-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const product = allProducts.find(p => String(p.id) === String(e.target.value));
                                                if (product) {
                                                    // On utilise "as any" pour éviter les erreurs de typage strict
                                                    const result = addItem({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: 0,
                                                        description: product.description,
                                                        category: product.category,
                                                        productId: String(product.id),
                                                        unitPrice: 0,
                                                        isPromoEligible: product.is_promo_eligible,
                                                        isFree: true,
                                                        quantity: 1
                                                    } as any);

                                                    if (!result.success) {
                                                        alert(result.message || "Impossible d'ajouter cette pizza gratuite.");
                                                    }
                                                    e.target.value = "";
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>-- Choisir une pizza offerte --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({formatPrice(p.price)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            {currentFree > 0 && currentFree >= allowedFree && (
                                <p className="text-sm text-green-700 mt-2 font-bold">
                                    ✅ Pizza offerte déjà dans votre panier !
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="p-4 sm:p-8">
                        {/* Cart Items */}
                        <div className="space-y-6">
                            {items.map((item, index) => {
                                const canIncrease = !item.isFree || (currentFree < allowedFree);
                                // Unique key using all distinguishing properties
                                const itemKey = `${item.productId}-${item.isFree ? 'free' : 'paid'}-${item.isReward ? 'reward' : ''}`;

                                return (
                                    <div key={itemKey} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex flex-col sm:flex-row sm:items-center gap-4 relative 
                                            ${item.isFree ? 'bg-green-50 p-4 rounded-xl border-none' : ''}
                                            ${item.isReward ? 'bg-orange-50 p-4 rounded-xl border-orange-100 border' : ''}
                                            `}
                                        >

                                            {/* Header Info (Title + Unit Price) */}
                                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-sans font-bold text-lg sm:text-xl text-dark mb-1 flex flex-wrap items-center gap-2">
                                                            {item.name}
                                                            {item.isFree && (
                                                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full uppercase">Offerte</span>
                                                            )}
                                                            {item.isReward && (
                                                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full uppercase">Cadeau</span>
                                                            )}
                                                        </h3>
                                                        {!item.isFree && !item.isReward && (
                                                            <p className="text-sm text-gray-600">
                                                                {formatPrice(item.unitPrice || 0)} / unité
                                                            </p>
                                                        )}
                                                        {item.isReward && (
                                                            <p className="text-sm text-orange-700 font-medium">
                                                                Récompense fidélité appliquée
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Mobile Trash Button (Absolute top-right relative to card if needed, or just flexed here) */}
                                                    <button
                                                        onClick={() => removeItem(item.productId!, item.isFree, item.isReward)}
                                                        className="sm:hidden text-gray-400 hover:text-red-600 transition-colors p-1"
                                                        aria-label="Supprimer"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Quantity + Subtotal Row */}
                                            <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3 bg-white sm:bg-transparent rounded-lg p-1 sm:p-0 border sm:border-none border-gray-100 shadow-sm sm:shadow-none">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId!, item.quantity - 1, item.isFree, item.isReward)}
                                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-dark"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-sans font-bold text-lg sm:text-xl w-8 text-center text-dark">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId!, item.quantity + 1, item.isFree, item.isReward)}
                                                        disabled={!canIncrease || item.isReward}
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-dark transition-colors ${(canIncrease && !item.isReward)
                                                            ? 'bg-gray-100 hover:bg-primary hover:text-white'
                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                                            }`}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                {/* Price + Desktop Trash */}
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right sm:w-28">
                                                        <p className={`font-sans font-bold text-xl sm:text-2xl ${(item.isFree || item.isReward) ? 'text-green-600' : 'text-primary'}`}>
                                                            {(item.isFree || item.isReward) ? 'GRATUIT' : formatPrice(item.subtotal || 0)}
                                                        </p>
                                                    </div>

                                                    {/* Desktop Trash Button */}
                                                    <button
                                                        onClick={() => removeItem(item.productId!, item.isFree, item.isReward)}
                                                        className="hidden sm:block text-gray-400 hover:text-red-600 transition-colors p-2"
                                                        aria-label="Supprimer"
                                                    >
                                                        <Trash2 size={22} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Notes input for item customization */}
                                        <div className="mt-2 px-1">
                                            <input
                                                type="text"
                                                placeholder="✏️ Note spéciale (ex: Sans oignons, bien cuite...)"
                                                value={item.notes || ''}
                                                onChange={(e) => updateItemNotes(item.productId!, e.target.value, item.isFree, item.isReward)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-primary rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-display text-2xl md:text-3xl font-bold text-white">
                                    Total
                                </span>
                                <span className="font-display text-3xl md:text-5xl font-bold text-white">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>

                        {!isMinOrderMet && (
                            <div className="mt-4 bg-white/10 rounded-lg p-3 text-white text-center font-bold border border-white/20">
                                <span className="block text-sm opacity-80 mb-1">Information</span>
                                Le minimum de commande dépend de votre zone de livraison (généralement {formatPrice(minOrder)}).
                                <br />
                                Vous pourrez vérifier votre éligibilité à l'étape suivante.
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/nos-pizzas')}
                            className="flex-1 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 py-4 rounded-lg transition-colors"
                        >
                            Continuer mes achats
                        </button>
                        <button
                            onClick={() => navigate('/commande/recap', { state: { items, total, mode: 'emporter' } })}
                            disabled={items.length === 0}
                            className={`flex-1 font-bold px-8 py-4 rounded-lg transition-colors shadow-lg ${items.length > 0
                                ? 'bg-primary hover:bg-secondary text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {items.length > 0 ? 'Valider la commande' : 'Panier vide'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;