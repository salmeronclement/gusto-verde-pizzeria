import { useState } from 'react'
import avatarIcon from '../../assets/images/utilisateur.png'
import quoteIcon from '../../assets/images/quote_1.svg'

const testimonials = [
    {
        id: 1,
        name: 'Emilie hello',
        rating: 5,
        text: 'Excellent ! Nous nous sommes régalées, les pizzas sont bien garnies et bien cuites, le livreur a été super agréable.',
        avatar: avatarIcon,
    },
    {
        id: 2,
        name: 'Cyril Mouillaux',
        rating: 5,
        text: 'Malgré l\'affluence, la prise de commande par téléphone est sérieuse et professionnelle. Livraison effectuée dans de bonnes conditions. Les pizzas sont bien chaudes et appétissantes.',
        avatar: avatarIcon,
    },
    {
        id: 3,
        name: 'Jamie Laubel',
        rating: 5,
        text: 'Service très rapide pour des pizzas délicieuses et copieuses. Après une longue marche dans la ville, toujours un régal de trouver une bonne pizzeria. A refaire très vite pour tester les autres recettes!!',
        avatar: avatarIcon,
    },
    {
        id: 4,
        name: 'Florent Wetterwald',
        rating: 5,
        text: 'Un accueil téléphonique toujours très sympathique, des pizzas délicieuses et toujours chaudes à l\'arrivée ! On adore commander là-bas, nous sommes des clients de longue date ! Mention spéciale également pour tous les gentils livreurs, qui sont polis et souriants à chaque fois !',
        avatar: avatarIcon,
    },
    {
        id: 5,
        name: 'Zakaria Mahboub',
        rating: 5,
        text: 'Accueil excellent. Nous avons pris un panel de pizzas, aussi bonne l\'une que l\'autre. Cuites au feu de bois, bien garnies avec beaucoup de choix pour tous les tarifs!!! Nous les avons commandées à 20h et elles étaient prêtes à l\'heure. Merci à toute l\'équipe!!!',
        avatar: avatarIcon,
    },
]

export default function TestimonialsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    return (
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Title and Navigation */}
                    <div>
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                            Avis Clients
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
                            Votre Satisfaction, Notre Passion
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Découvrez ce que nos clients disent de nous ! Chez Dolce Pizza Marseille,
                            chaque avis compte et reflète notre engagement envers la qualité et le service.
                        </p>
                        <p className="text-sm text-gray-500 italic">
                            [Source : avis clients Google]
                        </p>

                        {/* Navigation Arrows */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={prevTestimonial}
                                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-primary hover:text-white transition-all"
                                aria-label="Témoignage précédent"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-primary hover:text-white transition-all"
                                aria-label="Témoignage suivant"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right: Testimonial Card */}
                    <div className="relative">
                        <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                            {/* Quote Icon */}
                            <div className="absolute -top-4 -left-4 bg-primary p-4 rounded-full">
                                <img
                                    src={quoteIcon}
                                    alt="Quote"
                                    className="w-8 h-8 invert"
                                />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-5 h-5 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                                "{testimonials[currentIndex].text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                        src={testimonials[currentIndex].avatar}
                                        alt={testimonials[currentIndex].name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div>
                                    <h4 className="font-display font-bold text-dark">
                                        {testimonials[currentIndex].name}
                                    </h4>
                                    <p className="text-sm text-gray-500">Client vérifié</p>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                                        }`}
                                    aria-label={`Aller au témoignage ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
