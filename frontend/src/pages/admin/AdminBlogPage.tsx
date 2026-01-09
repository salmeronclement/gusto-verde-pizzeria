import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Upload, Loader2, X, Calendar, Edit, XCircle } from 'lucide-react';
import { getAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../services/api';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = async () => {
        try {
            const data = await getAdminBlogPosts();
            setPosts(data);
        } catch (err) {
            setError('Impossible de charger les articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // ... (keep handleFileChange, clearFile, etc.) -> Restoring logic

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setExistingImageUrl(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setFormData({ title: '', content: '' });
        clearFile();
        setExistingImageUrl(null);
        setEditingId(null);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingId(post.id);
        setFormData({ title: post.title, content: post.content });
        clearFile();
        setExistingImageUrl(post.image_url || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            setError('Titre et contenu requis');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = new FormData();
            if (selectedFile) {
                data.append('image', selectedFile);
            }
            data.append('title', formData.title);
            data.append('content', formData.content);

            if (editingId) {
                // Si on a l'URL de l'image existante et pas de nouveau fichier, on peut (optionnel) 
                // le dire au back, ou le back gère. Ici on supposera que le back gère.
                await updateBlogPost(editingId, data);
            } else {
                await createBlogPost(data);
            }

            resetForm();
            fetchPosts();

        } catch (err: any) {
            setError(err.message || 'Impossible de sauvegarder l\'article');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePost = async (id: number) => {
        if (!confirm('Supprimer cet article ?')) return;

        try {
            await deleteBlogPost(id);
            if (editingId === id) resetForm();
            fetchPosts();
        } catch (err) {
            setError('Impossible de supprimer l\'article');
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const displayImageUrl = previewUrl || existingImageUrl;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold text-forest">Blog</h1>
                <p className="text-gray-600 mt-1">Gérez vos articles de blog</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Add/Edit Article Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${editingId ? 'bg-blue-100' : 'bg-primary/10'}`}>
                            {editingId ? <Edit className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-forest">
                                {editingId ? 'Modifier l\'article' : 'Nouvel Article'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editingId ? 'Mettez à jour les informations' : 'Créez un nouvel article pour le blog'}
                            </p>
                        </div>
                    </div>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <XCircle size={18} />
                            Annuler
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-forest mb-2">Titre *</label>
                        <input
                            type="text"
                            placeholder="Titre de l'article"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-forest mb-2">Contenu *</label>
                        <textarea
                            placeholder="Contenu de l'article..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white resize-none"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-forest mb-2">
                            Image de couverture {editingId && existingImageUrl && !selectedFile && '(actuelle)'}
                        </label>
                        {displayImageUrl ? (
                            <div className="relative">
                                <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-primary bg-gray-100">
                                    <img
                                        src={displayImageUrl}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearFile();
                                        setExistingImageUrl(null);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                                {existingImageUrl && !selectedFile && (
                                    <p className="text-xs text-gray-500 mt-2">Cliquez pour changer l'image</p>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-accent/30 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload className="w-8 h-8 text-accent mb-2" />
                                <span className="text-sm text-gray-600">Choisir une image</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (optionnel)</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                        {/* Hidden file input for changing existing image */}
                        {displayImageUrl && (
                            <label className="mt-2 inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                                <Upload size={14} />
                                Changer l'image
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !formData.title || !formData.content}
                        className={`flex items-center gap-2 font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${editingId
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-primary hover:bg-accent text-white'
                            }`}
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : editingId ? (
                            <Edit size={18} />
                        ) : (
                            <Plus size={18} />
                        )}
                        {editingId ? 'Mettre à jour l\'article' : 'Publier l\'article'}
                    </button>
                </form>
            </div>

            {/* Articles List */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6">
                <h2 className="text-lg font-bold text-forest mb-6">Articles publiés ({posts.length})</h2>

                {posts.length === 0 ? (
                    <div className="text-center py-8 bg-cream/50 rounded-xl border-2 border-dashed border-accent/30">
                        <FileText className="w-12 h-12 mx-auto text-accent mb-3" />
                        <p className="text-gray-500">Aucun article publié</p>
                        <p className="text-sm text-gray-400 mt-1">Créez votre premier article ci-dessus</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${editingId === post.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-cream/30 border-accent/10 hover:border-accent/30'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-accent">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-forest truncate">{post.title}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {formatDate(post.created_at)}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
