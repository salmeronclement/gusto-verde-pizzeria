import { create } from 'zustand';
import { getPublicSettings } from '../services/api';

interface DeliveryZone {
    zip: string;
    city: string;
}

export interface DeliveryTier {
    id: number;
    min_order: number;
    zones: DeliveryZone[];
}

interface ScheduleItem {
    day: string;
    open: string;
    close: string;
    closed: boolean;
}

interface PublicSettings {
    min_order: number; // Global min order (fallback)
    delivery_fees: number;
    free_delivery_threshold: number;
    delivery_zones: DeliveryTier[]; // Changed to Tiers
    schedule: ScheduleItem[];
    emergency_close: boolean;
    announcement_message: string;
    loyalty_program: LoyaltyProgram;
    promo_offer: PromoOffer;
}

export interface LoyaltyProgram {
    enabled: boolean;
    target_pizzas: number; // Nombre de pizzas pour avoir une gratuite
    require_purchase_for_reward: boolean; // Si true, nécessite une pizza payante dans le panier pour débloquer la récompense
}

export interface PromoOffer {
    enabled: boolean;
    buy_quantity: number;
    get_quantity: number;
    item_type: string; // 'pizza'
}

interface SettingsStore {
    settings: PublicSettings | null;
    loading: boolean;
    fetchPublicSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: null,
    loading: false,

    fetchPublicSettings: async () => {
        set({ loading: true });
        try {
            const data = await getPublicSettings();
            console.log('✅ [Frontend Store] Settings chargés:', data);
            console.log('🎁 [Frontend Store] loyalty_program:', data.loyalty_program);

            // IMPORTANT : On sauvegarde dans localStorage pour que useCartStore puisse y accéder synchrone
            localStorage.setItem('pizzeria-settings', JSON.stringify(data));

            set({ settings: data, loading: false });
        } catch (error) {
            console.error('Error fetching public settings:', error);
            set({ loading: false });
        }
    },
}));
