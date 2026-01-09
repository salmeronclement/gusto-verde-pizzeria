import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, Phone } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const items = useCartStore(state => state.items);
    const location = useLocation();

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-dark flex flex-col">
            {/* Header */}
            <header className="bg-dark-lighter border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">DP</span>
                            </div>
                            <div>
                                <span className="font-display text-2xl md:text-3xl font-bold text-white">
                                    Dolce Pizza
                                </span>
                                <p className="text-orange text-xs">Marseille</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link
                                to="/"
                                className={`font-sans font-medium transition-colors ${isActive('/') ? 'text-orange' : 'text-gray-300 hover:text-orange'
                                    }`}
                            >
                                Accueil
                            </Link>
                            <Link
                                to="/menu"
                                className={`font-sans font-medium transition-colors ${isActive('/menu') ? 'text-orange' : 'text-gray-300 hover:text-orange'
                                    }`}
                            >
                                Notre Carte
                            </Link>
                            <Link
                                to="/infos"
                                className={`font-sans font-medium transition-colors ${isActive('/infos') ? 'text-orange' : 'text-gray-300 hover:text-orange'
                                    }`}
                            >
                                Infos
                            </Link>
                            <a
                                href="tel:0491555444"
                                className="flex items-center gap-2 bg-orange hover:bg-orange-light text-white px-4 py-2 rounded-full transition-colors font-medium"
                            >
                                <Phone size={18} />
                                04 91 555 444
                            </a>
                            <Link
                                to="/panier"
                                className="relative p-2 text-gray-300 hover:text-orange transition-colors"
                            >
                                <ShoppingCart size={28} />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden py-4 border-t border-gray-800">
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/"
                                    className={`font-sans font-medium py-2 ${isActive('/') ? 'text-orange' : 'text-gray-300'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Accueil
                                </Link>
                                <Link
                                    to="/menu"
                                    className={`font-sans font-medium py-2 ${isActive('/menu') ? 'text-orange' : 'text-gray-300'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Notre Carte
                                </Link>
                                <Link
                                    to="/infos"
                                    className={`font-sans font-medium py-2 ${isActive('/infos') ? 'text-orange' : 'text-gray-300'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Infos
                                </Link>
                                <Link
                                    to="/panier"
                                    className="font-sans font-medium py-2 flex items-center gap-2 text-gray-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ShoppingCart size={20} />
                                    Panier {cartItemCount > 0 && `(${cartItemCount})`}
                                </Link>
                                <a
                                    href="tel:0491555444"
                                    className="flex items-center gap-2 bg-orange text-white px-4 py-2 rounded-full font-medium justify-center"
                                >
                                    <Phone size={18} />
                                    04 91 555 444
                                </a>
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-black text-gray-300 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Logo & About */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">DP</span>
                                </div>
                                <span className="font-display text-xl font-bold text-white">
                                    Dolce Pizza
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Depuis 1992, la vraie pizza cuite sur pierre au feu de bois.
                                Des ingrédients de premier choix pour une expérience authentique.
                            </p>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="font-display font-bold text-lg text-white mb-4">Contact</h3>
                            <div className="space-y-2 text-sm">
                                <p>24 boulevard Notre Dame<br />13006 Marseille</p>
                                <p>
                                    <a href="tel:0491555444" className="hover:text-orange transition-colors">
                                        04 91 555 444
                                    </a>
                                </p>
                                <p>
                                    <a href="mailto:contact@dolce-pizza-marseille.com" className="hover:text-orange transition-colors break-all">
                                        contact@dolce-pizza-marseille.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Hours */}
                        <div>
                            <h3 className="font-display font-bold text-lg text-white mb-4">Horaires</h3>
                            <p className="text-sm">
                                Lundi - Dimanche<br />
                                <span className="text-orange">11h00 - 14h00</span><br />
                                <span className="text-orange">18h00 - 22h30</span>
                            </p>
                            <Link
                                to="/infos"
                                className="inline-block mt-4 text-orange hover:text-orange-light transition-colors text-sm font-medium"
                            >
                                Plus d'informations →
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 text-center text-sm">
                        <p>&copy; 2023 Dolce Pizza Marseille. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
