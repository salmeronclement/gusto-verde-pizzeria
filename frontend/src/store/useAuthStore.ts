import { create } from 'zustand';
import { getUserProfile, updateUserProfile, addUserAddress, updateUserAddress, deleteUserAddress } from '../services/api';

// 1. Définition complète de l'Adresse
export interface Address {
  id: number;
  name?: string; // Ajouté (ex: "Maison", "Travail")
  street: string;
  postal_code: string; // Attention: c'est bien postal_code (snake_case)
  city: string;
  additional_info?: string;
}

// 2. Définition complète du User
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_points?: number; // Ajouté
  addresses: Address[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // Changé en async
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  removeAddress: (id: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ isAuthenticated: false, token: null, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token) {
      // État optimiste initial depuis le localStorage
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ isAuthenticated: true, token, user });
        } catch (e) {
          console.error("Error parsing local user", e);
        }
      }

      // Vérification et mise à jour réelle depuis le serveur
      try {
        const user = await getUserProfile();
        set({ isAuthenticated: true, token, user });
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error("Token invalid or expired", e);
        get().logout();
      }
    } else {
      set({ isAuthenticated: false, token: null, user: null });
    }
  },

  refreshProfile: async () => {
    try {
      const user = await getUserProfile();
      set({ user });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  },

  updateProfile: async (data: any) => {
    await updateUserProfile(data);
    await get().refreshProfile();
  },

  addAddress: async (address: any) => {
    await addUserAddress(address);
    await get().refreshProfile();
  },

  updateAddress: async (id, addressData) => {
    await updateUserAddress(id, addressData);
    await get().refreshProfile();
  },

  removeAddress: async (id) => {
    await deleteUserAddress(id);
    await get().refreshProfile();
  }
}));