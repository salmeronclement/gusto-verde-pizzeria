import PizzaItem from './PizzaItem'

interface Pizza {
    name: string
    price: string
    description?: string
}

interface MenuBoardProps {
    title: string
    image: string
    imageAlt: string
    pizzas: Pizza[]
    id?: string
}

export default function MenuBoard({ title, image, imageAlt, pizzas, id }: MenuBoardProps) {
    return (
        <div id={id} className="mb-16 scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Image Column */}
                <div className="order-2 lg:order-1">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={image}
                            alt={imageAlt}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                {/* Menu List Column */}
                <div className="order-1 lg:order-2">
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-6 text-dark">
                        {title}
                    </h3>

                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {pizzas.map((pizza, index) => (
                            <PizzaItem
                                key={index}
                                name={pizza.name}
                                price={pizza.price}
                                description={pizza.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
