import React from 'react';
import { Check, Clock, ChefHat, Truck, Package } from 'lucide-react';

interface OrderTimelineProps {
    status: string;
    mode: 'livraison' | 'emporter';
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, mode }) => {
    const steps = [
        { id: 'en_attente', label: 'Commande reçue', icon: Clock },
        { id: 'en_preparation', label: 'En préparation', icon: ChefHat },
        ...(mode === 'livraison' ? [{ id: 'en_livraison', label: 'En livraison', icon: Truck }] : []),
        { id: 'livree', label: mode === 'livraison' ? 'Livrée' : 'Prête / Récupérée', icon: mode === 'livraison' ? Package : Check }
    ];

    const getStepStatus = (stepId: string) => {
        if (status === 'annulee') return 'cancelled';

        const statusOrder = ['en_attente', 'en_preparation', 'en_livraison', 'livree'];
        // Filter out 'en_livraison' if mode is emporter
        const currentFlow = mode === 'livraison'
            ? statusOrder
            : statusOrder.filter(s => s !== 'en_livraison');

        const currentIndex = currentFlow.indexOf(status);
        const stepIndex = currentFlow.indexOf(stepId);

        if (currentIndex >= stepIndex) return 'completed';
        if (currentIndex === stepIndex - 1) return 'next'; // Optional: for pulsing next step
        return 'pending';
    };

    if (status === 'annulee') {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-medium">
                Cette commande a été annulée.
            </div>
        );
    }

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
                    style={{
                        width: `${(steps.findIndex(s => getStepStatus(s.id) === 'completed') / (steps.length - 1)) * 100}%`
                    }}
                ></div>

                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.id);
                    const isCompleted = stepStatus === 'completed';
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                            >
                                <Icon size={20} />
                            </div>
                            <span
                                className={`mt-2 text-xs sm:text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
