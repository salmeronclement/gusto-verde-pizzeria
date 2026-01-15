import { useState, useEffect } from 'react';
import { getAdminCustomers, updateCustomer, deleteCustomer } from '../../services/api';
import { Users, Edit2, X, Save, TrendingUp, Award, Clock, Search, Trash2 } from 'lucide-react';
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
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', loyalty_points: 0 });
    const [saving, setSaving] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortType>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const filteredCustomers = customers.filter(c =>
        (c.first_name + ' ' + c.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
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

    const fetchCustomers = async () => {
        try {
            const data = await getAdminCustomers();
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
        setEditForm({
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            loyalty_points: customer.loyalty_points || 0
        });
    };

    const handleSave = async () => {
        if (!editingCustomer) return;

        setSaving(true);
        try {
            await updateCustomer(editingCustomer.id, editForm);

            setCustomers(customers.map(c =>
                c.id === editingCustomer.id
                    ? { ...c, ...editForm }
                    : c
            ));
            setEditingCustomer(null);
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteCustomer(id);
            setCustomers(customers.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Erreur lors de la suppression');
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Users className="text-primary" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-dark">Clients</h1>
                        <p className="text-gray-600">Gestion de la fidélité et des comptes clients</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-64"
                        />
                    </div>

                    {/* Sort Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'recent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="Récents"
                        >
                            <Clock size={16} />
                            <span className="hidden xl:inline">Récents</span>
                        </button>
                        <button
                            onClick={() => setSortBy('top_spent')}
                            className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'top_spent' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="Top Clients"
                        >
                            <TrendingUp size={16} />
                            <span className="hidden xl:inline">Top Clients</span>
                        </button>
                        <button
                            onClick={() => setSortBy('top_orders')}
                            className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${sortBy === 'top_orders' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            title="Plus Fidèles"
                        >
                            <Award size={16} />
                            <span className="hidden xl:inline">Plus Fidèles</span>
                        </button>
                    </div>
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
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(customer); }}
                                            className="text-primary hover:text-secondary inline-flex items-center gap-1 font-bold"
                                        >
                                            <Edit2 size={16} />
                                            Modifier
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(customer.id); }}
                                            className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 font-bold"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                                    Modifier le client
                                </h2>
                                <button
                                    onClick={() => setEditingCustomer(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tampons fidélité 🍕</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.loyalty_points}
                                        onChange={(e) => setEditForm({ ...editForm, loyalty_points: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-center text-xl font-bold text-primary focus:border-primary focus:ring-0"
                                    />
                                </div>
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer ce client ?</h3>
                                <p className="text-gray-500 text-sm">Cette action est irréversible. Les commandes seront conservées mais dissociées du client.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

