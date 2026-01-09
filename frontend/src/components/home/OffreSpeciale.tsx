export default function OffreSpeciale() {
    return (
        <section className="py-6 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
            <div className="container-custom">
                <div className="flex items-center justify-center gap-6 text-white">
                    {/* Pizza Icon Left */}
                    <div className="hidden md:block">
                        <svg className="w-16 h-16 opacity-80 animate-bounce" viewBox="0 0 64 64" fill="currentColor">
                            <path d="M32 4 L60 32 L32 60 L4 32 Z" opacity="0.3" />
                            <circle cx="20" cy="25" r="3" fill="white" />
                            <circle cx="44" cy="25" r="3" fill="white" />
                            <circle cx="32" cy="35" r="3" fill="white" />
                            <circle cx="25" cy="40" r="2" fill="white" />
                            <circle cx="39" cy="40" r="2" fill="white" />
                        </svg>
                    </div>

                    {/* Text Content */}
                    <div className="text-center">
                        <h3 className="text-2xl md:text-4xl font-display font-bold mb-2">
                            Offre Spéciale
                        </h3>
                        <p className="text-xl md:text-3xl font-bold">
                            3 pizzas achetées = La 4<sup>e</sup> OFFERTE !
                        </p>
                    </div>

                    {/* Pizza Icon Right */}
                    <div className="hidden md:block">
                        <svg className="w-16 h-16 opacity-80 animate-bounce" viewBox="0 0 64 64" fill="currentColor" style={{ animationDelay: '0.3s' }}>
                            <path d="M32 4 L60 32 L32 60 L4 32 Z" opacity="0.3" />
                            <circle cx="20" cy="25" r="3" fill="white" />
                            <circle cx="44" cy="25" r="3" fill="white" />
                            <circle cx="32" cy="35" r="3" fill="white" />
                            <circle cx="25" cy="40" r="2" fill="white" />
                            <circle cx="39" cy="40" r="2" fill="white" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    )
}
