import productsData from '../data/products.json';
import { Product } from '../types';

export const getProducts = (): Product[] => {
    // On force le type avec 'unknown' puis 'Product[]' pour éviter les conflits string/number
    return productsData.products as unknown as Product[];
};

export const getProductsByCategory = (categoryId: string): Product[] => {
    return productsData.products.filter(p => p.category === categoryId) as unknown as Product[];
};

export const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return '0.00 €';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2).replace('.', ',') + ' €';
};