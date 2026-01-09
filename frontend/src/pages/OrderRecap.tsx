import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { getProducts, submitOrder } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatPrice } from '../utils/products';
import { ShoppingBag, ArrowRight, Utensils, MapPin, Phone, User, Store, Bike, AlertCircle } from 'lucide-react';

const OrderRecap: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();

    // On récupère tout depuis le bon store (useCartStore)
    const { items, getTotal, addItem, orderComment, setOrderComment } = useCartStore();
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);

    // State pour le formulaire de commande (anciennement OrderInfos)
    const [mode, setMode] = useState<'emporter' | 'livraison'>('emporter');
    const [customerInfo, setCustomerInfo] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: {
            street: '',
            postalCode: '',
            city: '',
            additionalInfo: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialisation depuis location.state ou user
    useEffect(() => {
        if (location.state?.mode) {
            setMode(location.state.mode);
        }

        // Pré-remplissage adresse si dispo
        if (user && user.addresses && user.addresses.length > 0) {
            const defaultAddr = user.addresses[0];
            setCustomerInfo(prev => ({
                ...prev,
                address: {
                    street: defaultAddr.street,
                    postalCode: defaultAddr.postal_code,
                    city: defaultAddr.city,
                    additionalInfo: defaultAddr.additional_info || ''
                }
            }));
        }
    }, [location.state, user]);

    // Chargement des produits pour la suggestion (Desserts/Boissons)
    useEffect(() => {
        getProducts().then((all: any) => {
            const suggestions = all.filter((p: any) => p.category === 'desserts' || p.category === 'boissons').slice(0, 3);
            setUpsellProducts(suggestions);
        });
    }, []);

    const total = getTotal();

    const handleAddUpsell = (product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            productId: String(product.id),
            unitPrice: product.price,
            subtotal: product.price,
            quantity: 1,
            isFree: false,
            isReward: false
        } as any);
    };

    const { settings } = useSettingsStore(); // Import useSettingsStore

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        // Validation standard
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
            setError("Merci de renseigner vos coordonnées complètes.");
            setLoading(false);
            return;
        }

        if (mode === 'livraison') {
            if (!customerInfo.address.street || !customerInfo.address.postalCode || !customerInfo.address.city) {
                setError("Adresse incomplète pour la livraison.");
                setLoading(false);
                return;
            }

            // === NOUVELLE VALIDATION STRICTE (Zone & Montant) ===
            // On vérifie si c'est livrable AVANT d'envoyer
            // Note: On utilise les settings chargés (si disponibles)
            if (settings && settings.delivery_zones?.length > 0) {
                const postalCodeToCheck = customerInfo.address.postalCode.trim();
                let validZone = false;
                let requiredMinOrder = 0;

                for (const tier of settings.delivery_zones) {
                    const match = tier.zones.find((z: any) => z.zip === postalCodeToCheck);
                    if (match) {
                        validZone = true;
                        requiredMinOrder = Number(tier.min_order);
                        break;
                    }
                }

                if (!validZone) {
                    setError(`Nous ne livrons malheureusement pas le code postal ${postalCodeToCheck}.`);
                    setLoading(false);
                    return;
                }

                if (total < requiredMinOrder) {
                    setError(`Le minimum de commande pour votre zone (${postalCodeToCheck}) est de ${requiredMinOrder}€. (Actuel : ${formatPrice(total)})`);
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            const orderData = {
                mode,
                customer: {
                    first_name: customerInfo.firstName,
                    last_name: customerInfo.lastName,
                    phone: customerInfo.phone,
                    email: customerInfo.email,
                    comment: orderComment
                },
                address: mode === 'livraison' ? {
                    street: customerInfo.address.street,
                    postal_code: customerInfo.address.postalCode,
                    city: customerInfo.address.city,
                    additional_info: customerInfo.address.additionalInfo
                } : undefined,
                items: items.map((item: any) => ({
                    id: item.id,
                    quantity: item.quantity,
                    notes: item.notes
                }))
            };

            // Appel API conforme (4 arguments)
            const response = await submitOrder(items, orderData.customer, mode, orderData.address);

            navigate('/commande/confirmation', {
                state: {
                    orderId: response.orderId,
                    total
                }
            });
        } catch (err: any) {
            console.error(err);
            // Affichage de l'erreur précise du backend (ex: Problème fidélité, min order, etc.)
            const msg = err.response?.data?.error || "Une erreur est survenue lors de la validation. Réessayez ou appelez-nous.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        setTimeout(() => navigate('/panier'), 0);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Finaliser ma commande</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLONNE GAUCHE : Panier */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <ShoppingBag size={20} className="text-primary" />
                                Récapitulatif
                            </h2>
                            <div className="space-y-4 mb-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                        <div>
                                            <div className="font-medium">
                                                {item.quantity}x {item.name}
                                                {item.isFree && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">OFFERT</span>}
                                            </div>
                                            {item.notes && <div className="text-sm text-gray-500 italic">{item.notes}</div>}
                                        </div>
                                        <div className="font-bold">
                                            {(item.isFree || item.isReward) ? 'GRATUIT' : formatPrice(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-xl font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                            </div>
                        </div>

                        {/* Upsell */}
                        {upsellProducts.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Utensils size={18} /> Et pour accompagner ?
                                </h3>
                                <div className="space-y-3">
                                    {upsellProducts.map(p => (
                                        <div key={p.id} className="flex items-center justify-between">
                                            <span>{p.name}</span>
                                            <button
                                                onClick={() => handleAddUpsell(p)}
                                                className="text-sm bg-gray-100 hover:bg-primary hover:text-white px-3 py-1 rounded-full font-bold transition-colors"
                                            >
                                                + {formatPrice(p.price)}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions cuisine</label>
                            <textarea
                                value={orderComment}
                                onChange={(e) => setOrderComment(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-primary"
                                placeholder="Allergies, cuisson..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* COLONNE DROITE : Coordonnées & Validation */}
                    <div className="space-y-6">

                        {/* Mode de retrait */}
                        <div className="bg-white rounded-xl shadow-sm p-2 flex">
                            <button
                                onClick={() => setMode('emporter')}
                                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${mode === 'emporter' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Store size={20} /> À Emporter
                            </button>
                            <button
                                onClick={() => setMode('livraison')}
                                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${mode === 'livraison' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Bike size={20} /> Livraison
                            </button>
                        </div>

                        {/* Formulaire */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <User size={20} className="text-primary" /> Vos Coordonnées
                            </h2>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded flex items-center gap-3">
                                    <AlertCircle className="text-red-500" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Prénom</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none transition-colors font-medium"
                                            value={customerInfo.firstName}
                                            onChange={e => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nom</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none transition-colors font-medium"
                                            value={customerInfo.lastName}
                                            onChange={e => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none transition-colors font-medium"
                                            value={customerInfo.phone}
                                            onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                            placeholder="06 12 34 56 78"
                                        />
                                    </div>
                                </div>

                                {mode === 'livraison' && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-4 border-t border-gray-100 mt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MapPin size={20} className="text-primary" />
                                            <span className="font-bold">Adresse de livraison</span>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none"
                                                placeholder="Numéro et Rue"
                                                value={customerInfo.address.street}
                                                onChange={e => setCustomerInfo({ ...customerInfo, address: { ...customerInfo.address, street: e.target.value } })}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none"
                                                    placeholder="Code Postal"
                                                    value={customerInfo.address.postalCode}
                                                    onChange={e => setCustomerInfo({ ...customerInfo, address: { ...customerInfo.address, postalCode: e.target.value } })}
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none"
                                                    placeholder="Ville"
                                                    value={customerInfo.address.city}
                                                    onChange={e => setCustomerInfo({ ...customerInfo, address: { ...customerInfo.address, city: e.target.value } })}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none"
                                                placeholder="Complément (Batiment, etc.)"
                                                value={customerInfo.address.additionalInfo}
                                                onChange={e => setCustomerInfo({ ...customerInfo, address: { ...customerInfo.address, additionalInfo: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                'Validation en cours...'
                            ) : (
                                <>Valider ma commande <ArrowRight size={24} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderRecap;