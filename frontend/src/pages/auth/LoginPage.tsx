import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { sendClientAuthCode, verifyClientAuthCode } from '../../services/api';
import { Phone, ArrowLeft, ArrowRight, Loader2, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'phone' | 'code' | 'profile';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    // Formater le numéro pour l'affichage
    const formatPhone = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 10);
        const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
        if (match) {
            return [match[1], match[2], match[3], match[4], match[5]].filter(Boolean).join(' ');
        }
        return cleaned;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    // ... inside component
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanPhone = phone.replace(/\s/g, '');

        try {
            const data = await sendClientAuthCode(cleanPhone);
            setIsNewUser(data.isNewUser);
            setStep('code');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erreur lors de l\'envoi du code');
        } finally {
            setLoading(false);
        }
    };

    // Étape 2: Vérifier le code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanPhone = phone.replace(/\s/g, '');

        try {
            const data = await verifyClientAuthCode({
                phone: cleanPhone,
                code
            });

            // 1. On connecte l'utilisateur tout de suite (Token valide)
            login(data.token, data.user);

            // 2. Si le profil est incomplet -> Étape suivante
            if (data.needsProfile) {
                setStep('profile');
                setLoading(false);
                return;
            }

            // Sinon -> Redirection Accueil
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erreur lors de la vérification');
            // Si erreur, on déconnecte par sécurité
            useAuthStore.getState().logout();
        } finally {
            setLoading(false);
        }
    };

    // Étape 3: Compléter le profil (Authentifié via Token)
    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim()) {
            setError('Veuillez remplir votre prénom et nom.');
            return;
        }

        setLoading(true);

        try {
            // On utilise le token stocké pour mettre à jour le profil
            // import { updateUserProfile } from '../../services/api';
            // Il faut s'assurer que updateUserProfile est importé ou disponible via le store
            const userStore = useAuthStore.getState();

            await userStore.updateProfile({
                first_name: firstName.trim(),
                last_name: lastName.trim()
            });

            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-6">
                        <ArrowLeft size={20} className="mr-2" />
                        Retour à l'accueil
                    </Link>
                    <h1 className="text-4xl font-display font-bold text-dark">
                        Connexion
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Connectez-vous avec votre numéro de téléphone
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`w-3 h-3 rounded-full transition-colors ${step === 'phone' ? 'bg-primary' : 'bg-primary'}`} />
                    <div className={`w-8 h-0.5 ${step !== 'phone' ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div className={`w-3 h-3 rounded-full transition-colors ${step === 'code' || step === 'profile' ? 'bg-primary' : 'bg-gray-300'}`} />
                    {isNewUser && (
                        <>
                            <div className={`w-8 h-0.5 ${step === 'profile' ? 'bg-primary' : 'bg-gray-300'}`} />
                            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'profile' ? 'bg-primary' : 'bg-gray-300'}`} />
                        </>
                    )}
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <AnimatePresence mode="wait">
                        {/* Étape 1: Numéro de téléphone */}
                        {step === 'phone' && (
                            <motion.form
                                key="phone"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendCode}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Numéro de téléphone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            placeholder="06 12 34 56 78"
                                            className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Nous vous enverrons un code de vérification
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || phone.replace(/\s/g, '').length < 10}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            Recevoir mon code
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {/* Étape 2: Code de vérification */}
                        {step === 'code' && (
                            <motion.form
                                key="code"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyCode}
                                className="space-y-6"
                            >
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <Phone className="text-green-600" size={28} />
                                    </div>
                                    <p className="text-gray-600">
                                        Code envoyé au <span className="font-bold text-dark">{phone}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="text-primary text-sm hover:underline mt-1"
                                    >
                                        Modifier le numéro
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Code de vérification
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="block w-full text-center text-3xl tracking-[0.5em] font-mono py-4 border-2 border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="mt-2 text-xs text-gray-500 text-center">
                                        Regardez dans le terminal du serveur pour le code 📱
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || code.length < 6}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            Vérifier le code
                                            <CheckCircle size={20} />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    Renvoyer le code
                                </button>
                            </motion.form>
                        )}

                        {/* Étape 3: Compléter le profil */}
                        {step === 'profile' && (
                            <motion.form
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCompleteProfile}
                                className="space-y-6"
                            >
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                        <User className="text-primary" size={28} />
                                    </div>
                                    <h2 className="text-xl font-bold text-dark">Bienvenue !</h2>
                                    <p className="text-gray-600">
                                        Complétez votre profil pour continuer
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Jean"
                                            className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Dupont"
                                            className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !firstName.trim() || !lastName.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            Créer mon compte
                                            <CheckCircle size={20} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
