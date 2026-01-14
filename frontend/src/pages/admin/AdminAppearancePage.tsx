import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image, Upload, Loader2, X } from 'lucide-react';

interface HeroSlide {
    id: number;
    image_url: string;
    title: string;
    subtitle: string;
    display_order: number;
}

export default function AdminAppearancePage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [newSlide, setNewSlide] = useState({
        title: '',
        subtitle: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://51.68.229.173:5005/api';

    const getAuthToken = () => {
        const stored = localStorage.getItem('admin-storage');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.state?.token || '';
            } catch (e) {
                console.error('Error parsing admin storage', e);
            }
        }
        return '';
    };

    // Fetch slides
    const fetchSlides = async () => {
        try {
            const response = await fetch(`${API_BASE}/content/admin/hero-slides`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSlides(data);
            } else {
                throw new Error('Erreur lors du chargement');
            }
        } catch (err) {
            setError('Impossible de charger les slides');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // Clear selected file
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

    // Add new slide with file upload
    const handleAddSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Veuillez sélectionner une image');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('title', newSlide.title);
            formData.append('subtitle', newSlide.subtitle);
            formData.append('display_order', String(slides.length));

            const response = await fetch(`${API_BASE}/content/admin/hero-slides`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            });

            if (response.ok) {
                setNewSlide({ title: '', subtitle: '' });
                clearFile();
                fetchSlides();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'ajout');
            }
        } catch (err: any) {
            setError(err.message || 'Impossible d\'ajouter la slide');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Delete slide
    const handleDeleteSlide = async (id: number) => {
        if (!confirm('Supprimer cette slide ?')) return;

        try {
            const response = await fetch(`${API_BASE}/content/admin/hero-slides/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                fetchSlides();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (err) {
            setError('Impossible de supprimer la slide');
            console.error(err);
        }
    };

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
                <h1 className="text-2xl font-display font-bold text-forest">Apparence</h1>
                <p className="text-gray-600 mt-1">Gérez le contenu visuel de votre site</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Hero Slides Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Image className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-forest">Bannière d'Accueil</h2>
                        <p className="text-sm text-gray-500">Les images qui défilent sur la page d'accueil</p>
                    </div>
                </div>

                {/* Current Slides */}
                <div className="space-y-3 mb-6">
                    {slides.length === 0 ? (
                        <div className="text-center py-8 bg-cream/50 rounded-xl border-2 border-dashed border-accent/30">
                            <Image className="w-12 h-12 mx-auto text-accent mb-3" />
                            <p className="text-gray-500">Aucune slide configurée</p>
                            <p className="text-sm text-gray-400 mt-1">Un placeholder neutre sera affiché sur le site</p>
                        </div>
                    ) : (
                        slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className="flex items-center gap-4 p-4 bg-cream/30 rounded-xl border border-accent/10 hover:border-accent/30 transition-colors"
                            >
                                {/* Thumbnail - 16:9 ratio like banner */}
                                <div className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img
                                        src={slide.image_url}
                                        alt={slide.title || 'Slide'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" fill="%23ddd"><rect width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12">Image</text></svg>';
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-forest truncate">
                                        {slide.title || 'Sans titre'}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {slide.subtitle || 'Pas de sous-titre'}
                                    </p>
                                </div>

                                {/* Order badge */}
                                <div className="flex-shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-sm font-bold text-forest">
                                    {index + 1}
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Slide Form */}
                <form onSubmit={handleAddSlide} className="border-t border-accent/20 pt-6">
                    <h3 className="font-medium text-forest mb-4">Ajouter une slide</h3>

                    {/* File Upload Area - Fixed height like real banner */}
                    <div className="mb-4">
                        {previewUrl ? (
                            <div className="relative">
                                <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-primary bg-gray-100">
                                    <img
                                        src={previewUrl}
                                        alt="Aperçu"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                                <p className="text-xs text-gray-500 mt-2">⚠️ Aperçu réel : l'image sera cadrée exactement comme ci-dessus sur le site.</p>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video max-w-md border-2 border-dashed border-accent/30 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                <Upload className="w-10 h-10 text-accent mb-3" />
                                <span className="text-sm text-gray-600 font-medium">Cliquez pour choisir une image</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (max 10MB)</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                        <p className="text-xs text-accent mt-3">💡 Conseil : Utilisez des images horizontales (1920×1080) pour éviter que le contenu ne soit coupé.</p>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Titre (optionnel)"
                            value={newSlide.title}
                            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                            className="px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                        />
                        <input
                            type="text"
                            placeholder="Sous-titre (optionnel)"
                            value={newSlide.subtitle}
                            onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                            className="px-4 py-3 border border-accent/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !selectedFile}
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Plus size={18} />
                        )}
                        Ajouter la slide
                    </button>
                </form>
            </div>

            {/* Info Box */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <h4 className="font-medium text-forest mb-2">💡 Conseil</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>0 slides</strong> : Un fond neutre texturé sera affiché</li>
                    <li>• <strong>1 slide</strong> : L'image sera affichée en fixe</li>
                    <li>• <strong>2+ slides</strong> : Les images défileront automatiquement</li>
                </ul>
            </div>
        </div>
    );
}
