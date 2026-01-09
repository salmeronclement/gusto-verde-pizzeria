import { Link } from 'react-router-dom'

// Import category images
import sauceImg from '../../assets/images/sauce-tomate-accueil-categorie-v2.png'
import cremeImg from '../../assets/images/cremeaccueil-categorie.png'
import gourmetImg from '../../assets/images/gourmet-categorie-1.png'
import viandeImg from '../../assets/images/categorie-viande-accueil.png'
import chaussonImg from '../../assets/images/calzone-categorie-accueil-V7.png'

const categories = [
    {
        id: 1,
        name: 'Base Sauce',
        image: sauceImg,
        link: '/nos-pizzas#sauce',
    },
    {
        id: 2,
        name: 'Base Crème',
        image: cremeImg,
        link: '/nos-pizzas#creme',
    },
    {
        id: 3,
        name: 'Gourmets',
        image: gourmetImg,
        link: '/nos-pizzas#gourmet',
    },
    {
        id: 4,
        name: 'Avec viande',
        image: viandeImg,
        link: '/nos-pizzas#viande',
    },
    {
        id: 5,
        name: 'Chaussons',
        image: chaussonImg,
        link: '/nos-pizzas#chausson',
    },
]

export default function CategoryCarousel() {
    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                {/* Title */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Choisissez votre catégorie
                    </h2>
                </div>

                {/* Categories Grid (responsive carousel effect) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={category.link}
                            className="group flex flex-col items-center"
                        >
                            {/* Image Container with Fire Icon */}
                            <div className="relative mb-4 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
                                {/* Image */}
                                <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                                    />
                                </div>

                                {/* Fire Icon Overlay */}
                                <div className="absolute top-2 right-2 bg-primary text-white p-2 rounded-full shadow-md">
                                    <svg
                                        className="w-5 h-5 md:w-6 md:h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Category Name */}
                            <h3 className="text-lg md:text-xl font-display font-semibold text-dark group-hover:text-primary transition-colors text-center">
                                {category.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
