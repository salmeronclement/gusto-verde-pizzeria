import React from 'react';
import { useServiceStore } from '../../store/useServiceStore';
import { Info } from 'lucide-react';

export default function ServiceStatusBanner() {
    const { serviceStatus } = useServiceStore();
    const isOpen = serviceStatus === 'open';

    if (isOpen) {
        return null;
    }

    return (
        <div className="bg-blue-600 text-white px-4 py-3 shadow-md relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm sm:text-base font-medium">
                <Info size={20} className="text-blue-200" />
                <span>
                    Pizzeria fermée - <strong>Mode Pré-commande activé</strong>. Votre commande sera traitée à l'ouverture du service.
                </span>
            </div>
        </div>
    );
}
