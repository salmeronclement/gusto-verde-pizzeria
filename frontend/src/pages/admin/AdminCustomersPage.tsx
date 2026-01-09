import { useState, useEffect } from 'react';
import { Users, Edit2, X, Save, TrendingUp, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminCustomerDetails from '../../components/admin/AdminCustomerDetails';

interface Customer {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    loyalty_points: number;
    created_at: string;
    total_spent: number;
    order_count: number;
}

type SortType = 'recent' | 'top_spent' | 'top_orders';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [newPoints, setNewPoints] = useState(0);
    const [saving, setSaving] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortType>('recent');

    const sortedCustomers = [...customers].sort((a, b) => {
        switch (sortBy) {
            case 'top_spent':
                return Number(b.total_spent) - Number(a.total_spent);
            case 'top_orders':
                return Number(b.order_count) - Number(a.order_count);
            case 'recent':
            default:
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const getAuthHeaders = () => {
        // Récupérer le token depuis le store Zustand persist
        let token = null;
        const adminStorage = localStorage.getItem('admin-storage');
        if (adminStorage) {
            try {
                const { state } = JSON.parse(adminStorage);
                if (state && state.token) {
                    token = state.token;
                }
            } catch (e) {
                console.error('Error parsing admin token:', e);
            }
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://51.68.229.173/api/admin/customers', {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                console.error('API Error:', response.status);
                setCustomers([]);
                return;
            }

            const data = await response.json();
            // Ensure data is an array
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (customer: Customer) => {
        setEditingCustomer(customer);
        setNewPoints(customer.loyalty_points);
    };

    const handleSave = async () => {
        if (!editingCustomer) return;

        setSaving(true);
        try {
            const response = await fetch(
                `http://51.68.229.173/api/admin/customers/${editingCustomer.id}/loyalty`,
                {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ loyalty_points: newPoints }),
                }
            );

            if (response.ok) {
                setCustomers(customers.map(c =>
                    c.id === editingCustomer.id
                        ? { ...c, loyalty_points: newPoints }
                        : c
                ));
                setEditingCustomer(null);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating loyalty:', error);
            alert('Erreur de connexion');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Users className="text-primary" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-dark">Clients</h1>
                        <p className="text-gray-600">Gestion de la fidélité et des comptes clients</p>
                    </div>
                </div>
                {/* Sort Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'recent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Clock size={16} /> Récents
                    </button>
                    <button
                        onClick={() => setSortBy('top_spent')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'top_spent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <TrendingUp size={16} /> Top Clients
                    </button>
                    <button
                        onClick={() => setSortBy('top_orders')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'top_orders' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Award size={16} /> Plus Fidèles
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tampons 🍕
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Dépensé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Commandes
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedCustomers.map((customer) => (
                            <tr
                                key={customer.id}
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {customer.first_name} {customer.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">{customer.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {customer.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                                        {customer.loyalty_points} 🍕
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-green-600">
                                        {Number(customer.total_spent).toFixed(2)} €
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                        {customer.order_count} cmd
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(customer); }}
                                        className="text-primary hover:text-secondary inline-flex items-center gap-2 font-bold"
                                    >
                                        <Edit2 size={16} />
                                        Modifier
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {customers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Aucun client enregistré
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-display font-bold text-dark">
                                    Modifier la fidélité
                                </h2>
                                <button
                                    onClick={() => setEditingCustomer(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-1">Client</p>
                                <p className="font-bold text-dark">
                                    {editingCustomer.first_name} {editingCustomer.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{editingCustomer.email}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nombre de tampons 🍕
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newPoints}
                                    onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold text-primary focus:border-primary focus:ring-0"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Use case : Client commande par téléphone, ajoutez manuellement ses tampons.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingCustomer(null)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Sauvegarder
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Customer Details Modal */}
            {selectedCustomerId && (
                <AdminCustomerDetails
                    customerId={selectedCustomerId}
                    onClose={() => setSelectedCustomerId(null)}
                />
            )}
        </div>
    );
}

