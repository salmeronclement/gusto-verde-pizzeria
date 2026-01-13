import React, { useState } from 'react';
import { sendDriverCode, verifyDriverCode } from '../../services/api';
import { Truck, ArrowRight } from 'lucide-react';

export default function DriverLoginPage() {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendDriverCode(phone);
            setStep('OTP');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Erreur lors de l\'envoi du code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await verifyDriverCode(phone, otp);
            if (data.token) {
                localStorage.setItem('driver-storage', JSON.stringify({
                    state: { token: data.token, user: data.driver }
                }));
                window.location.href = '/livreur/dashboard';
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Code invalide');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
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
                            disabled={loading || phone.length < 10}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Envoi...' : 'RECEVOIR LE CODE'}
                            {!loading && <ArrowRight size={20} />}
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
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="1234"
                                maxLength={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-4xl text-center tracking-[1rem] font-mono"
                                required
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length < 4}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Vérification...' : 'VALIDER'}
                            {!loading && <ArrowRight size={20} />}
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
