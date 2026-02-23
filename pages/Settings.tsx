
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { Globe, Bell, Fingerprint, Users, LogOut, ChevronRight, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
    const { user, property, logout, openModal, showToast, language } = useApp();
    const { t } = useTranslation();

    // Local states for UI toggles
    const [silentHours, setSilentHours] = useState(false);
    const [announcementNotify, setAnnouncementNotify] = useState(true);
    const [biometrics, setBiometrics] = useState(false);

    const handleLanguageSelect = () => {
        openModal({
            type: 'LANGUAGE_SELECT',
            title: t('settings.app_language'),
        });
    };

    const handleEmergencyContacts = () => {
        showToast(t('common.status_updated'), 'info');
    };

    const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-white' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${active ? 'left-7' : 'left-1'}`} />
        </button>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-28">
            {/* User Header */}
            <div className="flex items-center gap-5 px-2">
                <div className="w-20 h-20 rounded-3xl border-2 border-white/20 p-1">
                    <img src={user.avatar} className="w-full h-full rounded-2xl object-cover" alt="Profile" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{property.name}</p>
                </div>
            </div>

            {/* Language Section */}
            <div className="space-y-3">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('settings.app_settings')}</h2>
                <Card onClick={handleLanguageSelect} className="group cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                <Globe size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('settings.app_language')}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{language === 'tr' ? t('common.turkish') : t('common.english')}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Card>
            </div>

            {/* Notifications Section */}
            <div className="space-y-3">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('settings.notifications')}</h2>
                <Card className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                <Moon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('settings.silent_hours')}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{t('settings.silent_hours_desc')}</p>
                            </div>
                        </div>
                        <Toggle active={silentHours} onToggle={() => setSilentHours(!silentHours)} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('settings.announcement_notifications')}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{t('settings.announcement_notifications_desc')}</p>
                            </div>
                        </div>
                        <Toggle active={announcementNotify} onToggle={() => setAnnouncementNotify(!announcementNotify)} />
                    </div>
                </Card>
            </div>

            {/* Security Section */}
            <div className="space-y-3">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('settings.security')}</h2>
                <Card className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                <Fingerprint size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('settings.biometrics')}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{t('settings.biometrics_desc')}</p>
                            </div>
                        </div>
                        <Toggle active={biometrics} onToggle={() => setBiometrics(!biometrics)} />
                    </div>

                    <div onClick={handleEmergencyContacts} className="flex items-center justify-between group cursor-pointer border-t border-white/5 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('settings.emergency_contacts')}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{t('settings.emergency_contacts_desc')}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Card>
            </div>

            {/* Logout Section */}
            <div className="px-2 pt-4">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('settings.logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default Settings;
