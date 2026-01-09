import React, { useEffect, useState } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, getImageUrl } from '../../services/api'; import { Plus, Edit2, Trash2, X, Image as ImageIcon, Loader, Star } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/products';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'pizzas_rouge',
        image: null as File | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const categories = [
        { id: 'pizzas_rouge', label: 'Pizzas Base Tomate' },
        { id: 'pizzas_blanche', label: 'Pizzas Base Crème' },
        { id: 'boissons', label: 'Boissons' },
        { id: 'desserts', label: 'Desserts' }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '', // Fallback si null
                price: product.price.toString(),
                category: product.category,
                image: null
            });
            setPreviewUrl(getImageUrl(product.imageUrl));
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'pizzas_rouge',
                image: null
            });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingProduct) {
                // Keep existing image URL if no new image uploaded
                if (!formData.image && editingProduct.imageUrl) {
                    data.append('image_url', editingProduct.imageUrl);
                }
                // On convertit l'ID en string/number selon ce que l'API attend
                await updateProduct(editingProduct.id, data);
            } else {
                await createProduct(data);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleFeatured = async (product: any) => {
        try {
            await updateProduct(product.id, { is_featured: !product.is_featured } as any);
            fetchProducts();
        } catch (error) {
            console.error('Error updating featured status:', error);
            alert("Erreur lors de la mise à jour de l'offre du moment");
        }
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await deleteProduct(String(id));
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-gray-900">Gestion de la Carte</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors"
                >
                    <Plus size={20} />
                    Nouveau Produit
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">Image</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">Nom</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">Catégorie</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-500">Prix</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {product.imageUrl ? (
                                        <img
                                            src={getImageUrl(product.imageUrl) || ''}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {product.name}
                                    {/* On cast en any car ces propriétés ne sont pas dans l'interface de base Product */}
                                    {!!(product as any).is_loyalty_eligible && (
                                        <span className="ml-2 text-orange-500" title="Éligible fidélité">
                                            🎁
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 capitalize">{product.category.replace('_', ' ')}</td>
                                <td className="px-6 py-4 font-bold text-primary">{formatPrice(product.price)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleToggleFeatured(product)}
                                            className={`p-2 rounded-lg transition-colors ${(product as any).is_featured
                                                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                                : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'
                                                }`}
                                            title={(product as any).is_featured ? "Retirer de l'offre du moment" : "Définir comme offre du moment"}
                                        >
                                            <Star size={18} fill={(product as any).is_featured ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex gap-6">
                                <div className="w-1/3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                                    <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                                <span className="text-xs text-gray-500">Cliquez pour ajouter</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="w-2/3 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Prix (€)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-xl focus:ring-primary focus:border-primary"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-xl focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader size={16} className="animate-spin" />}
                                    {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}