import { useEffect, useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, FileText, Users, Settings, LogOut, Pizza, Palette, Menu, X } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminLayoutProps {
    children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const { isAuthenticated, logout } = useAdminStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // PWA Manifest Injection
    useEffect(() => {
        // Set manifest
        let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
        }
        manifestLink.href = '/manifest-admin.json';

        // Set theme color
        let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
        if (!themeColor) {
            themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            document.head.appendChild(themeColor);
        }
        themeColor.content = '#2D5A3D';

        // Set apple-touch-icon
        let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
        if (!appleIcon) {
            appleIcon = document.createElement('link');
            appleIcon.rel = 'apple-touch-icon';
            document.head.appendChild(appleIcon);
        }
        appleIcon.href = '/admin-icon-192.png';
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
        <div className="min-h-screen bg-cream flex">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop & Mobile) */}
            <motion.aside
                className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-forest text-white transition-transform lg:translate-x-0 lg:static flex flex-col`}
                initial={false}
                animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
                // On large screens, we force x: 0 via CSS classes, but here we control mobile state
                style={{ x: isMobileMenuOpen ? 0 : undefined }} // Reset style on large screens if handled by CSS, but framer-motion might override. 
            // Better approach with Tailwind responsive classes:
            // variants={{
            //     open: { x: 0 },
            //     closed: { x: '-100%' }
            // }}
            // animate={window.innerWidth >= 1024 ? "open" : (isMobileMenuOpen ? "open" : "closed")}
            // Simpler for now: utilize Tailwind's `lg:translate-x-0` but we need to undo Framer's inline style on LG.
            >
                {/* Override Framer Motion style on Large Screens */}
                <div className={`flex flex-col h-full bg-forest w-64 fixed lg:static top-0 bottom-0 z-50 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                    {/* Header Sidebar */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                        <span className="text-xl font-display font-bold">
                            Gusto <span className="text-primary">Verde</span>
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden p-1 hover:bg-white/10 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-cream/80 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-forest text-white h-16 flex items-center px-4 shadow-md sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-md"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-display font-bold text-lg">
                        Admin <span className="text-primary text-sm font-sans ml-2 opacity-80">{navItems.find(i => isActive(i.path))?.label || 'Dashboard'}</span>
                    </span>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}