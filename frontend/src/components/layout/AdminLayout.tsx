import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, FileText, Users, Settings, LogOut, Pizza, Palette } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

interface AdminLayoutProps {
    children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const { isAuthenticated, logout } = useAdminStore();

    // --- SÉCURITÉ ADMIN ---
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    // ----------------------

    const isActive = (path: string) => location.pathname.includes(path);

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/commandes', icon: ShoppingBag, label: 'Commandes' },
        { path: '/admin/historique', icon: FileText, label: 'Historique' },
        { path: '/admin/produits', icon: Pizza, label: 'Notre Carte' },
        { path: '/admin/apparence', icon: Palette, label: 'Apparence' },
        { path: '/admin/blog', icon: FileText, label: 'Blog' },
        { path: '/admin/clients', icon: Users, label: 'Clients' },
        { path: '/admin/livreurs', icon: Users, label: 'Livreurs' },
        { path: '/admin/parametres', icon: Settings, label: 'Paramètres' },
    ];

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            {/* Top Navigation Bar - Vert Forêt */}
            <header className="bg-forest shadow-md z-10 sticky top-0">
                <div className="w-full px-2 lg:px-4">
                    <div className="flex justify-between items-center h-14">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-base font-display font-bold text-white">
                                Gusto <span className="text-primary">Verde</span>
                                <span className="ml-1 text-xs font-sans text-cream/70">Admin</span>
                            </span>
                        </div>

                        {/* Centered Navigation */}
                        <nav className="hidden lg:flex flex-1 justify-center items-center space-x-2 px-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`inline-flex items-center px-2.5 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${isActive(item.path)
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-cream/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <item.icon size={15} className="mr-1.5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Logout */}
                        <div className="flex items-center flex-shrink-0">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-md transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children || <Outlet />}
            </main>
        </div>
    );
}