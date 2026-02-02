import React, { useEffect, useState } from 'react';
import {
  getAdminOrders,
  updateOrderStatus,
  getAdminDrivers,
  assignDriverToOrder,
  getAdminSettings,
  AdminOrder,
  Driver,
  api // Ensure api is imported for the delete call
} from '../../services/api';
import { useServiceStore } from '../../store/useServiceStore';
import {
  RefreshCw,
  Clock,
  MapPin,
  Bike,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Gift,
  Trash2,
  Volume2
} from 'lucide-react';
import AdminOrderDetails from '../../components/admin/AdminOrderDetails';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Settings for alerts
  const [alertEnabled, setAlertEnabled] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const knownOrderIdsRef = React.useRef<Set<number>>(new Set());
  const isFirstLoadRef = React.useRef(true);

  // Initialize Audio & Settings
  useEffect(() => {
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audioRef.current.volume = 1.0;

    getAdminSettings().then(settings => {
      setAlertEnabled(settings.enable_new_order_alert === true || settings.enable_new_order_alert === 'true');
    }).catch(console.error);
  }, []);

  // Synchronisation avec le Store
  const { serviceStatus, fetchServiceStatus } = useServiceStore();
  const isOpen = serviceStatus === 'open';

  // Définition de fetchOrders
  const fetchOrders = async (silent = false) => {
    // Si le service est fermé, on ne charge pas les commandes "live"
    if (!isOpen) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setError(null);
    try {
      const [ordersData, driversData] = await Promise.all([
        getAdminOrders(),
        getAdminDrivers()
      ]);

      // New Order Detection Logic
      if (ordersData.length > 0) {
        const currentIds = new Set(ordersData.map((o: AdminOrder) => o.id)) as Set<number>;

        // If not first load, check for new IDs
        if (!isFirstLoadRef.current) {
          const newOrders = ordersData.filter((o: AdminOrder) => !knownOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            // Play Sound
            if (alertEnabled) {
              audioRef.current?.play().catch(e => console.warn("Audio blocked:", e));
              // Popup popus if single new order
              if (newOrders.length === 1) {
                setSelectedOrder(newOrders[0]);
              }
            }
          }
        }
        knownOrderIdsRef.current = currentIds;
        isFirstLoadRef.current = false;
      }

      setOrders(ordersData);
      setDrivers(driversData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      // On n'affiche l'erreur que si ce n'est pas un polling silencieux pour éviter de spammer
      if (!silent) setError('Impossible de charger les données.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 1. Chargement initial : Statut Service
  useEffect(() => {
    fetchServiceStatus();
  }, []);

  // 2. Réaction au changement de statut (isOpen) + Auto-Refresh 30s
  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      // Polling toutes les 30 sec pour actualisation auto sans spam
      const interval = setInterval(() => {
        fetchOrders(true);
      }, 30000);
      return () => clearInterval(interval);
    } else {
      // Si fermé, on vide la liste
      setOrders([]);
      setLoading(false);
    }
  }, [isOpen]);

  // Gestion changement de statut commande
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setProcessingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Mise à jour locale optimiste
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setProcessingId(null);
    }
  };

  // Gestion assignation livreur
  const handleAssignDriver = async (orderId: number, driverIdStr: string) => {
    const driverId = parseInt(driverIdStr, 10);
    if (isNaN(driverId)) return;

    setProcessingId(orderId);
    try {
      const updatedDelivery = await assignDriverToOrder(orderId, driverId);
      // Mise à jour locale pour afficher le livreur immédiatement
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            delivery: {
              ...o.delivery,
              ...updatedDelivery,
              driver: drivers.find(d => d.id === driverId) || null
            }
          } as AdminOrder;
        }
        return o;
      }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'assignation du livreur");
    } finally {
      setProcessingId(null);
    }
  };

  // Gestion suppression de TOUTES les commandes
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ ATTENTION : Cela va supprimer TOUTES les commandes et l'historique. Êtes-vous sûr ?")) {
      return;
    }

    try {
      await api.delete('/admin/orders'); // Appel de la route de suppression
      setOrders([]); // On vide la liste locale instantanément
      alert("Toutes les commandes ont été supprimées.");
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  // --- VUE : SERVICE FERMÉ ---
  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Clock size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Le service est actuellement fermé</h2>
        <p className="text-gray-500 max-w-md">
          Les commandes n'apparaissent ici que lorsque le service est ouvert.
          Vous pouvez consulter l'historique ou ouvrir le service depuis le Dashboard.
        </p>
      </div>
    );
  }

  // --- VUE : SERVICE OUVERT ---
  return (
    <div className="space-y-6">
      {/* En-tête avec titre et boutons */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-green-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            Commandes en cours (v2.0)
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {orders.length}
            </span>
            {alertEnabled && (
              <span className="text-orange-500 bg-orange-100 p-1 rounded-full" title="Alerte Sonore Active">
                <Volume2 size={16} />
              </span>
            )}
          </h1>
        </div>

        <div className="flex gap-2">
          {/* Bouton Tout Supprimer */}
          {orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
              title="Supprimer tout l'historique"
            >
              <Trash2 size={18} />
              <span className="hidden md:inline">Tout supprimer</span>
            </button>
          )}

          {/* Bouton Actualiser */}
          <button
            onClick={() => fetchOrders(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span className="hidden md:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Liste des commandes */}
      <div className="grid gap-6">
        {orders.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Aucune commande pour le moment.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Header de la carte commande */}
              <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-bold text-gray-700">#{order.id}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${order.mode === 'livraison' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {order.mode === 'livraison' ? <Bike size={14} /> : <ShoppingBag size={14} />}
                    {order.mode}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Badge Commentaire */}
                  {order.comment && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      💬 Note
                    </span>
                  )}

                  {/* Badge Planifié */}
                  {order.scheduled_at && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.scheduled_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Print Button - Uses popup window */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      // Create popup with ticket content
                      const printWindow = window.open('', '_blank', 'width=350,height=600');
                      if (!printWindow) {
                        alert("Popup bloquée. Autorisez les popups pour imprimer.");
                        return;
                      }

                      const formatDate = (d: string) => new Date(d).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                      });

                      const itemsHtml = order.items.map(item => {
                        const rawPrice = (item as any).price ?? (item as any).unit_price ?? 0;
                        const price = Number(rawPrice);
                        const notes = (item as any).notes;
                        return `
                          <div style="margin-bottom:6px;">
                            <div style="display:flex;justify-content:space-between;">
                              <span><strong>${item.quantity}x</strong> ${item.name || item.product_name}</span>
                              <span style="font-weight:bold;">${price === 0 ? 'OFFERT' : price.toFixed(2) + 'E'}</span>
                            </div>
                            ${notes ? `<div style="padding-left:15px;font-size:10px;font-style:italic;">> ${notes}</div>` : ''}
                          </div>
                        `;
                      }).join('');

                      const ticketHtml = `<!DOCTYPE html><html><head><title>Ticket #${order.id}</title>
                        <style>@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}
                        body{width:80mm;padding:3mm;font-family:'Courier New',monospace;font-size:12px;line-height:1.4;color:#000;background:#fff}</style>
                        </head><body>
                        <div style="text-align:center;margin-bottom:8px;"><div style="font-size:20px;font-weight:bold;">DOLCE PIZZA</div><div style="font-size:10px;">Ticket Cuisine</div></div>
                        <div style="text-align:center;border-top:1px dashed #000;border-bottom:1px dashed #000;padding:6px 0;margin-bottom:8px;">
                          <div style="font-size:18px;font-weight:bold;">#${order.id}</div>
                          <div style="font-size:10px;">${formatDate(order.created_at)}</div>
                        </div>
                        ${order.scheduled_at ? `
                        <div style="text-align:center;margin-bottom:8px;font-weight:bold;border:2px solid #000;padding:4px;">
                          PLANIFIÉ POUR :<br/>${formatDate(order.scheduled_at)}
                        </div>
                        ` : ''}
                        <div style="text-align:center;font-size:18px;font-weight:bold;padding:8px;border:2px solid #000;margin-bottom:10px;">${order.mode === 'livraison' ? 'LIVRAISON' : 'A EMPORTER'}</div>
                        <div style="margin-bottom:8px;"><div style="font-weight:bold;font-size:14px;">${order.customer.first_name} ${order.customer.last_name}</div><div style="font-size:12px;">${order.customer.phone}</div></div>
                        <div style="border-bottom:1px dashed #000;margin-bottom:8px;"></div>
                        ${order.comment ? `<div style="border:2px solid #000;padding:6px;margin-bottom:10px;font-weight:bold;font-size:11px;">NOTE: ${order.comment}</div>` : ''}
                        <div style="margin-bottom:10px;">${itemsHtml}</div>
                        <div style="border-top:2px solid #000;margin-top:10px;padding-top:8px;">
                          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;"><span>TOTAL</span><span>${Number(order.total_amount).toFixed(2)} EUR</span></div>
                        </div>
                        <div style="text-align:center;margin-top:15px;font-size:10px;"><div>--------------------------------</div><div>Merci pour votre commande !</div><div>--------------------------------</div></div>
                        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
                        </body></html>`;

                      printWindow.document.write(ticketHtml);
                      printWindow.document.close();
                    }}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    title="Imprimer le ticket"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  </button>
                  <span className="font-bold text-lg">{Number(order.total_amount).toFixed(2)} €</span>

                  {/* Sélecteur de statut de commande */}
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()} // Prevent opening modal
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={processingId === order.id}
                    className={`text-sm border-none rounded-md py-1 pl-2 pr-8 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer ${order.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'en_preparation' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'en_livraison' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'prete' ? 'bg-green-100 text-green-800' :
                            order.status === 'annulee' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                      }`}
                  >
                    {order.mode === 'emporter' ? (
                      <>
                        <option value="en_attente">En attente</option>
                        <option value="en_preparation">En préparation</option>
                        <option value="prete">Prête</option>
                        <option value="livree">Terminée / Livrée</option>
                        <option value="annulee">Annulée</option>
                      </>
                    ) : (
                      <>
                        <option value="en_attente">En attente</option>
                        <option value="en_preparation">En préparation</option>
                        <option value="en_livraison">En livraison</option>
                        <option value="livree">Livrée</option>
                        <option value="annulee">Annulée</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Contenu de la commande */}
              <div className="p-4 grid md:grid-cols-3 gap-6">

                {/* 1. Infos Client */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                  <p className="font-semibold text-gray-900">{order.customer.first_name} {order.customer.last_name}</p>
                  <p className="text-gray-600 text-sm">{order.customer.phone}</p>

                  {/* Global Comment */}
                  {
                    order.comment && (
                      <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-800 uppercase mb-1">💬 Note du client</p>
                        <p className="text-sm text-gray-800 italic">"{order.comment}"</p>
                      </div>
                    )
                  }

                  {/* Adresse si livraison */}
                  {
                    order.mode === 'livraison' && order.delivery?.googleMapsUrl && (
                      <a
                        href={order.delivery.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-blue-600 text-xs mt-2 hover:underline"
                      >
                        <MapPin size={12} /> Voir sur la carte
                      </a>
                    )
                  }
                </div>

                {/* 2. Infos Panier (Nb Articles + Détails TOUJOURS VISIBLES) */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Commande ({order.item_count} articles)
                  </h4>

                  <ul className="space-y-2 text-sm">
                    {order.items && order.items.map((item, idx) => {
                      // Fix: Handle different possible price property names from backend (price, unit_price, etc.)
                      const rawPrice = (item as any).price ?? (item as any).unit_price ?? (item as any).unitPrice;
                      const price = rawPrice !== undefined ? Number(rawPrice) : undefined;
                      const isFree = price === 0;

                      return (
                        <li key={idx} className="flex justify-between items-center border-b border-gray-50 pb-1 last:border-0 hover:bg-gray-50 p-1 rounded transition-colors">
                          <span className="text-gray-700 flex items-center gap-2">
                            <span className="font-bold text-gray-900">{item.quantity}x</span>
                            {item.name || item.product_name}

                            {/* Item Notes */}
                            {(item as any).notes && (
                              <span className="block text-xs text-gray-500 italic ml-6 mt-0.5">
                                ✏️ {(item as any).notes}
                              </span>
                            )}

                            {/* Visual Badge for Fidelity Reward */}
                            {isFree && (
                              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200 uppercase font-bold tracking-wide">
                                <Gift size={12} className="text-green-600" />
                                Offert
                              </span>
                            )}
                          </span>

                          <span className={`text-sm font-medium ${isFree ? 'text-green-600' : 'text-gray-600'}`}>
                            {isFree ? (
                              <span className="font-bold">GRATUIT</span>
                            ) : (
                              price !== undefined ? `${price.toFixed(2)} €` : 'N/A'
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 3. Assignation Livreur (Uniquement si mode livraison) */}
                {order.mode === 'livraison' && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Bike size={12} /> Livreur
                    </h4>

                    <select
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      value={order.delivery?.driver?.id || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                      disabled={processingId === order.id}
                    >
                      <option value="">-- Non assigné --</option>
                      {[...drivers]
                        .sort((a, b) => {
                          if (a.current_status === 'active' && b.current_status !== 'active') return -1;
                          if (a.current_status !== 'active' && b.current_status === 'active') return 1;
                          return 0;
                        })
                        .map(driver => (
                          <option
                            key={driver.id}
                            value={driver.id}
                            disabled={driver.current_status !== 'active'}
                            className={driver.current_status !== 'active' ? 'text-gray-400 bg-gray-100' : 'font-bold text-green-700'}
                          >
                            {driver.first_name} {driver.last_name}
                            {driver.current_status === 'pause' ? ' (PAUSE)' : ''}
                            {driver.current_status === 'inactive' || !driver.current_status ? ' (OFF)' : ''}
                          </option>
                        ))}
                    </select>

                    {order.delivery?.driver && (
                      <div className="mt-2 text-xs text-green-700 flex items-center gap-1">
                        <CheckCircle size={10} /> Assigné à {order.delivery.driver.first_name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DETAILS + PRINTING */}
      {selectedOrder && (
        <AdminOrderDetails
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
          }}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;