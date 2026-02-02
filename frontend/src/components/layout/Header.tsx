import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, Search, ShoppingBag, Phone, MapPin, Mail, Facebook, Instagram, User } from 'lucide-react'
// 👇 Correction de l'import ici (c'était useStore avant)
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    // Récupération des items depuis le bon store
    const cartItems = useCartStore(state => state.items)
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0) // Calcul précis de la quantité totale

    const { isAuthenticated } = useAuthStore()

    const isActive = (path: string) => location.pathname === path

    // Handle scroll for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="relative z-50">
            {/* Top Bar - Vert Forêt */}
            <div className="bg-forest text-white py-2 text-xs md:text-sm font-medium">
                <div className="container-custom flex justify-between items-center">
                    <div className="hidden lg:flex items-center gap-6">
                        <a href="https://maps.google.com/?q=24+bd+Notre+Dame,13006+Marseille" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <MapPin size={14} />
                            <span>24 bd Notre Dame, 13006 Marseille</span>
                        </a>
                        <a href="tel:0491555444" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Phone size={14} />
                            <span>04 91 555 444</span>
                        </a>
                        <a href="mailto:contact@gustoverde.fr" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Mail size={14} />
                            <span>contact@gustoverde.fr</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-4 ml-auto lg:ml-0">
                        <span className="hidden sm:inline">Suivez-nous :</span>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:scale-110 hover:text-primary transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:scale-110 hover:text-primary transition-all">
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <motion.div
                className={`sticky top-0 w-full transition-all duration-300 ${scrolled ? 'bg-cream/95 backdrop-blur-md shadow-md py-2' : 'bg-cream py-4'
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container-custom flex items-center justify-between">
                    {/* Logo - Text based for Gusto Verde */}
                    <Link to="/" className="flex-shrink-0">
                        <motion.div
                            className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="font-display text-2xl md:text-3xl font-bold text-forest tracking-tight">
                                Gusto <span className="text-primary">Verde</span>
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            { path: '/', label: 'Accueil' },
                            { path: '/nos-pizzas', label: 'Notre Carte' }, // Corrigé pour matcher vos routes
                            { path: '/a-propos', label: 'À Propos' },
                            { path: '/blog', label: 'Blog' },
                            { path: '/contact', label: 'Contact' },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="relative group py-2"
                            >
                                <span className={`text-sm font-bold uppercase tracking-wide transition-colors ${isActive(link.path) ? 'text-primary' : 'text-forest group-hover:text-primary'
                                    }`}>
                                    {link.label}
                                </span>
                                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                    }`} />
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden xl:flex items-center justify-center w-10 h-10 rounded-full hover:bg-forest/10 text-forest transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        {/* Account */}
                        <Link
                            to={isAuthenticated ? "/mon-compte" : "/connexion"}
                            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full hover:bg-forest/10 text-forest transition-colors"
                            title={isAuthenticated ? "Mon Compte" : "Connexion"}
                        >
                            <User size={22} />
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/panier"
                            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-forest/10 text-forest transition-colors"
                        >
                            <ShoppingBag size={22} />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-cream"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* CTA Button */}
                        <Link
                            to="/nos-pizzas"
                            className="hidden lg:flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <span>COMMANDER</span>
                        </Link>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-forest hover:text-primary transition-colors"
                        >
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-cream shadow-2xl z-[100] lg:hidden overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-display text-xl font-bold text-forest">
                                        Gusto <span className="text-primary">Verde</span>
                                    </span>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 hover:bg-forest/10 rounded-full transition-colors"
                                    >
                                        <X size={24} className="text-forest" />
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-4">
                                    {[
                                        { path: '/', label: 'Accueil' },
                                        { path: '/nos-pizzas', label: 'Notre Carte' },
                                        { path: '/a-propos', label: 'À Propos' },
                                        { path: '/blog', label: 'Blog' },
                                        { path: '/contact', label: 'Contact' },
                                        { path: isAuthenticated ? "/mon-compte" : "/connexion", label: isAuthenticated ? "Mon Compte" : "Espace Client" }
                                    ].map((link, index) => (
                                        <motion.div
                                            key={link.path}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={link.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`block py-3 px-4 rounded-lg text-lg font-medium transition-colors ${isActive(link.path)
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-forest hover:bg-forest/5'
                                                    }`}
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>

                                <div className="mt-8 pt-8 border-t border-forest/10">
                                    <Link
                                        to="/nos-pizzas"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg hover:bg-accent transition-colors"
                                    >
                                        COMMANDER MAINTENANT
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Search Popup */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-32 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: -20 }}
                            className="bg-cream rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-display font-bold text-forest">Rechercher</h3>
                                <button
                                    onClick={() => setSearchOpen(false)}
                                    className="p-2 hover:bg-forest/10 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-forest" />
                                </button>
                            </div>
                            <form className="relative">
                                <input
                                    type="search"
                                    placeholder="Pizza, ingrédient, dessert..."
                                    className="w-full px-6 py-4 pr-14 text-lg border-2 border-forest/20 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                                >
                                    <Search size={20} />
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}