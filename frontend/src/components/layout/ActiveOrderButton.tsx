import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrderHistoryStore } from '../../store/useOrderHistoryStore';

export default function ActiveOrderButton() {
  const { orders } = useOrderHistoryStore();
  const location = useLocation();

  // Vérifier s'il y a une commande active (non livrée, non annulée)
  // On regarde la dernière commande en date
  const lastOrder = orders.length > 0 ? orders[0] : null;

  const isActive = lastOrder &&
    !['livree', 'annulee'].includes(lastOrder.status.toLowerCase());

  // Debug logs
  React.useEffect(() => {
    console.log('ActiveOrderButton - Orders:', orders);
    console.log('ActiveOrderButton - LastOrder:', lastOrder);
    console.log('ActiveOrderButton - IsActive:', isActive);
  }, [orders, lastOrder, isActive]);

  // Ne pas afficher si on est déjà sur la page de suivi ou dans l'admin
  if (!isActive || location.pathname === '/suivi-commande' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <Link
        to={`/suivi-commande/${lastOrder?.id}`}
        className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors border-2 border-white"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-bold">Suivre ma commande</span>
      </Link>
    </div>
  );
}