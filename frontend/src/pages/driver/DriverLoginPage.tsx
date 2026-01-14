import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { api } from '../../services/api';
import { Truck, ArrowRight, Loader2 } from 'lucide-react';

declare global {
    interface Window {
        recaptchaVerifierDriver: RecaptchaVerifier;
    }
}

export default function DriverLoginPage() {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    // Initialiser reCAPTCHA
    useEffect(() => {
        if (!window.recaptchaVerifierDriver && recaptchaContainerRef.current) {
            window.recaptchaVerifierDriver = new RecaptchaVerifier(auth, 'recaptcha-container-driver', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA résolu (Driver)');
                }
            });
        }
    }, []);

    // Convertir en format international
    const toInternational = (localPhone: string) => {
        const cleaned = localPhone.replace(/[\s\-\.]/g, '');
        if (cleaned.startsWith('0')) {
            return '+33' + cleaned.substring(1);
        }
        return cleaned;
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const internationalPhone = toInternational(phone);

        try {
            const appVerifier = window.recaptchaVerifierDriver;
            const result = await signInWithPhoneNumber(auth, internationalPhone, appVerifier);
            setConfirmationResult(result);
            setStep('OTP');
        } catch (err: any) {
            console.error('Firebase SMS Error:', err);
            setError(err.message || 'Erreur lors de l\'envoi du code');
            // Reset reCAPTCHA on error
            if (window.recaptchaVerifierDriver) {
                window.recaptchaVerifierDriver.clear();
                window.recaptchaVerifierDriver = new RecaptchaVerifier(auth, 'recaptcha-container-driver', {
                    size: 'invisible'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!confirmationResult) {
                throw new Error('Session expirée. Veuillez renvoyer le code.');
            }

            // 1. Valider le code avec Firebase
            const userCredential = await confirmationResult.confirm(otp);
            const firebasePhone = userCredential.user.phoneNumber;

            if (!firebasePhone) {
                throw new Error('Numéro non récupéré de Firebase.');
            }

            // 2. Appeler notre Backend pour récupérer le profil livreur
            const response = await api.post('/auth/login-firebase-driver', { phone: firebasePhone });
            const { token, driver } = response.data;

            // 3. Stocker dans localStorage
            localStorage.setItem('driver-storage', JSON.stringify({
                state: { token: token, user: driver }
            }));

            // 4. Rediriger vers le dashboard
            window.location.href = '/livreur/dashboard';
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError(err.response?.data?.error || err.message || 'Code invalide');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            {/* Conteneur invisible pour reCAPTCHA */}
            <div id="recaptcha-container-driver" ref={recaptchaContainerRef}></div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Espace Livreur</h1>
                    <p className="text-gray-500">
                        {step === 'PHONE' ? 'Connectez-vous avec votre téléphone' : 'Entrez le code reçu par SMS'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de téléphone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="06 12 34 56 78"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg text-center tracking-widest"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.replace(/\s/g, '').length < 10}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    RECEVOIR LE CODE
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Code de vérification
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-4xl text-center tracking-[1rem] font-mono"
                                required
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    VALIDER
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium underline"
                        >
                            Modifier le numéro
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
