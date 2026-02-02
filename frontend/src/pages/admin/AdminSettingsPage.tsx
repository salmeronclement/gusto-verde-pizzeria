import React, { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings, getAdminProducts, bulkUpdateProducts } from '../../services/api';
import {
    Save, Store, Truck, Gift, Plus, Trash2, AlertTriangle,
    Clock, MapPin, Percent, Info
} from 'lucide-react';
import { Product } from '../../types';

interface ScheduleItem {
    day: string;
    open: string;
    close: string;
    closed: boolean;
}

interface DeliveryZone {
    zip: string;
    city: string;
}

interface DeliveryTier {
    id?: number;
    min_order: number;
    zones: DeliveryZone[];
}

interface LoyaltyProgram {
    enabled: boolean;
    target_pizzas: number;
    require_purchase_for_reward?: boolean;
}

interface PromoOffer {
    enabled: boolean;
    buy_quantity: number;
    get_quantity: number;
    item_type: string;
}

interface SettingsState {
    delivery_zones: DeliveryTier[];
    loyalty_program: LoyaltyProgram;
    promo_offer: PromoOffer;
    announcement_message: string;
    delivery_fees: string;
    min_order: string;
    emergency_close: boolean;
    auto_print_on_validate: boolean;
    enable_new_order_alert: boolean; // NEW
    schedule: ScheduleItem[];
}

const AdminSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'restaurant' | 'delivery' | 'marketing'>('restaurant');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<SettingsState>({
        delivery_zones: [],
        loyalty_program: { enabled: false, target_pizzas: 10 },
        promo_offer: { enabled: false, buy_quantity: 3, get_quantity: 1, item_type: 'pizza' },
        announcement_message: '',
        delivery_fees: '0',
        min_order: '0',
        emergency_close: false,
        auto_print_on_validate: false,
        enable_new_order_alert: false, // Default false
        schedule: []
    });

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchSettings(), fetchProducts()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getAdminSettings();
            // Fonction pour parser les JSON stockés en string si nécessaire
            const safeParse = (val: any, fallback: any) => {
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch (e) { return fallback; }
                }
                return val || fallback;
            };

            // Default Schedule if empty
            const defaultSchedule: ScheduleItem[] = [
                { day: 'Lundi', open: '18:00', close: '22:00', closed: true },
                { day: 'Mardi', open: '18:00', close: '22:00', closed: true },
                { day: 'Mercredi', open: '18:00', close: '22:00', closed: false },
                { day: 'Jeudi', open: '18:00', close: '22:00', closed: false },
                { day: 'Vendredi', open: '18:00', close: '23:00', closed: false },
                { day: 'Samedi', open: '18:00', close: '23:00', closed: false },
                { day: 'Dimanche', open: '18:00', close: '22:00', closed: false },
            ];

            const scheduleData = safeParse(data.schedule, []);
            const finalSchedule = scheduleData.length > 0 ? scheduleData : defaultSchedule;

            setSettings({
                ...data,
                emergency_close: data.emergency_close === true || data.emergency_close === 'true',
                auto_print_on_validate: data.auto_print_on_validate === true || data.auto_print_on_validate === 'true',
                enable_new_order_alert: data.enable_new_order_alert === true || data.enable_new_order_alert === 'true', // Handle string/bool
                schedule: finalSchedule,
                delivery_zones: safeParse(data.delivery_zones, []),
                loyalty_program: safeParse(data.loyalty_program, { enabled: false, target_pizzas: 10 }),
                promo_offer: safeParse(data.promo_offer, { enabled: false, buy_quantity: 3, get_quantity: 1, item_type: 'pizza' })
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const togglePizzaEligibility = async (productId: string | number, currentValue: boolean) => {
        // Logique unitaire (déjà gérée par le bulk update mais gardée pour référence)
        // Ici on va plutôt utiliser le bulkUpdate pour être cohérent avec l'UI
        handleBulkUpdate('loyalty', !currentValue, [productId]);
    };

    const togglePromoEligibility = async (productId: string | number, currentValue: boolean) => {
        handleBulkUpdate('promo', !currentValue, [productId]);
    };

    const [updating, setUpdating] = useState(false);

    const handleBulkUpdate = async (type: 'loyalty' | 'promo', value: boolean, specificIds?: (string | number)[]) => {
        // 1. Calcul des IDs ciblés
        const targetIds = specificIds || products
            .filter(p => p.category.includes('pizza'))
            .map(p => p.id);

        if (targetIds.length === 0) return;

        setUpdating(true);

        try {
            const updates = type === 'loyalty'
                ? { is_loyalty_eligible: value ? 1 : 0 }
                : { is_promo_eligible: value ? 1 : 0 };

            // Optimistic Update
            if (targetIds.length > 0) {
                setProducts(prev => prev.map(p => {
                    if (targetIds.includes(p.id)) {
                        return {
                            ...p,
                            ...(type === 'loyalty' ? { is_loyalty_eligible: value } : { is_promo_eligible: value })
                        };
                    }
                    return p;
                }));
            }

            await bulkUpdateProducts({
                productIds: targetIds,
                updates: updates
            });

            // STRICT SYNC: On recharge depuis le serveur pour être sûr
            await fetchProducts();

        } catch (error) {
            console.error('Error bulk updating:', error);
            alert('Erreur lors de la mise à jour des produits.');
        } finally {
            setUpdating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateAdminSettings(settings);
            alert('Paramètres enregistrés avec succès !');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleScheduleChange = (index: number, field: keyof ScheduleItem, value: any) => {
        const newSchedule = [...settings.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSettings({ ...settings, schedule: newSchedule });
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Paramètres du Restaurant</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('restaurant')}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'restaurant' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Store size={20} /> Restaurant & Horaires
                </button>
                <button
                    onClick={() => setActiveTab('delivery')}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'delivery' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Truck size={20} /> Livraison & Zones
                </button>
                <button
                    onClick={() => setActiveTab('marketing')}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'marketing' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Gift size={20} /> Fidélité & Promos
                </button>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                {/* TAB 1: RESTAURANT */}
                {activeTab === 'restaurant' && (
                    <div className="space-y-8">
                        {/* Emergency Close */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-3 rounded-full text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 text-lg">Fermeture d'Urgence</h3>
                                    <p className="text-red-700 text-sm">Activez cette option pour empêcher toute nouvelle commande immédiatement.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.emergency_close}
                                    onChange={(e) => setSettings({ ...settings, emergency_close: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        {/* Auto Print */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 text-lg">Impression Automatique</h3>
                                    <p className="text-blue-700 text-sm">Imprime le ticket cuisine automatiquement lors de la validation.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.auto_print_on_validate}
                                    onChange={(e) => setSettings({ ...settings, auto_print_on_validate: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Order Alert (Sound + Popup) */}
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-orange-900 text-lg">Alerte Sonore & Popup</h3>
                                    <p className="text-orange-700 text-sm">Joue un son et ouvre la commande dès réception.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.enable_new_order_alert}
                                    onChange={(e) => setSettings({ ...settings, enable_new_order_alert: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>

                        {/* Announcement */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-2">Bannière d'annonce</label>
                            <input
                                type="text"
                                value={settings.announcement_message}
                                onChange={(e) => setSettings({ ...settings, announcement_message: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="Ex: 🎉 Livraison offerte ce soir !"
                            />
                        </div>

                        {/* Schedule */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-primary" /> Horaires d'ouverture
                            </h3>
                            <div className="grid gap-4">
                                {settings.schedule.map((day, index) => (
                                    <div key={day.day} className="flex flex-wrap items-center gap-2 md:gap-4 p-3 bg-gray-50 rounded-lg">
                                        <span className="w-24 font-medium">{day.day}</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!day.closed}
                                                onChange={(e) => handleScheduleChange(index, 'closed', !e.target.checked)}
                                                className="rounded text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">Ouvert</span>
                                        </label>
                                        {!day.closed && (
                                            <>
                                                <input
                                                    type="time"
                                                    value={day.open}
                                                    onChange={(e) => handleScheduleChange(index, 'open', e.target.value)}
                                                    className="px-2 py-1 border rounded"
                                                />
                                                <span>à</span>
                                                <input
                                                    type="time"
                                                    value={day.close}
                                                    onChange={(e) => handleScheduleChange(index, 'close', e.target.value)}
                                                    className="px-2 py-1 border rounded"
                                                />
                                            </>
                                        )}
                                        {day.closed && <span className="text-gray-400 italic text-sm">Fermé</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: DELIVERY */}
                {activeTab === 'delivery' && (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Frais de livraison (€)</label>
                                <input
                                    type="number"
                                    step="0.10"
                                    value={settings.delivery_fees}
                                    onChange={(e) => setSettings({ ...settings, delivery_fees: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Minimum de commande (€)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={settings.min_order}
                                    onChange={(e) => setSettings({ ...settings, min_order: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Zones */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-primary" /> Zones de livraison
                            </h3>
                            <div className="space-y-6">
                                {settings.delivery_zones.map((tier, tierIndex) => (
                                    <div key={tier.id || tierIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-700">Palier #{tierIndex + 1}</span>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-600">Min. commande :</label>
                                                    <div className="relative w-24">
                                                        <input
                                                            type="number"
                                                            value={tier.min_order}
                                                            onChange={(e) => {
                                                                const newZones = [...settings.delivery_zones];
                                                                newZones[tierIndex] = { ...tier, min_order: Number(e.target.value) };
                                                                setSettings({ ...settings, delivery_zones: newZones });
                                                            }}
                                                            className="w-full pl-2 pr-6 py-1 border rounded font-bold text-dark"
                                                        />
                                                        <span className="absolute right-2 top-1 text-gray-500">€</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newZones = [...settings.delivery_zones];
                                                    newZones.splice(tierIndex, 1);
                                                    setSettings({ ...settings, delivery_zones: newZones });
                                                }}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {tier.zones.map((zone, zoneIndex) => (
                                                    <div key={zoneIndex} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
                                                        <span className="font-mono font-bold">{zone.zip}</span>
                                                        <span className="text-sm">{zone.city}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newZones = [...settings.delivery_zones];
                                                                const updatedTierZones = [...tier.zones];
                                                                updatedTierZones.splice(zoneIndex, 1);
                                                                newZones[tierIndex] = { ...tier, zones: updatedTierZones };
                                                                setSettings({ ...settings, delivery_zones: newZones });
                                                            }}
                                                            className="text-blue-400 hover:text-blue-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-2xl">
                                                <input type="text" placeholder="Code Postal" className="w-24 px-3 py-1 border rounded text-sm" id={`zip-${tierIndex}`} />
                                                <input type="text" placeholder="Ville" className="flex-1 px-3 py-1 border rounded text-sm" id={`city-${tierIndex}`} />
                                                <button
                                                    onClick={() => {
                                                        const zipInput = document.getElementById(`zip-${tierIndex}`) as HTMLInputElement;
                                                        const cityInput = document.getElementById(`city-${tierIndex}`) as HTMLInputElement;
                                                        if (zipInput.value && cityInput.value) {
                                                            const newZones = [...settings.delivery_zones];
                                                            const updatedTierZones = [...tier.zones, { zip: zipInput.value, city: cityInput.value }];
                                                            newZones[tierIndex] = { ...tier, zones: updatedTierZones };
                                                            setSettings({ ...settings, delivery_zones: newZones });
                                                            zipInput.value = '';
                                                            cityInput.value = '';
                                                        }
                                                    }}
                                                    className="px-4 py-1 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 text-sm"
                                                >
                                                    + Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setSettings({ ...settings, delivery_zones: [...settings.delivery_zones, { id: Date.now(), min_order: 15, zones: [] }] })}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} /> Ajouter un palier
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: MARKETING */}
                {activeTab === 'marketing' && (
                    <div className="space-y-10">
                        {/* Loyalty */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <Gift size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg">Programme de Fidélité</h3>
                                        <p className="text-sm text-blue-700">Système de tampons pizza 🍕</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.loyalty_program.enabled}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            loyalty_program: { ...settings.loyalty_program, enabled: e.target.checked }
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>

                            <div className={`${!settings.loyalty_program.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <label className="block text-sm font-bold text-blue-800 mb-2">Combien de pizzas pour une gratuite ?</label>
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.loyalty_program.target_pizzas}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                loyalty_program: { ...settings.loyalty_program, target_pizzas: Number(e.target.value) }
                                            })}
                                            className="w-24 pl-4 pr-4 py-3 border-2 border-blue-200 rounded-xl text-center font-bold text-2xl text-blue-700 focus:border-blue-500 focus:ring-0"
                                        />
                                        <div className="flex items-center gap-2 text-lg">
                                            <span className="text-3xl">🍕</span> → <span className="text-2xl">🎁</span>
                                            <span className="font-bold text-blue-800">1 Pizza Offerte !</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-blue-100 mt-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.loyalty_program.require_purchase_for_reward !== false}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                loyalty_program: { ...settings.loyalty_program, require_purchase_for_reward: e.target.checked }
                                            })}
                                            className="w-5 h-5 text-blue-600 rounded mt-0.5"
                                        />
                                        <div>
                                            <p className="font-bold text-blue-900">Obliger l'achat d'une pizza payante</p>
                                            <p className="text-sm text-blue-700 mt-1">Nécessaire pour utiliser la récompense.</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Eligible Pizzas */}
                                <div className="mt-6">
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => handleBulkUpdate('loyalty', true)} className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded hover:bg-green-200">Tout cocher</button>
                                        <button onClick={() => handleBulkUpdate('loyalty', false)} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200">Tout décocher</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                                        {products.filter(p => p.category.includes('pizza')).map(product => (
                                            <label key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!(product as any).is_loyalty_eligible}
                                                    onChange={() => togglePizzaEligibility(product.id, !!(product as any).is_loyalty_eligible)}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{product.name} {!!(product as any).is_loyalty_eligible && '🎁'}</p>
                                                    <p className="text-xs text-gray-500">{Number(product.price).toFixed(2)} €</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promo Offer */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                        <Percent size={24} />
                                    </div>
                                    <h3 className="font-bold text-purple-900 text-lg">Offre Automatique (N + 1)</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.promo_offer.enabled}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            promo_offer: { ...settings.promo_offer, enabled: e.target.checked }
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>

                            <div className={`${!settings.promo_offer.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="p-4 bg-white rounded-lg border border-purple-100 flex flex-wrap items-center gap-3 text-lg">
                                    <span>Pour</span>
                                    <input
                                        type="number"
                                        className="w-16 px-2 py-1 border border-purple-300 rounded text-center font-bold text-purple-700"
                                        value={settings.promo_offer.buy_quantity}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            promo_offer: { ...settings.promo_offer, buy_quantity: Number(e.target.value) }
                                        })}
                                    />
                                    <select
                                        className="px-3 py-1 border border-purple-300 rounded font-bold text-purple-700"
                                        value={settings.promo_offer.item_type}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            promo_offer: { ...settings.promo_offer, item_type: e.target.value }
                                        })}
                                    >
                                        <option value="pizza">Pizzas</option>
                                        <option value="boisson">Boissons</option>
                                        <option value="dessert">Desserts</option>
                                    </select>
                                    <span>achetées, offrir</span>
                                    <input
                                        type="number"
                                        className="w-16 px-2 py-1 border border-purple-300 rounded text-center font-bold text-purple-700"
                                        value={settings.promo_offer.get_quantity}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            promo_offer: { ...settings.promo_offer, get_quantity: Number(e.target.value) }
                                        })}
                                    />
                                    <span className="font-bold text-purple-700 capitalize">{settings.promo_offer.item_type}</span>
                                    <span>gratuite(s).</span>
                                </div>

                                <div className="mt-6">
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => handleBulkUpdate('promo', true)} className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded hover:bg-green-200">Tout cocher</button>
                                        <button onClick={() => handleBulkUpdate('promo', false)} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded hover:bg-red-200">Tout décocher</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                                        {products.filter(p => p.category.includes('pizza')).map(product => (
                                            <label key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(product as any).is_promo_eligible !== undefined ? !!(product as any).is_promo_eligible : true}
                                                    onChange={() => togglePromoEligibility(product.id, (product as any).is_promo_eligible !== undefined ? !!(product as any).is_promo_eligible : true)}
                                                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{product.name} {((product as any).is_promo_eligible !== undefined ? !!(product as any).is_promo_eligible : true) && '🎁'}</p>
                                                    <p className="text-xs text-gray-500">{Number(product.price).toFixed(2)} €</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettingsPage;