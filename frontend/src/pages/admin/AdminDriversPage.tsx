import React, { useEffect, useState } from 'react';
import { getAdminDrivers, createDriver, updateDriver, removeDriver, Driver } from '../../services/api';
import { RefreshCw, Plus, Edit2, Check, X, Phone, User, Trash2 } from 'lucide-react';

const AdminDriversPage: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form states
    const [newDriver, setNewDriver] = useState({ first_name: '', last_name: '', phone: '' });
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' });
    const [formError, setFormError] = useState<string | null>(null);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const data = await getAdminDrivers();
            setDrivers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching drivers:', err);
            setError('Impossible de charger les livreurs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const validateForm = (form: { first_name: string; last_name: string; phone: string }) => {
        if (!form.first_name || !form.last_name || !form.phone) {
            return 'Tous les champs (Nom, Prénom, Tel) sont obligatoires.';
        }
        const normalizedPhone = form.phone.replace(/\D/g, '');
        if (normalizedPhone.length !== 10) {
            return 'Le numéro de téléphone doit contenir exactement 10 chiffres.';
        }
        return null;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const validationError = validateForm(newDriver);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            const response = await createDriver(newDriver);
            const createdDriver: Driver = {
                id: response.id,
                current_status: 'available',
                is_active: true,
                created_at: new Date().toISOString(),
                ...newDriver
            };

            setDrivers(prev => [createdDriver, ...prev]);
            setNewDriver({ first_name: '', last_name: '', phone: '' });
            setIsCreating(false);
        } catch (err: any) {
            console.error('Error creating driver:', err);
            setFormError(err.response?.data?.error || 'Erreur lors de la création du livreur');
        }
    };

    const startEditing = (driver: Driver) => {
        setEditingId(driver.id);
        setEditForm({
            first_name: driver.first_name,
            last_name: driver.last_name,
            phone: driver.phone
        });
    };

    const handleUpdate = async (id: number) => {
        const validationError = validateForm(editForm);
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            const updated = await updateDriver(id, editForm);
            setDrivers(prev => prev.map(d => d.id === id ? updated : d));
            setEditingId(null);
        } catch (err) {
            console.error('Error updating driver:', err);
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Supprimer ce livreur ?')) return;

        try {
            await removeDriver(id);
            setDrivers(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            console.error('Error deleting driver:', err);
            alert(err.response?.data?.error || 'Erreur lors de la suppression du livreur');
        }
    };

    const toggleActive = async (driver: Driver) => {
        try {
            const updated = await updateDriver(driver.id, { is_active: !driver.is_active });
            setDrivers(prev => prev.map(d => d.id === driver.id ? updated : d));
        } catch (err) {
            console.error('Error toggling active status:', err);
            alert('Erreur lors du changement de statut');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-display">
                        Gestion des Livreurs
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchDrivers}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={18} />
                            Actualiser
                        </button>
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <Plus size={18} />
                            Nouveau Livreur
                        </button>
                    </div>
                </div>

                {/* Creation Form */}
                {isCreating && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in">
                        <h2 className="text-lg font-semibold mb-4">Ajouter un livreur</h2>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDriver.first_name}
                                        onChange={e => setNewDriver({ ...newDriver, first_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDriver.last_name}
                                        onChange={e => setNewDriver({ ...newDriver, last_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newDriver.phone}
                                        onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="0612345678"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Enregistrer
                                </button>
                            </div>
                            {formError && (
                                <div className="text-red-600 text-sm mt-2">
                                    {formError}
                                </div>
                            )}
                        </form>
                    </div>
                )
                }

                {
                    error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )
                }

                {/* Drivers List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">#</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Nom</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Téléphone</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Aucun livreur enregistré.
                                    </td>
                                </tr>
                            ) : (
                                drivers.map(driver => (
                                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                                            #{driver.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === driver.id ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        value={editForm.first_name}
                                                        onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                                        className="w-32 px-2 py-1 text-sm rounded border-gray-300"
                                                        placeholder="Prénom"
                                                    />
                                                    <input
                                                        value={editForm.last_name}
                                                        onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                                        className="w-32 px-2 py-1 text-sm rounded border-gray-300"
                                                        placeholder="Nom"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {driver.first_name} {driver.last_name}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === driver.id ? (
                                                <input
                                                    value={editForm.phone}
                                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                    className="w-40 px-2 py-1 text-sm rounded border-gray-300"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone size={14} />
                                                    {driver.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(driver)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${driver.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {driver.is_active ? 'Actif' : 'Inactif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === driver.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdate(driver.id)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Sauvegarder"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Annuler"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(driver)}
                                                        className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(driver.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
};

export default AdminDriversPage;
