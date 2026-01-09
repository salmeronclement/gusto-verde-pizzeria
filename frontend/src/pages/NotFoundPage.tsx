import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-6xl font-display font-bold text-forest mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Oups ! Cette page n'existe pas (ou plus).</p>
            <Link
                to="/"
                className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
            >
                <Home size={20} />
                Retour à l'accueil
            </Link>
        </div>
    );
}
