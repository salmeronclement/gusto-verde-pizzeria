import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Product } from '../types';
import { getProducts, getImageUrl } from '../services/api';
import LoyaltyRewardCard from '../components/LoyaltyRewardCard';

const Menu: React.FC = () => {
    const navigate = useNavigate();
    const { addItem, items } = useCartStore(state => ({
        addItem: state.addItem,
        items: state.items
    }));
    const { user } = useAuthStore();
    const { settings } = useSettingsStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const categories = [
        { id: 'pizzas_rouge', name: 'Nos Pizzas Base Tomate', description: 'Sauce tomate maison, pâte artisanale' },
        { id: 'pizzas_blanche', name: 'Nos Pizzas Base Crème', description: 'Crème fraîche légère, pâte artisanale' },
        { id: 'boissons', name: 'Nos Boissons', description: 'Rafraîchissements' },
        { id: 'desserts', name: 'Nos Desserts', description: 'Douceurs pour finir' }
    ];

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching menu:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            unitPrice: product.price,
            category: product.category,
            description: product.description,
            image: product.imageUrl,
            quantity: 1,
            subtotal: product.price,
            isPromoEligible: product.is_promo_eligible !== undefined ? !!product.is_promo_eligible : true,
            isFree: false,
            isReward: false
        } as any);
    };

    const handleAddReward = (productFromCard: Product) => {
        const selectedId = String(productFromCard.id);
        const productToAdd = products.find(p => String(p.id) === selectedId);

        if (productToAdd) {
            addItem({
                id: productToAdd.id,
                productId: productToAdd.id,
                name: `${productToAdd.name} 🎁`,
                price: 0,
                unitPrice: 0,
                subtotal: 0,
                quantity: 1,
                category: productToAdd.category,
                description: productToAdd.description,
                image: productToAdd.imageUrl,
                isReward: true,
                isFree: false,
                isPromoEligible: false
            } as any);
            alert("Pizza offerte ajoutée au panier !");
        }
    };

    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(categoryId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Chargement de la carte...</p>
                </div>
            </div>
        );
    }

    const featuredProduct = products.find((p: any) => p.is_featured);

    return (
        <div className="min-h-screen bg-gray-50 pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
                        Notre Carte
                    </h1>
                    <p className="text-lg text-gray-600">
                        Des ingrédients choisis avec soin, une pâte artisanale
                    </p>
                    <p className="text-sm text-primary mt-3 font-medium">
                        ∞ Nos pizzas sont convertibles en calzone ou chausson !
                    </p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
                        <a href="tel:0491555444" className="flex items-center gap-3 bg-primary hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            04 91 555 444
                        </a>
                        <button onClick={() => scrollToCategory('pizzas_rouge')} className="flex items-center gap-3 bg-dark hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Commander en ligne
                        </button>
                    </div>
                </div>

                {user && settings?.loyalty_program && (
                    <LoyaltyRewardCard
                        user={user}
                        // products prop removed because it caused types error and is fetched internally by LoyaltySelector/Card usually
                        settings={settings.loyalty_program}
                        cartItems={items}
                        onAddReward={handleAddReward}
                    />
                )}
            </div>

            {featuredProduct && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-1 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Star size={120} fill="white" stroke="none" />
                        </div>
                        <div className="bg-white/95 backdrop-blur-sm rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-lg relative group">
                                <img
                                    src={getImageUrl(featuredProduct.imageUrl)}
                                    alt="Pizza du moment"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider shadow-lg flex items-center gap-2">
                                    <Star size={16} fill="currentColor" /> Offre du Moment
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                                        {featuredProduct.name}
                                    </h2>
                                    <p className="text-xl text-gray-600 max-w-2xl">
                                        {featuredProduct.description}
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                                    <span className="text-4xl font-bold text-primary">
                                        {Number(featuredProduct.price).toFixed(2)} €
                                    </span>
                                    <button
                                        onClick={() => handleAddToCart(featuredProduct)}
                                        className="bg-dark text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3"
                                    >
                                        <ShoppingBag size={20} /> Commander maintenant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 mb-12 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="flex gap-3 min-w-max md:justify-center px-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className="px-5 py-2 rounded-full font-sans font-semibold text-sm md:text-base bg-white text-gray-700 hover:bg-primary hover:text-white hover:border-primary border border-gray-300 transition-all shadow-sm active:scale-95"
                                >
                                    {cat.name.replace('Nos ', '')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="space-y-20">
                    {categories.map(category => {
                        const categoryProducts = products.filter(p => p.category === category.id);
                        if (categoryProducts.length === 0) return null;
                        return (
                            <section key={category.id} id={category.id} className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="font-display text-3xl font-bold text-dark text-primary">
                                        {category.name}
                                    </h2>
                                    <div className="h-px bg-gray-200 flex-grow"></div>
                                </div>
                                <p className="text-gray-500 mb-8 -mt-6 italic">
                                    {category.description}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {categoryProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAdd={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                    <div className="max-w-7xl mx-auto flex justify-center">
                        <button
                            onClick={() => navigate('/panier')}
                            className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <ShoppingBag size={24} /> Valider mon panier
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;