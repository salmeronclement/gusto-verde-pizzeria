import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Loader2, BookOpen } from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

export default function BlogPostDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://51.68.229.173/api';

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${API_BASE}/blog/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPost(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-cream">
                <div className="bg-forest py-16">
                    <div className="container-custom text-center">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">Article non trouvé</h2>
                    </div>
                </div>
                <div className="container-custom py-16 text-center">
                    <BookOpen className="w-16 h-16 text-accent mx-auto mb-6" />
                    <p className="text-gray-600 mb-8">Cet article n'existe pas ou a été supprimé.</p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-full transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Retour au blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Hero Image Banner */}
            {post.image_url && (
                <div className="relative h-80 md:h-96 w-full overflow-hidden">
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                </div>
            )}

            {/* Header without image */}
            {!post.image_url && (
                <div className="bg-forest py-16">
                    <div className="container-custom text-center">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{post.title}</h2>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="container-custom py-12">
                {/* Back button */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium mb-8 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Retour au blog
                </Link>

                <article className="bg-white rounded-2xl shadow-sm border border-accent/10 p-8 md:p-12">
                    {/* Title (if has image, show here) */}
                    {post.image_url && (
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-forest mb-6">
                            {post.title}
                        </h1>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-accent/20">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-primary" />
                            <span>Gusto Verde</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            <span>{formatDate(post.created_at)}</span>
                        </div>
                    </div>

                    {/* Content with preserved line breaks */}
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                            {post.content}
                        </p>
                    </div>
                </article>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Envie de découvrir nos saveurs ?</p>
                    <Link
                        to="/nos-pizzas"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-8 py-4 rounded-full transition-colors"
                    >
                        Voir notre carte
                    </Link>
                </div>
            </div>
        </div>
    );
}
