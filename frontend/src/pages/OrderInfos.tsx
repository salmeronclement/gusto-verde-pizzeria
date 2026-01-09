import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, MapPin, User, Phone, Mail, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { submitOrder } from '../services/api';

const OrderInfos: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Récupération des données du panier
  const { items, mode, total } = location.state || { items: [], mode: 'emporter', total: 0 };

  // États du formulaire
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      additionalInfo: ''
    }
  });

  const [paymentMethod, setPaymentMethod] = useState<'carte' | 'especes'>('carte');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string>('new');

  // Si l'utilisateur est connecté et a des adresses, on pré-remplit
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setCustomerInfo(prev => ({
        ...prev,
        address: {
          street: defaultAddr.street,
          postalCode: defaultAddr.postal_code, // Correction ici
          city: defaultAddr.city,
          additionalInfo: defaultAddr.additional_info || ''
        }
      }));
    }
  }, [user]);

  // Gestion du changement d'adresse depuis le select
  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);

    if (val === 'new') {
      setCustomerInfo(prev => ({
        ...prev,
        address: { street: '', postalCode: '', city: '', additionalInfo: '' }
      }));
    } else if (user) {
      // Conversion en nombre pour la comparaison
      const addrId = parseInt(val, 10);
      const selected = user.addresses.find(a => a.id === addrId);
      if (selected) {
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            street: selected.street,
            postalCode: selected.postal_code, // Correction ici
            city: selected.city,
            additionalInfo: selected.additional_info || ''
          }
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation basique
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      setError("Veuillez remplir toutes les informations personnelles.");
      setLoading(false);
      return;
    }

    if (mode === 'livraison') {
      if (!customerInfo.address.street || !customerInfo.address.postalCode || !customerInfo.address.city) {
        setError("L'adresse est incomplète pour la livraison.");
        setLoading(false);
        return;
      }
    }

    try {
      // Préparation des données pour l'API
      // Note: L'API attend postal_code, on map postalCode vers postal_code
      const orderData = {
        mode,
        customer: {
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone,
          email: customerInfo.email
        },
        address: mode === 'livraison' ? {
          street: customerInfo.address.street,
          postal_code: customerInfo.address.postalCode,
          city: customerInfo.address.city,
          additional_info: customerInfo.address.additionalInfo
        } : undefined,
        items: items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          notes: item.notes
        })),
        payment_method: paymentMethod
      };

      const response = await submitOrder(items, orderData.customer, mode, orderData.address);
      
      // Redirection vers confirmation
      navigate('/commande/confirmation', { 
        state: { 
          orderId: response.orderId,
          total 
        } 
      });

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la commande. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Votre panier est vide.</p>
          <button onClick={() => navigate('/nos-pizzas')} className="text-primary hover:underline">
            Retourner au menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au panier
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">
          Finaliser ma commande
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: INFOS CLIENT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="text-primary" size={24} />
              Vos coordonnées
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                  value={customerInfo.firstName}
                  onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                  value={customerInfo.lastName}
                  onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADRESSE (SI LIVRAISON) */}
          {mode === 'livraison' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="text-primary" size={24} />
                Adresse de livraison
              </h2>

              {/* Sélecteur d'adresses enregistrées */}
              {user && user.addresses && user.addresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Choisir une adresse enregistrée</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                  >
                    {user.addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name ? `${addr.name} - ` : ''}{addr.street}, {addr.city}
                      </option>
                    ))}
                    <option value="new">+ Nouvelle adresse</option>
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rue / Voie</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                    value={customerInfo.address.street}
                    onChange={e => setCustomerInfo({
                      ...customerInfo, 
                      address: {...customerInfo.address, street: e.target.value}
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                      value={customerInfo.address.postalCode}
                      onChange={e => setCustomerInfo({
                        ...customerInfo, 
                        address: {...customerInfo.address, postalCode: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                      value={customerInfo.address.city}
                      onChange={e => setCustomerInfo({
                        ...customerInfo, 
                        address: {...customerInfo.address, city: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complément (Batiment, Etage...)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                    value={customerInfo.address.additionalInfo}
                    onChange={e => setCustomerInfo({
                      ...customerInfo, 
                      address: {...customerInfo.address, additionalInfo: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PAIEMENT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wallet className="text-primary" size={24} />
              Moyen de paiement
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'carte' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('carte')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'carte' ? 'border-primary' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'carte' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <CreditCard className={paymentMethod === 'carte' ? 'text-primary' : 'text-gray-500'} />
                <span className={`font-medium ${paymentMethod === 'carte' ? 'text-primary' : 'text-gray-700'}`}>
                  Carte Bancaire (à la livraison)
                </span>
              </div>

              <div 
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'especes' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('especes')}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'especes' ? 'border-primary' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'especes' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <Wallet className={paymentMethod === 'especes' ? 'text-primary' : 'text-gray-500'} />
                <span className={`font-medium ${paymentMethod === 'especes' ? 'text-primary' : 'text-gray-700'}`}>
                  Espèces
                </span>
              </div>
            </div>
          </div>

          {/* VALIDATION */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Traitement en cours...' : `Confirmer la commande (${total.toFixed(2)} €)`}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OrderInfos;