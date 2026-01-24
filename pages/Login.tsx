
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    loginFormSchema,
    registerStep1Schema,
    registerStep2Schema,
    parseWithErrors,
    sanitizeInput,
    type LoginFormData,
    type RegisterStep1Data,
    type RegisterStep2Data,
    type ValidationError
} from '../utils/validation';

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

    // Get error message for a specific field
    const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
        return errors.find(e => e.field === field)?.message;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginErrors([]);

        // Validate form data with Zod
        const result = parseWithErrors(loginFormSchema, {
            username: loginUsername,
            password: loginPassword
        });

        if (!result.success) {
            setLoginErrors(result.errors);
            return;
        }

        // Sanitize inputs before sending
        const sanitizedUsername = sanitizeInput(result.data.username);
        await login(sanitizedUsername, result.data.password);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegErrors([]);

        if (regStep === 1) {
            // Validate step 1
            const result = parseWithErrors(registerStep1Schema, {
                name: regName,
                username: regUsername,
                phoneNumber: regPhone
            });

            if (!result.success) {
                setRegErrors(result.errors);
                return;
            }

            // Store sanitized values
            setRegName(result.data.name);
            setRegUsername(result.data.username);
            setRegPhone(result.data.phoneNumber);
            setRegStep(2);
        } else {
            // Validate step 2
            const result = parseWithErrors(registerStep2Schema, {
                siteId: regSiteId,
                block: regBlock,
                apartment: regApt
            });

            if (!result.success) {
                setRegErrors(result.errors);
                return;
            }

            // Sanitize and register
            const success = await register(
                sanitizeInput(regName),
                sanitizeInput(regUsername),
                regPhone,
                regSiteId,
                sanitizeInput(result.data.block),
                sanitizeInput(result.data.apartment)
            );
            if (success) {
                setAuthMode('login');
                // Reset form
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

    const handleAdminShortcut = () => {
        setLoginUsername('admin');
        setLoginPassword('Admin123'); // Default for demo
    };

    // Input field component with error display
    const InputField: React.FC<{
        type: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        placeholder: string;
        label?: string;
        error?: string;
    }> = ({ type, value, onChange, placeholder, label, error }) => (
        <div className="space-y-1">
            {label && (
                <label className="text-[10px] font-bold text-gray-500 ml-1 tracking-widest uppercase">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-dark-card border ${error ? 'border-red-500' : 'border-dark-border'} text-white rounded-2xl px-5 py-4 outline-none focus:border-white transition-colors placeholder:text-gray-700 font-medium`}
            />
            {error && (
                <p className="text-red-500 text-xs ml-1 mt-1">{error}</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col justify-center px-6 pb-12 animate-fade-in bg-dark-bg">
            <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-white/10 mb-6">
                    <span className="material-symbols-rounded text-5xl text-black font-variation-filled">lock</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-widest uppercase">ÅKRONA</h1>
                <p className="text-gray-500 mt-2 text-xs tracking-widest uppercase font-medium">Kurumsal Mülk Yönetimi</p>
            </div>

            <div className="w-full max-w-sm mx-auto">
                <div className="flex bg-dark-card rounded-2xl p-1 mb-8 border border-dark-border">
                    <button
                        onClick={() => { setAuthMode('login'); setLoginErrors([]); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        Giriş
                    </button>
                    <button
                        onClick={() => { setAuthMode('register'); setRegStep(1); setRegErrors([]); }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        Kayıt
                    </button>
                </div>

                {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
                        <InputField
                            type="text"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            placeholder="Kullanıcı adınız"
                            label="Kullanıcı Adı"
                            error={getFieldError(loginErrors, 'username')}
                        />

                        <InputField
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            label="Şifre"
                            error={getFieldError(loginErrors, 'password')}
                        />

                        <button
                            type="submit"
                            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-white/5 mt-4 text-xs uppercase tracking-widest"
                        >
                            Sisteme Giriş Yap
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4 animate-slide-up">
                        {regStep === 1 ? (
                            <>
                                <InputField
                                    type="text"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    placeholder="Ad Soyad"
                                    error={getFieldError(regErrors, 'name')}
                                />
                                <InputField
                                    type="text"
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    placeholder="Kullanıcı Adı"
                                    error={getFieldError(regErrors, 'username')}
                                />
                                <InputField
                                    type="tel"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    placeholder="Telefon Numarası (5XXXXXXXXX)"
                                    error={getFieldError(regErrors, 'phoneNumber')}
                                />
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <select
                                        value={regSiteId}
                                        onChange={(e) => setRegSiteId(e.target.value)}
                                        className={`w-full bg-dark-card border ${getFieldError(regErrors, 'siteId') ? 'border-red-500' : 'border-dark-border'} text-white rounded-2xl px-5 py-4 outline-none appearance-none`}
                                    >
                                        <option value="">Site Seçiniz</option>
                                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {getFieldError(regErrors, 'siteId') && (
                                        <p className="text-red-500 text-xs ml-1 mt-1">{getFieldError(regErrors, 'siteId')}</p>
                                    )}
                                </div>
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
                                    placeholder="Daire No"
                                    error={getFieldError(regErrors, 'apartment')}
                                />
                            </>
                        )}
                        <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-2xl text-xs uppercase tracking-widest mt-2">
                            {regStep === 1 ? 'DEVAM ET' : 'BAŞVURU YAP'}
                        </button>
                        {regStep === 2 && (
                            <button type="button" onClick={() => { setRegStep(1); setRegErrors([]); }} className="w-full text-xs text-gray-500 uppercase font-bold mt-2">GERİ DÖN</button>
                        )}
                    </form>
                )}
            </div>

            <div className="mt-auto pt-10 text-center">
                <p className="text-[10px] text-gray-700 font-bold tracking-tighter mb-2">ÅKRONA ESTATE TECHNOLOGIES</p>
                <button
                    onClick={handleAdminShortcut}
                    className="text-[10px] text-gray-900 hover:text-gray-600 transition-colors"
                >
                    Yönetici Terminali
                </button>
            </div>
        </div>
    );
};

export default Login;
