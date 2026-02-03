import pizzaCenterImg from '../../assets/images/pizza-vue-details-accueil-dolce.png'

// Import real SVG icons
import fireIcon from '../../assets/images/fire-wood-svgrepo-com.svg'
import qualityIcon from '../../assets/images/quality-supervision-svgrepo-com.svg'
import deliveryIcon from '../../assets/images/pizza-delivery-svgrepo-com.svg'
import pizzaIcon from '../../assets/images/pizza-restaurant-dinner-svgrepo-com.svg'

// Import decorative images
import tomatoImg from '../../assets/images/red_chili_2.png'

export default function Avantages() {
    const avantages = [
        {
            id: 1,
            title: 'Cuisson au Feu de Bois',
            description: 'La cuisson au feu de bois est notre signature. Elle apporte une saveur unique et une croûte croustillante.',
            icon: fireIcon,
            position: 'left-top',
        },
        {
            id: 2,
            title: 'Pizza Artisanale',
            description: 'Chaque pizza artisanale est le fruit d\'un savoir-faire transmis de génération en génération.',
            icon: pizzaIcon,
            position: 'left-bottom',
        },
        {
            id: 3,
            title: 'Ingrédients de Qualité',
            description: 'Sélectionnés pour leur excellence, nos ingrédients enrichissent chaque pizza.',
            icon: qualityIcon,
            position: 'right-top',
        },
        {
            id: 4,
            title: 'Livraison Rapide',
            description: 'Livraison gratuite 7j/7 à Marseille. Vos pizzas arrivent chaudes et à l\'heure.',
            icon: deliveryIcon,
            position: 'right-bottom',
        },
    ]

    return (
        <section className="py-20 bg-white overflow-hidden relative">
            {/* Decorative chili peppers */}
            <img
                src={tomatoImg}
                alt=""
                aria-hidden="true"
                className="absolute top-10 left-10 w-16 opacity-20 rotate-12"
            />
            <img
                src={tomatoImg}
                alt=""
                aria-hidden="true"
                className="absolute bottom-10 right-10 w-16 opacity-20 -rotate-12"
            />

            <div className="container-custom">
                {/* Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Nos Avantages
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Découvrez ce qui fait de Dolce Pizza votre meilleur choix pour une pizza authentique
                    </p>
                </div>

                {/* Layout with center image and surrounding cards */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Grid layout for larger screens */}
                    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 items-center">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {avantages.filter(a => a.position.startsWith('left')).map((avantage) => (
                                <div
                                    key={avantage.id}
                                    className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all hover:scale-105 flex gap-4"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={avantage.icon}
                                            alt={avantage.title}
                                            className="w-12 h-12"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold mb-2 text-primary">
                                            {avantage.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {avantage.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Center: Pizza Image with floating animation */}
                        <div className="flex items-center justify-center relative">
                            <div className="relative animate-float">
                                <img
                                    src={pizzaCenterImg}
                                    alt="Pizza Dolce"
                                    className="w-full max-w-md drop-shadow-2xl"
                                />
                                {/* Falling ingredients effect - simplified */}
                                <div className="absolute -top-8 left-1/4 w-8 h-8 bg-red-500 rounded-full opacity-70 animate-bounce"></div>
                                <div className="absolute -top-12 right-1/3 w-6 h-6 bg-green-500 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {avantages.filter(a => a.position.startsWith('right')).map((avantage) => (
                                <div
                                    key={avantage.id}
                                    className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all hover:scale-105 flex gap-4"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={avantage.icon}
                                            alt={avantage.title}
                                            className="w-12 h-12"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold mb-2 text-primary">
                                            {avantage.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {avantage.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stack layout for mobile/tablet */}
                    <div className="lg:hidden space-y-8">
                        {/* Pizza image first on mobile */}
                        <div className="flex items-center justify-center">
                            <img
                                src={pizzaCenterImg}
                                alt="Pizza Dolce"
                                className="w-full max-w-sm drop-shadow-2xl"
                            />
                        </div>

                        {/* All avantages stacked */}
                        {avantages.map((avantage) => (
                            <div
                                key={avantage.id}
                                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow flex gap-4"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={avantage.icon}
                                        alt={avantage.title}
                                        className="w-12 h-12"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold mb-2 text-primary">
                                        {avantage.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {avantage.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add custom animations in global CSS */}
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </section>
    )
}
