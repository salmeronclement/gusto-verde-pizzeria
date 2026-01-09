import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Wheat, Award, Star, Quote } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="bg-dark py-16">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">À PROPOS DE NOUS</h1>
                    <div className="flex justify-center gap-2 text-sm text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">À PROPOS DE NOUS</span>
                    </div>
                </div>
            </div>

            {/* Section 1: Intro */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Image Left */}
                        <div className="relative h-[400px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                                <span className="text-lg font-medium">Image à rajouter</span>
                            </div>
                        </div>

                        {/* Content Right */}
                        <div>
                            <span className="text-primary font-display font-bold text-xl mb-2 block">Dolce Pizza Marseille : Tradition et Passion</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-6">Notre Histoire, Votre Destination Gourmande</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Plongez dans l'histoire de Dolce Pizza Marseille, où chaque pizza est un voyage culinaire. Notre pizzeria, ancrée dans la tradition et l'artisanat, offre une expérience gustative inoubliable. Découvrez notre engagement à célébrer les saveurs authentiques et à créer des moments de plaisir pour chacun de nos clients.
                            </p>
                            <Link
                                to="/nos-pizzas"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Découvrir notre carte
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <Flame size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-4">Cuisson au Feu de Bois</h3>
                            <p className="text-gray-600">
                                La cuisson au feu de bois est notre signature. Elle apporte une saveur unique et une croûte croustillante à nos pizzas, rendant chaque bouchée divinement irrésistible et authentique.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <Wheat size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-4">Pizza Artisanale</h3>
                            <p className="text-gray-600">
                                Chaque pizza artisanale est le fruit d'un savoir-faire transmis de génération en génération. Pétrie à la main avec dévouement, elle incarne un héritage de goût et d'authenticité.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <Award size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-4">Ingrédients de Qualité</h3>
                            <p className="text-gray-600">
                                Sélectionnés pour leur excellence, nos ingrédients enrichissent chaque pizza. Nous privilégions la qualité supérieure pour garantir des saveurs intenses et une expérience culinaire mémorable.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Engagements */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Content Left */}
                        <div className="order-2 lg:order-1">
                            <span className="text-primary font-display font-bold text-xl mb-2 block">Plus de 30ans d'expérience</span>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-6">Nos engagements</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Découvrez pourquoi Dolce Pizza Marseille est le choix des connaisseurs. Plus de 30 ans d'excellence culinaire, un engagement inébranlable envers la qualité et un service de livraison qui a gagné le cœur de nos clients.
                            </p>

                            <div className="flex gap-6 items-start p-6 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-dark mb-2">Élue Meilleur Service de Livraison Rapide</h3>
                                    <p className="text-gray-600 text-sm">
                                        Optez pour l'excellence avec Dolce Pizza, le leader de la livraison de pizza à Marseille. Savourez des pizzas artisanales, parfaitement dorées au feu de bois, le tout avec une livraison rapide et gratuite.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Images Right */}
                        <div className="order-1 lg:order-2 relative h-[500px]">
                            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gray-100 rounded-2xl overflow-hidden shadow-lg z-10">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                                    <span className="text-lg font-medium">Image à rajouter</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gray-100 rounded-2xl overflow-hidden shadow-lg z-20 border-8 border-white">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-300">
                                    <span className="text-lg font-medium">Image à rajouter</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Testimonials */}
            <section className="py-20 bg-dark text-white relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-primary font-display font-bold text-xl mb-2 block">Avis Clients</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Votre Satisfaction, Notre Passion</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Découvrez ce que nos clients disent de nous ! Chez Dolce Pizza Marseille, chaque avis compte et reflète notre engagement envers la qualité et le service.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Review 1 */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                            <div className="flex text-primary mb-4">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <p className="text-gray-300 mb-6 italic">
                                "Un accueil téléphonique toujours très sympathique, des pizzas délicieuses et toujours chaudes à l’arrivée ! On adore commander là-bas, nous sommes des clients de longue date !"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">FW</div>
                                <div>
                                    <h4 className="font-bold">Florent Wetterwald</h4>
                                    <span className="text-xs text-gray-400">Client fidèle</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 2 */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                            <div className="flex text-primary mb-4">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <p className="text-gray-300 mb-6 italic">
                                "Accueil excellent. Nous avons pris un panel de pizzas, aussi bonne l’une que l’autre. Cuites au feu de bois, bien garnies avec beaucoup de choix pour tous les tarifs!!!"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">ZM</div>
                                <div>
                                    <h4 className="font-bold">Zakaria Mahboub</h4>
                                    <span className="text-xs text-gray-400">Client vérifié</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 3 */}
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                            <div className="flex text-primary mb-4">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <p className="text-gray-300 mb-6 italic">
                                "Excellent ! Nous nous sommes régalées, les pizzas sont bien garnies et bien cuites, le livreur a été super agréable."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">EH</div>
                                <div>
                                    <h4 className="font-bold">Emilie hello</h4>
                                    <span className="text-xs text-gray-400">Client vérifié</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
