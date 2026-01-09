import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
    id: number;
    username: string;
    role: string;
}

interface AdminAuthState {
    token: string | null;
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (token: string, admin: AdminUser) => void;
    logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            token: null,
            admin: null,
            isAuthenticated: false,
            login: (token, admin) => set({ token, admin, isAuthenticated: true }),
            logout: () => {
                localStorage.removeItem('admin_token'); // Cleanup legacy if any
                set({ token: null, admin: null, isAuthenticated: false });
            },
        }),
        {
            name: 'admin-storage', // Matches api.ts expectation
            partialize: (state) => ({
                token: state.token,
                admin: state.admin,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
