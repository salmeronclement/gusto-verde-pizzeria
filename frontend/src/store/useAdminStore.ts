import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
    id: number;
    username: string;
    role: 'admin' | 'staff' | 'livreur';
}

interface AdminState {
    admin: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, admin: AdminUser) => void;
    logout: () => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            admin: null,
            token: null,
            isAuthenticated: false,
            login: (token, admin) => set({ token, admin, isAuthenticated: true }),
            logout: () => set({ token: null, admin: null, isAuthenticated: false }),
        }),
        {
            name: 'admin-storage', // unique name for localStorage key
            partialize: (state) => ({ token: state.token, admin: state.admin, isAuthenticated: state.isAuthenticated }),
        }
    )
);
