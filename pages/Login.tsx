
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Lock, User, Phone, ChevronRight, ArrowLeft, Chrome, Apple } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
    loginFormSchema,
    registerStep1Schema,
    registerStep2Schema,
    parseWithErrors,
    sanitizeInput,
    type ValidationError
} from '../utils/validation';

const BACKGROUND_VIDEOS = [
    "/slider1.mp4",
    "/slider2.mp4",
    "/slider3.mp4"
];

// Input field component updated for glassmorphism
const InputField: React.FC<{
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    label?: string;
    error?: string;
    autoFocus?: boolean;
    icon?: React.ReactNode;
}> = ({ type, value, onChange, placeholder, label, error, autoFocus, icon }) => (
    <div className="space-y-1.5 group">
        {label && (
            <label className="text-[10px] font-bold text-white/50 ml-1 tracking-widest uppercase group-focus-within:text-white/80 transition-colors">
                {label}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                    {icon}
                </div>
            )}
            <input
                autoFocus={autoFocus}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={type === 'password' ? 'current-password' : 'username'}
                className={`w-full bg-black/40 backdrop-blur-md border ${error ? 'border-red-500/50' : 'border-white/10'} text-white rounded-2xl ${icon ? 'pl-11' : 'px-5'} py-4 outline-none focus:border-white/40 focus:bg-black/60 transition-all placeholder:text-white/20 font-medium`}
            />
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[10px] font-bold ml-1 mt-1 tracking-wide"
            >
                {error}
            </motion.p>
        )}
    </div>
);

const Login: React.FC = () => {
    const { login, register, sites, showToast } = useApp();

    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErrors, setLoginErrors] = useState<ValidationError[]>([]);

    const [regStep, setRegStep] = useState(1);
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regSiteId, setRegSiteId] = useState('');
    const [regBlock, setRegBlock] = useState('');
    const [regApt, setRegApt] = useState('');
    const [regErrors, setRegErrors] = useState<ValidationError[]>([]);

    const [videoIndex, setVideoIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVideoIndex((prev) => (prev + 1) % BACKGROUND_VIDEOS.length);
        }, 12000); // Switch every 12 seconds
        return () => clearInterval(interval);
    }, []);

    const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
        return errors.find(e => e.field === field)?.message;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginErrors([]);
        const result = parseWithErrors(loginFormSchema, {
            username: loginUsername,
            password: loginPassword
        });
        if (!result.success) {
            setLoginErrors(result.errors);
            return;
        }
        const sanitizedUsername = sanitizeInput(result.data.username);
        await login(sanitizedUsername, result.data.password);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegErrors([]);
        if (regStep === 1) {
            const result = parseWithErrors(registerStep1Schema, {
                name: regName,
                username: regUsername,
                phoneNumber: regPhone
            });
            if (!result.success) {
                setRegErrors(result.errors);
                return;
            }
            setRegName(result.data.name);
            setRegUsername(result.data.username);
            setRegPhone(result.data.phoneNumber);
            setRegStep(2);
        } else {
            const result = parseWithErrors(registerStep2Schema, {
                siteId: regSiteId,
                block: regBlock,
                apartment: regApt
            });
            if (!result.success) {
                setRegErrors(result.errors);
                return;
            }
            const success = await register(
                sanitizeInput(regName),
                sanitizeInput(regUsername),
                regPhone,
                regSiteId,
                sanitizeInput(regBlock),
                sanitizeInput(regApt)
            );
            if (success) {
                setAuthMode('login');
                setRegName('');
                setRegUsername('');
                setRegPhone('');
                setRegSiteId('');
                setRegBlock('');
                setRegApt('');
                setRegStep(1);
            }
        }
    };

    const handleSocialLogin = (provider: 'google' | 'apple') => {
        if (authMode === 'register') {
            setRegName(provider === 'google' ? 'Google Kullanıcısı' : 'Apple Kullanıcısı');
            setRegUsername(provider === 'google' ? 'google_user' : 'apple_user');
            showToast(`${provider === 'google' ? 'Google' : 'Apple'} hesabınızdan bilgiler çekildi.`, 'info');
        } else {
            showToast(`${provider === 'google' ? 'Google' : 'Apple'} ile giriş şu an simüle ediliyor.`, 'info');
        }
    };

    const handleAdminShortcut = () => {
        setLoginUsername('admin');
        setLoginPassword('Admin123');
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans selection:bg-white selection:text-black">
            {/* Background Video Slider */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.video
                        key={BACKGROUND_VIDEOS[videoIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover scale-105 blur-[2px]"
                    >
                        <source src={BACKGROUND_VIDEOS[videoIndex]} type="video/mp4" />
                    </motion.video>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />

                {/* Video Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {BACKGROUND_VIDEOS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-1000 ${i === videoIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Widget Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 w-full max-w-[420px] mx-4"
            >
                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[40px] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">

                    {/* Compact Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            initial={{ rotate: -20, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-white/10 mb-4"
                        >
                            <Lock className="w-7 h-7 text-black stroke-[2.5]" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white tracking-[0.2em] uppercase">REGORA</h1>
                        <p className="text-white/50 text-[10px] tracking-[0.3em] uppercase font-bold mt-1">Mülk Yönetim Teknolojileri</p>
                    </div>

                    {/* Auth Toggle */}
                    <div className="relative flex bg-black/30 backdrop-blur-md rounded-2xl p-1.5 mb-8 border border-white/5">
                        <button
                            onClick={() => { setAuthMode('login'); setLoginErrors([]); }}
                            className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${authMode === 'login' ? 'text-black' : 'text-white/50'}`}
                        >
                            {authMode === 'login' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-xl shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-20">Giriş</span>
                        </button>
                        <button
                            onClick={() => { setAuthMode('register'); setRegStep(1); setRegErrors([]); }}
                            className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${authMode === 'register' ? 'text-black' : 'text-white/50'}`}
                        >
                            {authMode === 'register' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-xl shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-20">Kayıt</span>
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {authMode === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <InputField
                                    type="text"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                    placeholder="Kullanıcı adınız"
                                    label="Kullanıcı Adı"
                                    icon={<User size={18} />}
                                    error={getFieldError(loginErrors, 'username')}
                                    autoFocus
                                />

                                <InputField
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    label="Şifre"
                                    icon={<Lock size={18} />}
                                    error={getFieldError(loginErrors, 'password')}
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full bg-white text-black font-extrabold py-4 rounded-2xl shadow-xl shadow-white/5 mt-6 text-[10px] uppercase tracking-[0.2em]"
                                >
                                    Sisteme Giriş Yap
                                </motion.button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                        <span className="bg-transparent px-4 text-white/30 backdrop-blur-3xl">Veya</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleSocialLogin('google')}
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group"
                                    >
                                        <Chrome size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                        <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSocialLogin('apple')}
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group"
                                    >
                                        <Apple size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                        <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">Apple</span>
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="wait">
                                    {regStep === 1 ? (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            <InputField
                                                type="text"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                placeholder="Ad Soyad"
                                                icon={<User size={18} />}
                                                error={getFieldError(regErrors, 'name')}
                                            />
                                            <InputField
                                                type="text"
                                                value={regUsername}
                                                onChange={(e) => setRegUsername(e.target.value)}
                                                placeholder="Kullanıcı Adı"
                                                icon={<User size={18} />}
                                                error={getFieldError(regErrors, 'username')}
                                            />
                                            <InputField
                                                type="tel"
                                                value={regPhone}
                                                onChange={(e) => setRegPhone(e.target.value)}
                                                placeholder="5XXXXXXXXX"
                                                icon={<Phone size={18} />}
                                                error={getFieldError(regErrors, 'phoneNumber')}
                                            />

                                            <div className="relative my-6">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/10"></div>
                                                </div>
                                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                                    <span className="bg-transparent px-4 text-white/30">Hızlı Kayıt</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSocialLogin('google')}
                                                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group"
                                                >
                                                    <Chrome size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                                    <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">Google</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSocialLogin('apple')}
                                                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 group"
                                                >
                                                    <Apple size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                                    <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">Apple</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-1.5 group">
                                                <label className="text-[10px] font-bold text-white/50 ml-1 tracking-widest uppercase">
                                                    Yönetilen Site
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <select
                                                        value={regSiteId}
                                                        onChange={(e) => setRegSiteId(e.target.value)}
                                                        className={`w-full bg-black/40 backdrop-blur-md border ${getFieldError(regErrors, 'siteId') ? 'border-red-500/50' : 'border-white/10'} text-white rounded-2xl pl-11 pr-5 py-4 outline-none appearance-none focus:border-white/40 active:bg-black/60 transition-all font-medium`}
                                                    >
                                                        <option value="" className="bg-zinc-900 text-white">Site Seçiniz</option>
                                                        {sites.map(s => <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.name}</option>)}
                                                    </select>
                                                </div>
                                                {getFieldError(regErrors, 'siteId') && (
                                                    <p className="text-red-400 text-[10px] font-bold ml-1 mt-1 tracking-wide">{getFieldError(regErrors, 'siteId')}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    type="text"
                                                    value={regBlock}
                                                    onChange={(e) => setRegBlock(e.target.value)}
                                                    placeholder="Blok"
                                                    error={getFieldError(regErrors, 'block')}
                                                />
                                                <InputField
                                                    type="text"
                                                    value={regApt}
                                                    onChange={(e) => setRegApt(e.target.value)}
                                                    placeholder="Daire"
                                                    error={getFieldError(regErrors, 'apartment')}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full bg-white text-black font-extrabold py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                                >
                                    {regStep === 1 ? 'DEVAM ET' : 'KAYDI TAMAMLA'}
                                    <ChevronRight size={14} />
                                </motion.button>

                                {regStep === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => { setRegStep(1); setRegErrors([]); }}
                                        className="w-full text-[10px] text-white/40 uppercase font-bold mt-4 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={12} />
                                        GERİ DÖN
                                    </button>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Credits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center space-y-3"
                >
                    <p className="text-[10px] text-white/30 font-bold tracking-[0.3em]">REGORA MÜLK TEKNOLOJİLERİ</p>
                    <div className="h-px w-8 bg-white/10 mx-auto" />
                    <button
                        onClick={handleAdminShortcut}
                        className="text-[10px] text-white/50 hover:text-white font-medium transition-colors tracking-widest uppercase active:scale-95"
                    >
                        Yönetici Girişi
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
