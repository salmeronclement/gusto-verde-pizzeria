import { useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useState } from 'react';

export default function AnnouncementBanner() {
    const { settings, fetchPublicSettings } = useSettingsStore();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Charger les paramètres si pas encore chargés
        if (!settings) {
            fetchPublicSettings();
        }
    }, [settings, fetchPublicSettings]);

    const message = settings?.announcement_message;

    // Ne rien afficher si pas de message ou si le message est vide
    if (!message || message.trim() === '' || dismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-3 shadow-md relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm sm:text-base font-medium">
                <Megaphone size={20} className="text-white/80 flex-shrink-0" />
                <span className="text-center">{message}</span>
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Fermer l'annonce"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
