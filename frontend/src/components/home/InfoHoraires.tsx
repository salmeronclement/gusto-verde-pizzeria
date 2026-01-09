

// Import real SVG icons
import fireIcon from '../../assets/images/fire-wood-svgrepo-com.svg'
import qualityIcon from '../../assets/images/quality-supervision-svgrepo-com.svg'

import farineImg from '../../assets/images/farine-selection-accueil-dolce.png'
import paymentLogos from '../../assets/images/Moyens-paiement-dolce-pizza-marseille-livraison-pizza.png'

export default function InfoHoraires() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        {/* Badge */}
                        <div className="inline-block bg-primary text-white px-6 py-2 rounded-full font-display font-bold text-xl">
                            Depuis 1992
                        </div>

                        {/* Text */}
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed text-lg">
                                Depuis plus de 30 ans, nous perpétuons la tradition de la vraie pizza
                                napolitaine cuite au feu de bois. Notre secret ? Des ingrédients de premier
                                choix, une pâte faite maison pétrie chaque jour, et une passion inébranlable
                                pour la cuisine qui réconforte l'âme.
                            </p>
                            <p className="text-gray-700 leading-relaxed text-lg mt-4">
                                Chaque pizza est une œuvre d'art culinaire, préparée avec amour par nos
                                pizzaïolos expérimentés et cuite à la perfection dans notre four traditionnel.
                            </p>
                        </div>

                        {/* Features with real icons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <div className="flex flex-col items-center text-center">
                                <img src={fireIcon} alt="Feu de bois" className="w-12 h-12 mb-2" />
                                <p className="text-sm font-semibold text-dark">Cuisson au Feu de Bois</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <img src={farineImg} alt="Farine" className="w-12 h-12 mb-2 object-contain" />
                                <p className="text-sm font-semibold text-dark">Pâte Artisanale</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <img src={qualityIcon} alt="Qualité" className="w-12 h-12 mb-2" />
                                <p className="text-sm font-semibold text-dark">Ingrédients de Qualité</p>
                            </div>
                        </div>

                        {/* Payment Logos */}
                        <div className="pt-6">
                            <p className="text-sm text-gray-600 mb-3 font-semibold">Moyens de paiement acceptés :</p>
                            <img
                                src={paymentLogos}
                                alt="Moyens de paiement"
                                className="h-12 object-contain"
                            />
                        </div>
                    </div>

                    {/* Right Column: Horaires */}
                    <div className="flex items-center justify-center lg:justify-end">
                        <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                            <h3 className="font-display text-2xl font-bold mb-6 text-center">
                                Nos Horaires
                            </h3>

                            <div className="space-y-4 text-center">
                                <div>
                                    <p className="text-lg font-semibold mb-2">Ouvert 7j/7</p>
                                    <p className="text-3xl font-display font-bold">
                                        17h30 - 22h15
                                    </p>
                                </div>

                                <div className="border-t border-white border-opacity-30 pt-4 mt-4">
                                    <p className="text-sm mb-3 opacity-90">Commandez dès maintenant</p>
                                    <a
                                        href="tel:0491555444"
                                        className="inline-block bg-white text-primary font-bold text-2xl py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        04 91 555 444
                                    </a>
                                </div>

                                <p className="text-sm opacity-90 pt-2">
                                    Livraison gratuite à Marseille
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
