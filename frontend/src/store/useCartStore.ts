import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  orderComment: string; // Ajouté
  setOrderComment: (comment: string) => void; // Ajouté
  addItem: (item: Omit<CartItem, 'quantity' | 'subtotal'>) => { success: boolean; message?: string };
  removeItem: (productId: number | string, isFree?: boolean, isReward?: boolean) => void;
  updateQuantity: (productId: number | string, quantity: number, isFree?: boolean, isReward?: boolean) => void;
  updateItemNotes: (productId: number | string, notes: string, isFree?: boolean, isReward?: boolean) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  recalculatePromos: () => void;
  getFreeItemAllowance: () => { allowed: number; current: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderComment: '', // Initialisation

      setOrderComment: (comment) => set({ orderComment: comment }),

      addItem: (newItem) => {
        const items = get().items;
        const isFree = newItem.isFree === true;
        const isReward = newItem.isReward === true;

        if (isFree) {
          const existingFree = items.filter(i => i.isFree).reduce((sum, i) => sum + i.quantity, 0);
          const { allowed } = get().getFreeItemAllowance();
          if (existingFree >= allowed) {
            return { success: false, message: "Vous avez déjà atteint la limite de pizzas offertes." };
          }
        }

        if (isReward) {
          const existingReward = items.some(i => i.isReward);
          if (existingReward) {
            return { success: false, message: "Vous ne pouvez utiliser qu'une seule récompense fidélité par commande." };
          }
        }

        const existingItemIndex = items.findIndex(
          (item) =>
            String(item.productId) === String(newItem.productId) &&
            (item.isFree === true) === isFree &&
            (item.isReward === true) === isReward
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;
          updatedItems[existingItemIndex].subtotal = Number(updatedItems[existingItemIndex].quantity) * Number(updatedItems[existingItemIndex].unitPrice);
          set({ items: updatedItems });
        } else {
          set({
            items: [...items, {
              ...newItem,
              quantity: 1,
              subtotal: Number(newItem.unitPrice),
              isFree: isFree,
              isReward: isReward,
              unitPrice: Number(newItem.unitPrice)
            }],
          });
        }
        return { success: true };
      },

      removeItem: (productId, isFree = false, isReward = false) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(String(item.productId) === String(productId) && (item.isFree === true) === isFree && (item.isReward === true) === isReward)
          ),
        }));
      },

      updateQuantity: (productId, quantity, isFree = false, isReward = false) => {
        if (quantity <= 0) {
          get().removeItem(productId, isFree, isReward);
          return;
        }
        if (isFree && quantity > get().items.find(i => String(i.productId) === String(productId) && i.isFree)?.quantity!) {
          const { allowed, current } = get().getFreeItemAllowance();
          if (current >= allowed) return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            String(item.productId) === String(productId) && (item.isFree === true) === isFree && (item.isReward === true) === isReward
              ? { ...item, quantity, subtotal: Number(quantity) * Number(item.unitPrice) }
              : item
          ),
        }));
      },

      updateItemNotes: (productId, notes, isFree = false, isReward = false) => {
        set((state) => ({
          items: state.items.map((item) =>
            String(item.productId) === String(productId) && (item.isFree === true) === isFree && (item.isReward === true) === isReward
              ? { ...item, notes }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], orderComment: '' }),

      getTotal: () => {
        const { items } = get();
        // Sécurisation du calcul TOTAL (Number obligatoire pour éviter la concaténation "10" + "20" = "1020")
        return items.reduce((total, item) => {
          // Si c'est gratuit ou reward, le prix est 0 de toute façon, mais on sécurise
          const val = Number(item.subtotal || 0);
          return total + (isNaN(val) ? 0 : val);
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + Number(item.quantity || 0), 0);
      },

      getFreeItemAllowance: () => {
        const items = get().items;
        const paidPizzas = items
          .filter(i => {
            if (i.isFree || i.isReward || !i.category) return false;
            const cat = i.category.toLowerCase();
            return ['pizza', 'classique', 'signature', 'gourmande', 'base crème', 'base tomate'].some(k => cat.includes(k));
          })
          .reduce((sum, i) => sum + Number(i.quantity || 0), 0);

        const settings = localStorage.getItem('pizzeria-settings');
        const promo = settings ? JSON.parse(settings).promo_offer : null;

        if (promo && promo.enabled) {
          const sets = Math.floor(paidPizzas / Number(promo.buy_quantity));
          return {
            allowed: sets * Number(promo.get_quantity),
            current: items.filter(i => i.isFree).reduce((sum, i) => sum + Number(i.quantity || 0), 0)
          };
        }
        return { allowed: 0, current: 0 };
      },

      recalculatePromos: () => { }
    }),
    { name: 'cart-storage' }
  )
);