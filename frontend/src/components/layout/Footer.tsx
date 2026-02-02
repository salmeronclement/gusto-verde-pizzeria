import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'

export default function Footer() {
    const [email, setEmail] = useState('')
    const { settings, fetchPublicSettings } = useSettingsStore()

    useEffect(() => {
        if (!settings) {
            fetchPublicSettings()
        }
    }, [settings, fetchPublicSettings])

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement newsletter subscription
        console.log('Newsletter subscription:', email)
        setEmail('')
    }

    const phone = settings?.contact_info?.phone || '04 91 555 444'
    const address = settings?.contact_info?.address || '24 boulevard Notre Dame, 13006 Marseille'
    const contactEmail = settings?.contact_info?.email || 'contact@gustoverde.fr'
    const brandName = settings?.contact_info?.brand_name || 'Gusto Verde'
    const phoneLink = phone.replace(/\s/g, '')

    return (
        <footer
            className="bg-forest text-white relative"
            style={{
                backgroundImage: 'url(https://dolce-pizza-marseille.com/wp-content/uploads/2023/06/footer_bg_5.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
            }}
        >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-forest bg-opacity-90 z-0"></div>

            {/* Main Footer Content */}
            <div className="container-custom py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Column 1: About Us */}
                    <div className="footer-widget">
                        <h3 className="text-xl font-bold mb-4 pb-3 border-b-2 border-primary inline-block">
                            À Propos De Nous
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Chez Gusto Verde, nous cultivons l'art de la cuisine italienne authentique avec une touche bio et responsable.
                            Des ingrédients frais, une pâte artisanale et une passion pour le goût naturel.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-white bg-opacity-10 hover:bg-primary text-white rounded transition-colors"
                                aria-label="Facebook"
                            >
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-white bg-opacity-10 hover:bg-primary text-white rounded transition-colors"
                                aria-label="Instagram"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Our Menu */}
                    <div className="footer-widget">
                        <h3 className="text-xl font-bold mb-4 pb-3 border-b-2 border-primary inline-block">
                            Notre Carte
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <i className="fa-solid fa-arrow-right text-primary text-xs"></i>
                                <Link
                                    to="/nos-pizzas"
                                    className="text-gray-300 hover:text-primary text-sm transition-colors"
                                >
                                    Nos pizzas
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa-solid fa-arrow-right text-primary text-xs"></i>
                                <Link
                                    to="/boissons-desserts"
                                    className="text-gray-300 hover:text-primary text-sm transition-colors"
                                >
                                    Nos Boissons & Desserts
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa-solid fa-arrow-right text-primary text-xs"></i>
                                <Link
                                    to="/#offres"
                                    className="text-gray-300 hover:text-primary text-sm transition-colors"
                                >
                                    Nos offres
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="footer-widget">
                        <h3 className="text-xl font-bold mb-4 pb-3 border-b-2 border-primary inline-block">
                            Nous contacter
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-full">
                                    <i className="fa-solid fa-location-dot text-white text-sm"></i>
                                </div>
                                <p className="text-gray-300 text-sm pt-2">
                                    {address}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-full">
                                    <i className="fa-solid fa-phone text-white text-sm"></i>
                                </div>
                                <p className="text-gray-300 text-sm pt-2">
                                    <a
                                        href={`tel:+33${phoneLink.substring(1)}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {phone}
                                    </a>
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-full">
                                    <i className="fa-solid fa-envelope text-white text-sm"></i>
                                </div>
                                <p className="text-gray-300 text-sm pt-2">
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="hover:text-primary transition-colors break-all"
                                    >
                                        {contactEmail}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="footer-widget">
                        <h3 className="text-xl font-bold mb-4 pb-3 border-b-2 border-primary inline-block">
                            Inscrivez-vous à notre Newsletter !
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            Inscrivez-vous à notre newsletter pour ne rien manquer de nos offres exclusives,
                            nouveautés et événements spéciaux chez Gusto Verde !
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Votre email"
                                required
                                className="flex-1 px-4 py-2.5 text-sm bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-opacity-15"
                            />
                            <button
                                type="submit"
                                className="w-12 h-12 flex items-center justify-center bg-primary hover:bg-accent text-white rounded transition-colors flex-shrink-0"
                                aria-label="Subscribe to newsletter"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-white border-opacity-10 bg-forest relative z-10">
                <div className="container-custom py-5">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        {/* Center: Copyright */}
                        <div className="lg:flex-1 lg:text-center">
                            <p className="text-sm text-gray-400">
                                Copyright © 2024{' '}
                                <span className="text-white font-semibold">
                                    {brandName.toUpperCase()}
                                </span>
                                . Tous droits réservés.
                            </p>
                        </div>

                        {/* Right: Legal Links */}
                        <div className="flex gap-6 text-sm">
                            <Link
                                to="/politique-confidentialite"
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                Politique de confidentialité
                            </Link>
                            <Link
                                to="/mentions-legales"
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                Mentions légales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button (visible on scroll) */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-primary hover:bg-accent text-white rounded-full shadow-lg transition-all hover:scale-110 z-40"
                aria-label="Scroll to top"
            >
                <i className="fa-solid fa-arrow-up"></i>
            </button>
        </footer>
    )
}
