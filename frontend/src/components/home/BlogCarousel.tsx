import { Link } from 'react-router-dom'
import blogImg1 from '../../assets/images/Dolce-pizza-presentation-blog-391x240.jpg'
import blogImg2 from '../../assets/images/Histoire-pizza-blog-dolce-pizza-391x240.jpg'
import blogImg3 from '../../assets/images/pizzaiolo-blog-dolce-pizza-marseille-391x240.jpg'

const articles = [
    {
        id: 1,
        title: 'La tradition de la pizza artisanale',
        image: blogImg1,
        date: '15 Nov 2024',
        excerpt: 'Découvrez les secrets de notre pâte artisanale pétrie à la main chaque jour.',
        link: '/blog/tradition-pizza-artisanale',
    },
    {
        id: 2,
        title: 'L\'histoire de la pizza napolitaine',
        image: blogImg2,
        date: '10 Nov 2024',
        excerpt: 'Un voyage dans le temps pour découvrir les origines de la pizza napolitaine.',
        link: '/blog/histoire-pizza-napolitaine',
    },
    {
        id: 3,
        title: 'Le métier de pizzaïolo',
        image: blogImg3,
        date: '5 Nov 2024',
        excerpt: 'Portrait de nos pizzaïolos passionnés qui mettent tout leur cœur à l\'ouvrage.',
        link: '/blog/metier-pizzaiolo',
    },
    {
        id: 4,
        title: 'Nos ingrédients de qualité',
        image: blogImg1, // Placeholder - image missing
        date: '1 Nov 2024',
        excerpt: 'Comment nous sélectionnons les meilleurs ingrédients pour vos pizzas.',
        link: '/blog/ingredients-qualite',
    },
]

export default function BlogCarousel() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container-custom">
                {/* Title */}
                <div className="text-center mb-12">
                    <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                        Notre blog
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-4">
                        Découvrez notre actualité
                    </h2>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            to={article.link}
                            className="group bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Date */}
                                <p className="text-sm text-gray-500 mb-2">{article.date}</p>

                                {/* Title */}
                                <h3 className="text-lg font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {article.excerpt}
                                </p>

                                {/* Read More Link */}
                                <span className="text-primary font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Voir plus
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/blog"
                        className="inline-block bg-primary hover:bg-secondary text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        Voir tous les articles
                    </Link>
                </div>
            </div>
        </section>
    )
}
