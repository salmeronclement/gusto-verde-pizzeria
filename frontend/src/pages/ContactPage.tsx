import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function ContactPage() {
    const { settings, fetchPublicSettings } = useSettingsStore();

    React.useEffect(() => {
        fetchPublicSettings();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="bg-dark py-16">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">NOUS CONTACTER</h1>
                    <div className="flex justify-center gap-2 text-sm text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Nous contacter</span>
                    </div>
                </div>
            </div>

            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-6">Informations de contact</h2>
                                <p className="text-gray-600 mb-8">
                                    Une question ? Une suggestion ? N'hésitez pas à nous contacter, notre équipe est à votre écoute.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Adresse</h3>
                                        <p className="text-gray-600">24 boulevard Notre Dame,<br />13006 Marseille</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Téléphone</h3>
                                        <a href="tel:0491555444" className="text-gray-600 hover:text-primary transition-colors">
                                            04 91 555 444
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Email</h3>
                                        <a href="mailto:contact@dolce-pizza-marseille.com" className="text-gray-600 hover:text-primary transition-colors">
                                            contact@dolce-pizza-marseille.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Horaires d'ouverture</h3>
                                        <div className="text-gray-600 space-y-1">
                                            {settings && settings.schedule && settings.schedule.length > 0 ? (
                                                settings.schedule.map((day: any) => (
                                                    <div key={day.day} className="flex justify-between w-full max-w-[200px]">
                                                        <span className="font-medium">{day.day} :</span>
                                                        <span>{day.closed ? 'Fermé' : `${day.open} - ${day.close}`}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Horaires non disponibles</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <h3 className="text-2xl font-display font-bold mb-6">Envoyez-nous un message</h3>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        placeholder="Sujet de votre message"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                                        placeholder="Votre message..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-red-600 transition-colors uppercase tracking-wide"
                                >
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <div className="h-[400px] bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-xl font-medium flex items-center gap-2">
                        <MapPin size={24} />
                        Carte Google Maps à rajouter
                    </span>
                </div>
            </div>
        </div>
    );
}
