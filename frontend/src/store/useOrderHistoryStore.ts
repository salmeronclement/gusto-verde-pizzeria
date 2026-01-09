import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus } from '../types';

interface OrderHistoryState {
    orders: Order[];
    addOrder: (order: Order) => void;
    // On accepte string ou number pour éviter les erreurs de type
    updateOrderStatus: (orderId: string | number, status: OrderStatus) => void;
    getOrder: (orderId: string | number) => Order | undefined;
    getOrders: () => Order[];
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
    persist(
        (set, get) => ({
            orders: [],
            addOrder: (order) => {
                set((state) => ({
                    orders: [order, ...state.orders],
                }));
            },
            updateOrderStatus: (orderId, status) => {
                set((state) => ({
                    orders: state.orders.map((order) =>
                        // Comparaison sécurisée en convertissant tout en string
                        String(order.id) === String(orderId) ? { ...order, status } : order
                    ),
                }));
            },
            getOrder: (orderId) => get().orders.find((o) => String(o.id) === String(orderId)),
            getOrders: () => get().orders,
        }),
        {
            name: 'order-history-storage',
        }
    )
);