import React from 'react';
import { X, Phone, Clock } from 'lucide-react';

interface ShopClosedModalProps {
    onClose: () => void;
}

export default function ShopClosedModal({ onClose }: ShopClosedModalProps) {
    // Hardcoded phone for now, ideally fetched from settings too
    const phoneNumber = "01 23 45 67 89";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Le service en ligne est fermé
                    </h2>

                    <p className="text-gray-600">
                        Les commandes en ligne sont momentanément indisponibles.
                        Vous pouvez toujours consulter notre carte !
                    </p>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <p className="text-sm text-orange-800 font-medium mb-2">
                            Pour commander, appelez-nous :
                        </p>
                        <a
                            href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                            className="flex items-center justify-center gap-2 text-xl font-bold text-primary hover:text-secondary transition-colors"
                        >
                            <Phone size={24} />
                            {phoneNumber}
                        </a>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        J'ai compris
                    </button>
                </div>
            </div>
        </div>
    );
}
