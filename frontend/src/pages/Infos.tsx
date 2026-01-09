import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Infos: React.FC = () => {
    return (
        <div className="py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-display text-5xl font-bold text-white mb-10">
                    Infos pratiques
                </h1>

                {/* About */}
                <div className="bg-dark-card rounded-2xl border border-gray-800 p-8 md:p-10 mb-8">
                    <h2 className="font-display text-3xl font-bold mb-6 text-white">
                        À propos de nous
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        Depuis 1992, nous perpétuons la tradition de la vraie pizza cuite sur pierre au feu de bois.
                        Notre secret ? Des ingrédients de premier choix, une pâte faite maison et une passion inébranlable
                        pour la cuisine qui réconforte l'âme.
                    </p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Address */}
                    <div className="bg-dark-card rounded-2xl border border-gray-800 p-8 hover:border-orange transition-colors">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange to-orange-dark rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl mb-3 text-white">Adresse</h3>
                                <p className="text-gray-300 text-lg">
                                    24 boulevard Notre Dame<br />
                                    13006 Marseille
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-dark-card rounded-2xl border border-gray-800 p-8 hover:border-orange transition-colors">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange to-orange-dark rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl mb-3 text-white">Téléphone</h3>
                                <a
                                    href="tel:0491555444"
                                    className="text-orange hover:text-orange-light font-sans font-semibold text-xl transition-colors"
                                >
                                    04 91 555 444
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="bg-dark-card rounded-2xl border border-gray-800 p-8 hover:border-orange transition-colors">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange to-orange-dark rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl mb-3 text-white">Email</h3>
                                <a
                                    href="mailto:contact@dolce-pizza-marseille.com"
                                    className="text-orange hover:text-orange-light font-sans transition-colors break-all"
                                >
                                    contact@dolce-pizza-marseille.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="bg-dark-card rounded-2xl border border-gray-800 p-8 hover:border-orange transition-colors">
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange to-orange-dark rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl mb-3 text-white">Horaires</h3>
                                <p className="text-gray-300 text-lg">
                                    Lundi - Dimanche<br />
                                    <span className="text-orange font-semibold">11h00 - 14h00</span><br />
                                    <span className="text-orange font-semibold">18h00 - 22h30</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Zone */}
                <div className="bg-gradient-to-r from-orange-dark to-orange rounded-2xl p-10 text-center shadow-2xl">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
                        Zone de livraison
                    </h2>
                    <p className="text-xl md:text-2xl text-white mb-3">
                        Livraison gratuite du <span className="font-bold">1er au 10e arrondissement</span> de Marseille
                    </p>
                    <p className="text-lg text-white opacity-90">
                        Nos pizzas sont également convertibles en calzone ou chausson !
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Infos;
