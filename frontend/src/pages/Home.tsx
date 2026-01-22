import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, Phone } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">

      {/* SECTION HERO (Bannière) */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Image de fond fixe (Unsplash) */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80"
            alt="Pizza background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-bold mb-6 animate-fade-in">
            NOUVEAU CONCEPT À MARSEILLE
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            La Révolution <span className="text-primary">Verde</span><br />
            dans votre Assiette
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Des ingrédients frais, une pâte artisanale et une passion dévorante pour la vraie pizza italienne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/nos-pizzas"
              className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              Commander maintenant <ArrowRight size={20} />
            </Link>
            <Link
              to="/notre-carte"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center"
            >
              Voir le menu
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION INFOS */}
      <section className="py-8 md:py-12 bg-white relative z-20 -mt-10 mx-4 md:mx-auto md:max-w-6xl rounded-2xl shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex flex-col items-center text-center pt-4 md:pt-0">
            <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
              <Clock size={28} />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-dark mb-2">Ouvert 7j/7</h3>
            <p className="text-gray-500 text-sm md:text-base">11h30 - 14h30 <br /> 18h30 - 22h30</p>
          </div>
          <div className="flex flex-col items-center text-center pt-8 md:pt-0">
            <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
              <MapPin size={28} />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-dark mb-2">Marseille 6ème</h3>
            <p className="text-gray-500 text-sm md:text-base">24 Bd Notre Dame<br />13006 Marseille</p>
          </div>
          <div className="flex flex-col items-center text-center pt-8 md:pt-0">
            <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
              <Phone size={28} />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-dark mb-2">Livraison & Emporter</h3>
            <p className="text-gray-500 font-bold text-base md:text-lg">04 91 555 444</p>
          </div>
        </div>
      </section>

      {/* SECTION AVANTAGES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-dark mb-4">Pourquoi Gusto Verde ?</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: "Produits Frais", desc: "Arrivages quotidiens du marché et d'Italie.", img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=500&q=60" },
              { title: "Pâte Artisanale", desc: "Maturation 72h pour une légèreté incomparable.", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60" },
              { title: "Cuisson Feu de Bois", desc: "Le goût authentique de la tradition napolitaine.", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60" }
            ].map((item, idx) => (
              <div key={idx} className={`group relative overflow-hidden rounded-2xl h-80 shadow-lg cursor-pointer ${idx === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;