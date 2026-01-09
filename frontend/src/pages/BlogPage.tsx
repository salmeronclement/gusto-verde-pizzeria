import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, ArrowRight, Loader2, BookOpen } from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://51.68.229.173/api';

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${API_BASE}/blog`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
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

    return (
        <div className="min-h-screen bg-cream">
            {/* Page Header */}
            <div className="bg-forest py-16">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">NOTRE BLOG</h1>
                    <div className="flex justify-center gap-2 text-sm text-cream/60">
                        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Blog</span>
                    </div>
                </div>
            </div>

            <section className="py-20">
                <div className="container-custom">
                    {posts.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-12 h-12 text-accent" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-forest mb-4">
                                Le chef prépare de nouveaux articles pour vous...
                            </h2>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Notre blog est en cours de préparation. Revenez bientôt pour découvrir nos recettes,
                                conseils et actualités de Gusto Verde !
                            </p>
                            <Link
                                to="/nos-pizzas"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-8 py-4 rounded-full transition-colors mt-8"
                            >
                                Découvrir notre carte
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        /* Blog Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-accent/10 group"
                                >
                                    {/* Image */}
                                    <div className="relative h-64 bg-cream overflow-hidden">
                                        {post.image_url ? (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-accent">
                                                <BookOpen size={48} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <User size={14} className="text-primary" />
                                                <span>Gusto Verde</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-primary" />
                                                <span>{formatDate(post.created_at)}</span>
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-display font-bold text-forest mb-4 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-600 mb-6 line-clamp-3 whitespace-pre-wrap">
                                            {post.content}
                                        </p>

                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-full transition-colors text-sm"
                                        >
                                            Lire l'article
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
