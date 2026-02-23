import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Lock, LogOut } from 'lucide-react';

const PendingApproval: React.FC = () => {
    const { user, logout } = useApp();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
            <div className="max-w-[430px] w-full text-center space-y-8">
                {/* Pulsing Logo */}
                <div className="flex justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                    >
                        <Lock className="w-12 h-12 text-black stroke-[2.5]" />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('common.welcome')}!
                    </h1>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <p className="text-gray-300 leading-relaxed text-sm font-medium">
                            Regora topluluğunun güvenliği için hesabınız şu an yönetici onayında.
                            Onaylandığında sizi bildirimle haberdar edeceğiz.
                        </p>
                    </div>
                </div>

                <div className="pt-8">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 mx-auto text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <LogOut size={16} />
                        Oturumu Kapat
                    </button>
                </div>

                <div className="pt-12">
                    <p className="text-[10px] text-white/20 font-bold tracking-[0.3em] uppercase">REGORA TECHNOLOGIES</p>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
