
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const ForcePasswordChange: React.FC = () => {
    const { confirmPasswordChange, logout } = useApp();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler uyuşmuyor.');
            return;
        }

        setIsLoading(true);
        try {
            await confirmPasswordChange(password);
        } catch (err) {
            setError('Şifre değiştirilirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-dark-bg z-[100] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-dark-bg to-dark-bg">
            <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                        <span className="material-symbols-rounded text-4xl text-blue-500">lock_reset</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Güvenlik Güncellemesi</h2>
                    <p className="text-gray-500 text-sm leading-relaxed px-4">
                        Hesabınızın güvenliği için lütfen geçici şifrenizi kalıcı bir şifre ile değiştirin.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Yeni Şifre</label>
                        <div className="relative group">
                            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">key</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Şifre Tekrar</label>
                        <div className="relative group">
                            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">verified_user</span>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? 'GÜNCELLENİYOR...' : 'ŞİFREYİ GÜNCELLE VE GİRİŞ YAP'}
                    </button>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </form>
            </div>

            <p className="absolute bottom-12 text-[10px] font-bold text-gray-700 uppercase tracking-[0.3em]">
                Secure Infrastructure by Regora
            </p>
        </div>
    );
};

export default ForcePasswordChange;
