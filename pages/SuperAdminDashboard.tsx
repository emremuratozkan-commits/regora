import React, { useState } from 'react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { UserRole, Site } from '../types';
import { useTranslation } from 'react-i18next';
import { Building2, Users, PieChart, ShieldCheck, ChevronRight, Search, Hammer, TrendingUp } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
    const { sites, openModal, globalStats, allUsers } = useApp();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSites = sites.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssignManager = (site: Site) => {
        openModal({
            type: 'ASSIGN_MANAGER',
            title: `Yönetici Atama`, // Title is handled inside modal UI now
            data: site
        });
    };

    const handleSiteSettings = (site: Site) => {
        openModal({
            type: 'MANAGE_SITE',
            title: 'Portföy Detayları',
            data: site
        });
    };

    return (
        <div className="space-y-10 animate-fade-in pb-32">
            {/* Patron Premium Header */}
            <div className="relative overflow-hidden pt-8 px-2">
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-px w-8 bg-gold-500/50"></div>
                            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.3em]">Portföy Denetimi</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tighter">
                            PATRON <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">PANELİ</span>
                        </h1>
                        <p className="text-gray-500 text-xs mt-2 font-medium">Toplam {sites.length} Mülk • {globalStats.totalBalance.toLocaleString('tr-TR')} ₺ Likidite</p>
                    </div>
                    <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] hidden sm:block">
                        <TrendingUp className="text-gold-500 w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Analytical Command Strip */}
            <div className="grid grid-cols-2 gap-4 px-1">
                <Card gradient className="p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={14} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Kapasite</span>
                        </div>
                        <h3 className="text-3xl font-black text-white">{sites.reduce((acc, s) => acc + s.unitCount, 0)}</h3>
                        <p className="text-[9px] text-blue-400 font-bold mt-1 uppercase tracking-tighter">Bağımsız Bölüm</p>
                    </div>
                </Card>

                <Card gradient className="p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={14} className="text-purple-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doluluk Oranı</span>
                        </div>
                        <h3 className="text-3xl font-black text-white">%92.4</h3>
                        <p className="text-[9px] text-purple-400 font-bold mt-1 uppercase tracking-tighter">Ortalama Doluluk</p>
                    </div>
                </Card>
            </div>

            {/* Site Inventory Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Mülk Portföyü</h2>
                        <span className="bg-white/10 text-gray-400 text-[9px] font-black px-2 py-0.5 rounded-full">{filteredSites.length}</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="Mülk ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-2xl pl-9 pr-4 py-2 text-[11px] text-white outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all w-36 placeholder:text-gray-700 font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-4 px-1">
                    {filteredSites.map((site, idx) => (
                        <Card key={site.id} className="relative overflow-hidden group hover:border-gold-500/30 transition-all duration-500">
                            {/* Decorative site index */}
                            <div className="absolute -left-2 -top-4 text-8xl font-black text-white/5 select-none pointer-events-none">{idx + 1}</div>

                            <div className="p-6 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-[22px] overflow-hidden border border-white/10 shadow-2xl relative">
                                            <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-gold-500 transition-colors uppercase">{site.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="material-symbols-rounded text-sm text-gray-500">location_on</span>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{site.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
                                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Kasa</p>
                                            <p className="text-xs font-bold text-white mt-0.5">₺{((site.unitCount || 100) * (site.duesAmount || 1000) * 0.85).toLocaleString('tr-TR')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 border-y border-white/5 py-4">
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">İşletme Puanı</p>
                                        <p className="text-sm font-black text-emerald-400 mt-1">4.8/5</p>
                                    </div>
                                    <div className="text-center border-x border-white/5">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Doluluk</p>
                                        <p className="text-sm font-black text-white mt-1">%{85 + Math.floor(Math.random() * 15)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Sakin Güveni</p>
                                        <p className="text-sm font-black text-blue-400 mt-1">Critcial</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex-1">
                                        {site.managerId ? (
                                            <div className="flex items-center justify-between bg-white/5 pr-4 pl-1 py-1 rounded-full border border-white/5 group/manager">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center font-bold text-black border-2 border-dark-card shadow-lg">
                                                        {site.managerName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Sorumlu Müdür</p>
                                                        <p className="text-[10px] text-white font-bold">{site.managerName}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignManager(site)}
                                                    className="opacity-0 group-hover/manager:opacity-100 transition-opacity text-[8px] font-black text-gold-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Değiştir
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAssignManager(site)}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all active:scale-95"
                                            >
                                                <Users size={14} />
                                                Müdür Ataması Bekleniyor
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleSiteSettings(site)}
                                            className="p-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 active:scale-95 transition-all"
                                            title="Site Düzenle"
                                        >
                                            <Hammer size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Master Actions */}
            <div className="px-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => openModal({ type: 'MANAGE_SITE', title: 'Portföy Genişletme' })}
                    className="w-full relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative bg-white/5 border border-dashed border-white/20 rounded-[36px] p-8 flex flex-col items-center gap-4 transition-all group-hover:border-gold-500/50 group-hover:bg-white/[0.07]">
                        <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500 border border-white/10">
                            <Building2 className="w-6 h-6 text-gray-500 group-hover:text-gold-400 transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-white tracking-tight">Yeni Mülk Portföyü Ekle</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 group-hover:text-gold-500/70 transition-colors">Ekosistemi Genişletin</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => openModal({ type: 'USER_CREATION', title: 'Yeni Yetkili Hesabı' })}
                    className="w-full relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative bg-white/5 border border-dashed border-white/20 rounded-[36px] p-8 flex flex-col items-center gap-4 transition-all group-hover:border-blue-500/50 group-hover:bg-white/[0.07]">
                        <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500 border border-white/10">
                            <ShieldCheck className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-white tracking-tight">Yeni Yetkili Hesabı Tanımla</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 group-hover:text-blue-500/70 transition-colors">Yönetim Kadrosunu Büyütün</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
