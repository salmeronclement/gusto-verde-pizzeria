import React from 'react';
import { Link } from 'react-router-dom';
import MenuBoard from '../components/menu/MenuBoard';

// Import pizza category images
import classiqueImg from '../assets/images/Pizza-classique-carte.jpg';
import sauceImg from '../assets/images/pizza-specialites-sauce-dolce-pizza.jpg';
import cremeImg from '../assets/images/Pizza-specialites-creme-carte.jpeg';
import gourmetImg from '../assets/images/Pizza-gourmets-carte-site-dolce.jpg';
import chaussonImg from '../assets/images/chaussons-carte-dolce.jpeg';

const PizzasPage: React.FC = () => {
    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(categoryId);
        if (element) {
            // Offset for sticky header
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const categories = [
        { id: 'classiques', name: 'Nos Classiques' },
        { id: 'sauce', name: 'Base Sauce' },
        { id: 'creme', name: 'Base Crème' },
        { id: 'gourmet', name: 'Nos Gourmets' },
        { id: 'chausson', name: 'Nos Chaussons' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-primary transition-colors">Accueil</a>
                        <span>/</span>
                        <span className="text-dark font-semibold uppercase">NOTRE CARTE</span>
                    </nav>
                </div>
            </div>

            <div className="pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
                            Découvrez notre carte
                        </h1>
                        <p className="text-lg text-gray-600">
                            Des ingrédients choisis avec soin, une pâte artisanale
                        </p>
                        <p className="text-sm text-primary mt-3 font-medium">
                            ∞ Nos pizzas sont convertibles en calzone ou chausson !
                        </p>

                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
                            <a
                                href="tel:0491555444"
                                className="flex items-center gap-3 bg-primary hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                04 91 555 444
                            </a>
                            <Link
                                to="/nos-pizzas"
                                className="flex items-center gap-3 bg-dark hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Commander en ligne
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sticky Navigation */}
                <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 mb-12 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="flex gap-3 min-w-max md:justify-center px-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => scrollToCategory(cat.id)}
                                        className="px-5 py-2 rounded-full font-sans font-semibold text-sm md:text-base bg-white text-gray-700 hover:bg-primary hover:text-white hover:border-primary border border-gray-300 transition-all shadow-sm active:scale-95"
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    {/* Nos Classiques */}
                    <MenuBoard
                        id="classiques"
                        title="# Nos classiques"
                        image={classiqueImg}
                        imageAlt="Pizza classique"
                        pizzas={[
                            { name: 'Fromage', price: '10,00€', description: 'Base sauce tomate, fromage' },
                            { name: 'Anchois', price: '9,50€', description: 'Base sauce tomate, anchois, fromage' },
                            { name: 'Mozzarella', price: '11,00€', description: 'Base sauce tomate, mozzarella, fromage' },
                            { name: 'Fruits de mer', price: '12,50€', description: 'Base sauce tomate, fruits de mer, fromage' },
                            { name: 'Saveur Plus', price: '14,00€', description: 'Base sauce tomate, jambon, champignons, fromage' },
                            { name: 'Reine', price: '12,00€', description: 'Base sauce tomate, jambon, champignons, fromage' },
                            { name: 'Napolitaine', price: '11,00€', description: 'Base sauce tomate, anchois, câpres, olives, fromage' },
                            { name: 'Royale', price: '13,00€', description: 'Base sauce tomate, jambon, champignons, œuf, fromage' },
                            { name: 'Spéciale', price: '13,50€', description: 'Base sauce tomate, merguez, poivrons, oignons, fromage' },
                        ]}
                    />

                    {/* Nos Spécialités Base Sauce */}
                    <MenuBoard
                        id="sauce"
                        title="# Nos spécialités base sauce"
                        image={sauceImg}
                        imageAlt="Pizza spécialité sauce"
                        pizzas={[
                            { name: 'Parme', price: '14,00€', description: 'Base sauce tomate, jambon de Parme, roquette, parmesan, fromage' },
                            { name: 'Pissaladière', price: '12,50€', description: 'Base sauce tomate, oignons, anchois, olives noires, fromage' },
                            { name: 'Végétarienne', price: '12,00€', description: 'Base sauce tomate, légumes de saison, fromage' },
                            { name: '4 Fromages', price: '13,50€', description: 'Base sauce tomate, 4 fromages' },
                            { name: 'Orientale', price: '13,00€', description: 'Base sauce tomate, merguez, poivrons, oignons, fromage' },
                            { name: 'Calzone', price: '13,00€', description: 'Pizza fermée - jambon, champignons, œuf, fromage' },
                            { name: 'Diavola', price: '13,50€', description: 'Base sauce tomate, salami piquant, fromage' },
                            { name: 'Chorizo', price: '13,00€', description: 'Base sauce tomate, chorizo, poivrons, fromage' },
                        ]}
                    />

                    {/* Nos Spécialités Base Crème */}
                    <MenuBoard
                        id="creme"
                        title="# Nos spécialités base crème"
                        image={cremeImg}
                        imageAlt="Pizza spécialité crème"
                        pizzas={[
                            { name: 'Montagnarde', price: '14,00€', description: 'Base crème, lardons, oignons, reblochon, fromage' },
                            { name: 'Savoyarde', price: '13,50€', description: 'Base crème, lardons, pommes de terre, reblochon, fromage' },
                            { name: 'Campagnarde', price: '13,00€', description: 'Base crème, lardons, oignons, champignons, fromage' },
                            { name: 'Saumon', price: '15,00€', description: 'Base crème, saumon fumé, aneth, fromage' },
                            { name: 'Forestière', price: '13,50€', description: 'Base crème, champignons, lardons, fromage' },
                            { name: 'Tartiflette', price: '14,00€', description: 'Base crème, pommes de terre, lardons, reblochon, fromage' },
                        ]}
                    />

                    {/* Nos Gourmets */}
                    <MenuBoard
                        id="gourmet"
                        title="# Nos Gourmets"
                        image={gourmetImg}
                        imageAlt="Pizza gourmet"
                        pizzas={[
                            { name: 'Burrata Verde', price: '16,00€', description: 'Base pesto, burrata, roquette, tomates cerises, parmesan' },
                            { name: 'Truffe', price: '18,50€', description: 'Base crème, truffe noire, champignons, parmesan, fromage' },
                            { name: 'Oslo', price: '15,50€', description: 'Base crème, saumon fumé, aneth, citron, fromage' },
                            { name: 'Serenata', price: '16,00€', description: 'Base sauce tomate, burrata, tomates cerises, basilic frais, fromage' },
                        ]}
                    />

                    {/* Nos Chaussons */}
                    <MenuBoard
                        id="chausson"
                        title="# Nos chaussons"
                        image={chaussonImg}
                        imageAlt="Chausson"
                        pizzas={[
                            { name: 'Forestier', price: '12,50€', description: 'Champignons, lardons, crème, fromage' },
                            { name: 'San Marco', price: '12,50€', description: 'Jambon, champignons, fromage' },
                            { name: 'Vénitien', price: '12,50€', description: 'Thon, oignons, fromage' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default PizzasPage;
