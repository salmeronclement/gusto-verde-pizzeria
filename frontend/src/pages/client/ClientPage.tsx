import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserOrders, updateUserProfile, addUserAddress, deleteUserAddress } from '../../services/api'; // Added Address APIs
import { useOrderHistoryStore } from '../../store/useOrderHistoryStore';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Package, Clock, LogOut, User as UserIcon, MapPin, Edit2, Save, X, Plus, Trash2 } from 'lucide-react'; // Added Icons
import { Link, useNavigate } from 'react-router-dom';
import LoyaltyRewardCard from '../../components/LoyaltyRewardCard';
import { Product } from '../../types';
import SEO from '../../components/seo/SEO';

export default function ClientPage() {
    const [apiOrders, setApiOrders] = useState<any[]>([]);
    const { user, logout, refreshProfile } = useAuthStore();
    // On garde useOrderHistoryStore comme fallback ou pour l'instant
    const { orders: historyOrders } = useOrderHistoryStore();

    const { addItem, items: cartItems } = useCartStore();
    const { settings } = useSettingsStore();

    const navigate = useNavigate();

    // État pour l'édition du profil
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            refreshProfile();
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });

            getUserOrders(user.id).then(data => {
                if (Array.isArray(data)) {
                    setApiOrders(data);
                }
            }).catch(console.error);
        }
    }, [user?.id]); // Refresh quand user ID change ou mount

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // État pour les adresses
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        street: '',
        postalCode: '',
        city: '',
        additionalInfo: ''
    });

    // Fonction pour gérer l'ajout d'adresse
    const handleAddAddress = async () => {
        if (!user) return;
        try {
            await addUserAddress(newAddress);
            await refreshProfile();
            setIsAddingAddress(false);
            setNewAddress({ name: '', street: '', postalCode: '', city: '', additionalInfo: '' });
            alert("Adresse ajoutée !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout de l'adresse.");
        }
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return;
        try {
            await deleteUserAddress(id);
            await refreshProfile();
        } catch (error) {
            console.error(error);
            alert("Erreur suppression adresse.");
        }
    };

    // Fonction pour sauvegarder le profil
    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await updateUserProfile({
                ...profileData,
                firstName: profileData.first_name,
                lastName: profileData.last_name
            });
            await refreshProfile(); // Recharger les données depuis le serveur
            setIsEditing(false);
            alert("Profil mis à jour avec succès !");
        } catch (error) {
            console.error("Erreur mise à jour profil:", error);
            alert("Erreur lors de la mise à jour du profil.");
        }
    };

    // Fonction pour gérer l'ajout de récompense depuis le dashboard client
    const handleAddReward = (product: Product) => {
        addItem({
            id: product.id,
            productId: product.id,
            name: `${product.name} 🎁`,
            price: 0,
            unitPrice: 0,
            subtotal: 0,
            quantity: 1,
            category: product.category,
            description: product.description,
            image: product.imageUrl,
            isReward: true,
            isFree: false,
            isPromoEligible: false
        } as any);
        alert("Récompense ajoutée au panier !");
        navigate('/panier');
    };

    if (!user) return <div className="p-8 text-center">Chargement du profil...</div>;

    // Priorité à l'API, sinon historique local
    const displayOrders = apiOrders.length > 0 ? apiOrders : historyOrders;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <SEO
                title="Mon Espace Fidélité | Gusto Verde"
                description="Gérez vos commandes et consultez vos points de fidélité Gusto Verde."
                canonicalUrl="/mon-compte"
                noIndex={true}
            />
            {/* Header Profil */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <UserIcon size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Bonjour, {user.first_name} !
                                </h1>
                                <p className="text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <LogOut size={18} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION: MES INFORMATIONS */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Mes Informations</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                    title="Modifier"
                                >
                                    <Edit2 size={20} />
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Annuler"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Enregistrer"
                                    >
                                        <Save size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Prénom</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2"
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                        />
                                    ) : (
                                        <div className="font-medium text-gray-900">{user.first_name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Nom</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border rounded p-2"
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                        />
                                    ) : (
                                        <div className="font-medium text-gray-900">{user.last_name}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="w-full border rounded p-2"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                ) : (
                                    <div className="font-medium text-gray-900">{user.email}</div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Téléphone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        className="w-full border rounded p-2"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                ) : (
                                    <div className="font-medium text-gray-900">{user.phone}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: MES ADRESSES */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Mes Adresses</h2>
                            {!isAddingAddress && (
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="flex items-center gap-2 text-sm text-primary font-bold hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={16} /> Ajouter
                                </button>
                            )}
                        </div>

                        {/* Formulaire Ajout Adresse */}
                        {isAddingAddress && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                <h3 className="font-bold text-gray-700 mb-3">Nouvelle adresse</h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Nom de l'adresse (Maison, Bureau...)"
                                        className="w-full p-2 border rounded"
                                        value={newAddress.name}
                                        onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Numéro et Rue"
                                        className="w-full p-2 border rounded"
                                        value={newAddress.street}
                                        onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Code Postal"
                                            className="w-full p-2 border rounded"
                                            value={newAddress.postalCode}
                                            onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ville"
                                            className="w-full p-2 border rounded"
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Infos complémentaires (Digicode...)"
                                        className="w-full p-2 border rounded"
                                        value={newAddress.additionalInfo}
                                        onChange={e => setNewAddress({ ...newAddress, additionalInfo: e.target.value })}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => setIsAddingAddress(false)}
                                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleAddAddress}
                                            disabled={!newAddress.street || !newAddress.postalCode || !newAddress.city}
                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {user.addresses.map((addr: any, idx: number) => (
                                    <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="text-primary mt-1 flex-shrink-0" size={18} />
                                            <div>
                                                <div className="font-bold text-gray-900">{addr.label || addr.name || 'Adresse'}</div>
                                                <div className="text-gray-600 text-sm">
                                                    {addr.street}<br />
                                                    {addr.postal_code || addr.postalCode} {addr.city}
                                                </div>
                                                {addr.additional_info && (
                                                    <div className="text-xs text-gray-400 mt-1 italic">
                                                        Note: {addr.additional_info}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAddress(addr.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Supprimer cette adresse"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isAddingAddress && (
                                <div className="text-center text-gray-400 py-4 italic">
                                    Aucune adresse enregistrée.
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Carte de Fidélité */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Ma Fidélité</h2>
                    {settings?.loyalty_program ? (
                        <LoyaltyRewardCard
                            user={user}
                            settings={settings.loyalty_program}
                            cartItems={cartItems}
                            onAddReward={handleAddReward}
                        />
                    ) : (
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                            Programme de fidélité non disponible.
                        </div>
                    )}
                </div>

                {/* Historique des Commandes */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Mes Dernières Commandes</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {displayOrders.length > 0 ? (
                            displayOrders.map((order: any) => (
                                <div key={order.id} className="p-4 sm:p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono font-bold text-lg text-gray-900">
                                                #{String(order.id).slice(-6).toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'livree' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package size={14} /> {order.items?.length || 0} articles
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className="font-bold text-lg text-primary">
                                            {Number(order.total_amount || order.total).toFixed(2)} €
                                        </span>
                                        <Link
                                            to={`/suivi-commande/${order.id}`}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Détails
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Vous n'avez pas encore passé de commande.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}