import { create } from 'zustand';
import {
    getServiceAdminStatus,
    getServiceAdminHistory,
    openService,
    closeService
} from '../services/api';

interface ServiceStats {
    totalRevenue: number;
    orderCount: number;
    averageTicket: number;
    topItem: string;
}

interface ServiceData {
    id: number;
    start_time: string;
    end_time?: string;
    status: 'open' | 'closed';
    current_revenue?: number;
    current_orders?: number;
}

interface ServiceStore {
    serviceStatus: 'open' | 'closed' | 'loading';
    currentService: ServiceData | null;
    serviceHistory: ServiceData[];
    isLoading: boolean;
    error: string | null;

    fetchServiceStatus: () => Promise<void>;
    fetchServiceHistory: () => Promise<void>;
    openService: () => Promise<void>;
    closeService: () => Promise<ServiceStats | null>;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
    serviceStatus: 'loading',
    currentService: null,
    serviceHistory: [],
    isLoading: false,
    error: null,

    fetchServiceStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getServiceAdminStatus();
            set({
                serviceStatus: data.isOpen ? 'open' : 'closed',
                currentService: data.service,
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching service status:', error);
            set({
                error: 'Impossible de récupérer le statut du service',
                isLoading: false,
                serviceStatus: 'open' // Fallback temporaire : on considère ouvert pour ne pas bloquer les commandes
            });
        }
    },

    fetchServiceHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getServiceAdminHistory();
            set({ serviceHistory: data, isLoading: false });
        } catch (error) {
            console.error('Error fetching service history:', error);
            set({ error: 'Impossible de récupérer l\'historique', isLoading: false });
        }
    },

    openService: async () => {
        set({ isLoading: true });
        try {
            const data = await openService();
            set({
                currentService: data.service,
                serviceStatus: 'open',
                isLoading: false,
                error: null
            });
            await get().fetchServiceStatus();
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                console.warn("Service déjà ouvert détecté -> Synchronisation forcée.");
                await get().fetchServiceStatus();
            } else {
                set({ error: error.message || 'Erreur ouverture', isLoading: false });
            }
        }
    },

    closeService: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await closeService();
            set({
                serviceStatus: 'closed',
                currentService: null,
                isLoading: false
            });
            return data.stats;
        } catch (error: any) {
            console.error('Error closing service:', error);
            set({
                error: error.response?.data?.error || 'Erreur lors de la clôture du service',
                isLoading: false
            });
            return null;
        }
    }
}));
