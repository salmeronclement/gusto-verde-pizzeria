interface PizzaItemProps {
    name: string
    price: string
    description?: string
}

export default function PizzaItem({ name, price, description }: PizzaItemProps) {
    return (
        <div className="py-3 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-dark text-base">{name}</h4>
                <span className="font-bold text-primary text-base ml-4 flex-shrink-0">{price}</span>
            </div>
            {description && (
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            )}
        </div>
    )
}
