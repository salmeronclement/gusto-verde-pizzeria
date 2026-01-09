import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoyaltyTransaction {
    id: string;
    date: string; // ISO string
    type: 'earn' | 'redeem';
    amount: number;
    orderId?: string;
    description: string;
}

interface LoyaltyState {
    points: number;
    history: LoyaltyTransaction[];
    addPoints: (amount: number, orderId: string, description?: string) => void;
    redeemPoints: (amount: number, orderId: string) => void;
    getPoints: () => number;
}

export const useLoyaltyStore = create<LoyaltyState>()(
    persist(
        (set, get) => ({
            points: 0,
            history: [],

            addPoints: (amount, orderId, description = 'Commande') => {
                set((state) => ({
                    points: state.points + amount,
                    history: [
                        {
                            id: `TX-${Date.now()}`,
                            date: new Date().toISOString(),
                            type: 'earn',
                            amount,
                            orderId,
                            description,
                        },
                        ...state.history,
                    ],
                }));
            },

            redeemPoints: (amount, orderId) => {
                set((state) => ({
                    points: state.points - amount,
                    history: [
                        {
                            id: `TX-${Date.now()}`,
                            date: new Date().toISOString(),
                            type: 'redeem',
                            amount,
                            orderId,
                            description: 'Réduction fidélité',
                        },
                        ...state.history,
                    ],
                }));
            },

            getPoints: () => get().points,
        }),
        {
            name: 'dolce-loyalty-storage',
        }
    )
);
