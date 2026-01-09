import { Product } from '../types'
import { useCartStore } from '../store/useCartStore'
import { formatPrice } from '../utils/products'
import { Plus, Minus } from 'lucide-react'

interface ProductCardProps {
    product: Product
    onAdd?: (product: Product) => void
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCartStore()

    // On cherche l'item dans le panier (en ignorant les items gratuits/récompenses)
    const cartItem = items.find(item => 
        String(item.productId) === String(product.id) && 
        !item.isFree && 
        !item.isReward
    )
    const quantity = cartItem ? cartItem.quantity : 0

    const handleAddToCart = () => {
        if (onAdd) {
            onAdd(product)
        } else {
            addItem({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                unitPrice: product.price,
                category: product.category,
                description: product.description,
                image: product.imageUrl, // ou product.image selon ta structure
                quantity: 1,
                subtotal: product.price,
                isFree: false,
                isReward: false,
                isPromoEligible: product.is_promo_eligible
            } as any) // "as any" pour passer la validation stricte
        }
    }

    const handleIncrement = () => {
        if (cartItem) {
            // false, false pour isFree et isReward
            updateQuantity(product.id, quantity + 1, false, false)
        } else {
            handleAddToCart()
        }
    }

    const handleDecrement = () => {
        if (cartItem) {
            if (quantity > 1) {
                updateQuantity(product.id, quantity - 1, false, false)
            } else {
                removeItem(product.id, false, false)
            }
        }
    }

    return (
        <div className="bg-white/95 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-accent/10">
            {/* Image */}
            {product.imageUrl && (
                <div className="aspect-[4/3] overflow-hidden relative rounded-t-2xl">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src = '/images/placeholder-pizza.jpg'
                        }}
                    />
                    {quantity > 0 && (
                        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                            {quantity} dans le panier
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-xl font-display font-bold text-forest mb-2">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-accent/20">
                    <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                    </span>

                    {quantity > 0 ? (
                        <div className="flex items-center bg-cream rounded-full p-1">
                            <button
                                onClick={handleDecrement}
                                className="p-2 rounded-full bg-white text-forest hover:bg-accent/20 transition-colors shadow-sm"
                                aria-label="Diminuer la quantité"
                            >
                                <Minus size={16} strokeWidth={3} />
                            </button>
                            <span className="font-bold text-forest w-8 text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="p-2 rounded-full bg-primary text-white hover:bg-accent transition-colors shadow-sm"
                                aria-label="Augmenter la quantité"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="bg-primary hover:bg-accent text-white font-bold py-2.5 px-5 rounded-full transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Ajouter
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}