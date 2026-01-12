import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Bike, History, LogOut, Circle, Moon, Sun } from 'lucide-react';
// Correction de l'import : on utilise updateDriver au lieu de updateDriverStatus
import { getDriverProfile, updateDriver } from '../../services/api';

export default function DriverLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'active' | 'pause' | 'inactive'>('inactive');
    const [driverId, setDriverId] = useState<number | null>(null); // On stocke l'ID du livreur
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('driver-theme') === 'dark';
    });

    // Apply Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('driver-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('driver-theme', 'light');
        }
    }, [darkMode]);

    // Chargement du profil et du statut initial
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const driver = await getDriverProfile();
                if (driver) {
                    setDriverId(driver.id);
                    // On gère la compatibilité entre les différents formats de status
                    if (driver.current_status) {
                        setStatus(driver.current_status as any);
                    }
                }
            } catch (error) {
                console.error('Erreur chargement statut:', error);
            }
        };
        loadStatus();

        // Rafraîchissement périodique
        const interval = setInterval(loadStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (newStatus: 'active' | 'pause' | 'inactive') => {
        if (!driverId) return;

        try {
            // On utilise updateDriver avec l'ID récupéré
            await updateDriver(driverId, { current_status: newStatus });
            setStatus(newStatus);
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Erreur changement statut:', error);
            // On peut ajouter un toast d'erreur ici si nécessaire
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('driver-storage'); // Si tu utilises un store différent
        localStorage.removeItem('token'); // Nettoyage du token auth
        navigate('/driver/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'text-green-500';
            case 'pause': return 'text-orange-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header Fixe */}
            <header className={`fixed top-0 left-0 right-0 shadow-sm z-50 h-16 flex items-center justify-between px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-red-600 font-black text-xl tracking-tight">DOLCE</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Sélecteur de Statut */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-200 text-gray-700'}`}
                        >
                            <Circle size={12} fill="currentColor" className={getStatusColor(status)} />
                            <span className="text-sm font-bold capitalize">
                                {status === 'active' ? 'Actif' : status === 'pause' ? 'Pause' : 'Off'}
                            </span>
                        </button>

                        {isMenuOpen && (
                            <div className={`absolute top-full right-0 mt-2 w-32 rounded-lg shadow-xl border overflow-hidden z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <button onClick={() => handleStatusChange('active')} className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-green-50 text-gray-700'}`}>
                                    <Circle size={8} fill="currentColor" className="text-green-500" /> Actif
                                </button>
                                <button onClick={() => handleStatusChange('pause')} className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-orange-50 text-gray-700'}`}>
                                    <Circle size={8} fill="currentColor" className="text-orange-500" /> Pause
                                </button>
                                <button onClick={() => handleStatusChange('inactive')} className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                                    <Circle size={8} fill="currentColor" className="text-gray-400" /> Off
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:bg-red-900/30 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Zone de Contenu (Padding pour Header et Footer) */}
            <main className="flex-1 pt-16 pb-20 px-4 overflow-y-auto">
                <Outlet />
            </main>

            {/* Navigation Fixe (Bas) */}
            <nav className={`fixed bottom-0 left-0 right-0 border-t h-16 flex items-center justify-around z-50 pb-safe transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <Link
                    to="/driver/dashboard"
                    className={`flex flex-col items-center justify-center w-full h-full ${isActive('/driver/dashboard') || isActive('/driver') ? 'text-red-600' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}
                >
                    <Bike size={24} />
                    <span className="text-xs font-medium mt-1">Courses</span>
                </Link>

                <Link
                    to="/driver/history"
                    className={`flex flex-col items-center justify-center w-full h-full ${isActive('/driver/history') ? 'text-red-600' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}
                >
                    <History size={24} />
                    <span className="text-xs font-medium mt-1">Historique</span>
                </Link>
            </nav>
        </div>
    );
}