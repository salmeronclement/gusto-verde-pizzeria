// Import real SVG icons
import restaurantIcon from '../../assets/images/restaurant-menu-svgrepo-com.svg'
import fireIcon from '../../assets/images/fire-wood-svgrepo-com.svg'
import deliveryIcon from '../../assets/images/scooter-delivery-food-svgrepo-com.svg'
import customerServiceIcon from '../../assets/images/customer-service-headphones-svgrepo-com.svg'

export default function FeatureBand() {
    const features = [
        {
            id: 1,
            title: 'Recettes Authentiques',
            description: 'Des recettes traditionnelles transmises de génération en génération',
            icon: restaurantIcon,
        },
        {
            id: 2,
            title: 'Cuisson Feu de Bois',
            description: 'Pizza cuite au four traditionnel pour une saveur inégalée',
            icon: fireIcon,
        },
        {
            id: 3,
            title: 'Livraison Gratuite',
            description: 'Livraison rapide et gratuite 7j/7 à Marseille',
            icon: deliveryIcon,
        },
        {
            id: 4,
            title: 'Service Client',
            description: 'Une équipe à votre écoute pour vous servir avec le sourire',
            icon: customerServiceIcon,
        },
    ]

    return (
        <section className="py-12 bg-gray-100">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="flex flex-col items-center text-center p-6 bg-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                            {/* Icon */}
                            <div className="mb-4">
                                <img
                                    src={feature.icon}
                                    alt={feature.title}
                                    className="w-16 h-16 text-primary"
                                />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-display font-bold mb-2 text-dark">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
