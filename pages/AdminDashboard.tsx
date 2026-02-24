
import React from 'react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { Site, Ticket, UserRole } from '../types';

const AdminDashboard: React.FC = () => {
    const { openModal, addSite, updateSite, sites, removeSite, switchSite, property, activities, globalStats, tickets, forumPosts, pendingUsers, user } = useApp();

    // Managers only see their assigned site
    const availableSites = user.role === UserRole.MANAGER
        ? sites.filter(s => s.id === user.siteId)
        : sites;

    const handleManageStaff = () => {
        openModal({
            type: 'MANAGE_STAFF',
            title: 'Personel Yönetimi',
            data: { siteId: property.id }
        });
    };

    const handleAddSite = () => {
        openModal({
            type: 'MANAGE_SITE',
            title: 'Yeni Site Portföyü',
            onConfirm: (data) => {
                if (data) {
                    addSite(data);
                }
            }
        });
    };

    const handleEditSite = (site: Site) => {
        openModal({
            type: 'MANAGE_SITE',
            title: 'Site Bilgilerini Düzenle',
            data: site,
            onConfirm: (data) => {
                if (data) {
                    updateSite(data);
                }
            }
        });
    };

    const handleDeleteSite = (siteId: string) => {
        openModal({
            type: 'CONFIRMATION',
            title: 'Siteyi Sil',
            message: 'Bu siteyi ve bağlı tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            onConfirm: () => removeSite(siteId)
        });
    };

    const handleOpenReports = () => {
        openModal({
            type: 'ADMIN_REPORTS',
            title: 'Detaylı Yönetici Raporları'
        });
    };

    const handleManageUsers = () => {
        openModal({
            type: 'MANAGE_USERS',
            title: 'Kullanıcı Onayları'
        });
    };

    const handleTicketClick = (ticket: Ticket) => {
        openModal({
            type: 'TICKET_DETAIL',
            title: 'Arıza / Talep Detayı',
            data: ticket
        });
    };

    const pendingPostsCount = forumPosts.filter(p => p.status === 'pending').length;

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header and Site Selector */}
            <div className="px-2 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Yönetim Paneli</h1>
                        <p className="text-gray-400 text-sm">Operasyonel Kontrol Merkezi</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => openModal({ type: 'USER_CREATION', title: 'Yeni Personel Tanımla' })}
                            className="bg-dark-card border border-dark-border text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <span className="material-symbols-rounded text-sm">person_add</span>
                            Yeni Personel
                        </button>
                        <button
                            onClick={handleManageStaff}
                            className="bg-dark-card border border-dark-border text-blue-400 hover:bg-blue-500 hover:text-white transition-colors px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <span className="material-symbols-rounded text-sm">badge</span>
                            Ekip
                        </button>
                        <button
                            onClick={handleOpenReports}
                            className="bg-dark-card border border-dark-border text-gold-500 hover:bg-gold-500 hover:text-black transition-colors px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <span className="material-symbols-rounded text-sm">analytics</span>
                            Raporlar
                        </button>
                    </div>
                </div>

                {/* Site Selector Dropdown */}
                <div className="bg-dark-card p-3 rounded-[32px] border border-dark-border flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <span className="material-symbols-rounded">domain</span>
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Yönetilen Site</label>
                        <div className="relative">
                            <select
                                value={property.id}
                                onChange={(e) => switchSite(e.target.value)}
                                disabled={availableSites.length <= 1}
                                className="w-full bg-transparent text-white font-bold text-sm appearance-none outline-none cursor-pointer disabled:cursor-default"
                            >
                                {availableSites.map(site => (
                                    <option key={site.id} value={site.id} className="bg-dark-card text-white">
                                        {site.name}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-rounded absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MANAGEMENT SUMMARY SECTION --- */}
            <div className="grid grid-cols-2 gap-4">

                {/* Card 1: Detailed Financial Summary */}
                <Card gradient className="col-span-2 border-gold-500/20 shadow-lg shadow-gold-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{property.name} Bilanço Özeti</p>
                        <h2 className="text-4xl font-bold text-white tracking-tight">₺{globalStats.totalBalance.toLocaleString('tr-TR')}</h2>
                        <div className="bg-gold-500/10 p-2 rounded-xl text-gold-500 border border-gold-500/20">
                            <span className="material-symbols-rounded">account_balance_wallet</span>
                        </div>
                    </div>

                    {/* Income / Expense Mini Bars */}
                    <div className="flex gap-4 mt-2 mb-4">
                        <div className="flex-1 bg-dark-surface rounded-xl p-2 border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-1">AYLIK GELİR</p>
                            <p className="text-sm font-bold text-green-400">₺{globalStats.monthlyIncome.toLocaleString('tr-TR')}</p>
                            <div className="h-1 w-full bg-dark-bg mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[80%]"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-dark-surface rounded-xl p-2 border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-1">AYLIK GİDER</p>
                            <p className="text-sm font-bold text-red-400">₺{globalStats.monthlyExpense.toLocaleString('tr-TR')}</p>
                            <div className="h-1 w-full bg-dark-bg mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[60%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Collection Rate Indicator */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-300">Aylık Tahsilat Oranı</span>
                            <span className={globalStats.collectionRate > 80 ? 'text-green-400' : 'text-orange-400'}>%{globalStats.collectionRate}</span>
                        </div>
                        <div className="h-2 w-full bg-dark-bg rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full rounded-full ${globalStats.collectionRate > 80 ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-orange-500'}`}
                                style={{ width: `${globalStats.collectionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>

                {/* Card 2: Pending Users (New) */}
                <Card onClick={handleManageUsers} className="col-span-1 border-purple-500/20 bg-purple-500/5 cursor-pointer">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-rounded text-purple-400">group_add</span>
                            {pendingUsers.length > 0 && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>}
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">{pendingUsers.length}</span>
                            <p className="text-xs text-gray-400 font-medium">Kullanıcı Onayı</p>
                        </div>
                    </div>
                </Card>

                {/* Card 3: Pending Actions (Forum + Tickets) */}
                <Card className="col-span-1 bg-dark-card border border-dark-border">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-rounded text-orange-400 bg-orange-500/10 p-1.5 rounded-lg">pending</span>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-white">{pendingPostsCount + globalStats.activeTickets}</span>
                            <p className="text-xs text-gray-400 font-medium">Bekleyen İşlem</p>
                            <p className="text-[10px] text-gray-500 mt-1">{pendingPostsCount} Onay • {globalStats.activeTickets} Arıza</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* DEĞERLEME VE SATIŞ TALEPLERİ */}
            <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold">Değerleme ve Satış Talepleri</h2>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">AI Destekli</span>
                </div>
                <div className="grid gap-3">
                    <div className="bg-dark-card p-4 rounded-2xl border border-dark-border flex flex-col gap-4 group hover:border-purple-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                    <span className="material-symbols-rounded">psychology</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-200">Daire 104 - ₺12.450.000 bedelle satış ilanı onayı bekliyor</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sakin: Ahmet Yılmaz</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">Yeni</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition-all">İlanı Yayınla</button>
                            <button className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-xl hover:bg-white/10 transition-all">Sakinle İletişime Geç</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* EMLAK TALEPLERİ (Sale/Tour) */}
            <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold">Emlak Talepleri</h2>
                    <span className="text-xs text-blue-400 font-bold uppercase">Yeni Fırsat</span>
                </div>
                <div className="grid gap-3">
                    <div className="bg-dark-card p-4 rounded-2xl border border-dark-border flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                <span className="material-symbols-rounded">360</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-200">Daire 22 - Metin Özgün</p>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">360 Tur İsteği</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-bold">14 Dak. Önce</span>
                            <button className="p-1 px-3 bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg">Ata</button>
                        </div>
                    </div>

                    <div className="bg-dark-card p-4 rounded-2xl border border-dark-border flex items-center justify-between group hover:border-gold-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-500">
                                <span className="material-symbols-rounded">sell</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-200">Daire 105 - Selin Demir</p>
                                <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest">Satış / Ekspertiz Talebi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-bold">2 Saat Önce</span>
                            <button className="p-1 px-3 bg-gold-500 text-black text-[10px] font-black uppercase rounded-lg">İncele</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIVE TICKETS LIST */}
            <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold">Açık Talepler ({property.name})</h2>
                    <span className="text-xs text-gray-500">{tickets.filter(t => t.status !== 'resolved').length} Bekleyen</span>
                </div>
                <div className="grid gap-3">
                    {tickets.filter(t => t.status !== 'resolved').map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => handleTicketClick(ticket)}
                            className="bg-dark-card p-4 rounded-2xl border border-dark-border flex items-center justify-between cursor-pointer hover:border-gold-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <span className="material-symbols-rounded text-xl">
                                        {ticket.category === 'maintenance' ? 'build' : ticket.category === 'security' ? 'security' : ticket.category === 'cleaning' ? 'cleaning_services' : 'settings_alert'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-200">{ticket.title}</p>
                                    <p className="text-xs text-gray-500">{ticket.requestorName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {ticket.status === 'in_progress' && (
                                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">İşlemde</span>
                                )}
                                <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                            </div>
                        </div>
                    ))}
                    {tickets.filter(t => t.status !== 'resolved').length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">Bekleyen talep yok. Harika!</div>
                    )}
                </div>
            </div>

            {/* MANAGE SITES */}
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold">Mülk Portföyü</h2>
                    {user.role === UserRole.SUPER_ADMIN && (
                        <button onClick={handleAddSite} className="text-gold-500 text-xs font-bold flex items-center gap-1 hover:text-gold-400">
                            <span className="material-symbols-rounded text-sm">add_circle</span>
                            Yeni Ekle
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {availableSites.map((site, index) => {
                        const status = index % 3 === 0 ? 'good' : index % 3 === 1 ? 'warning' : 'critical';
                        const isSelected = site.id === property.id;

                        return (
                            <div key={site.id} className={`bg-dark-card border rounded-2xl group hover:border-white/10 transition-all relative overflow-hidden ${isSelected ? 'border-gold-500 ring-1 ring-gold-500' : 'border-dark-border'}`}>
                                {/* Site Image Header */}
                                <div className="h-32 w-full relative">
                                    {site.imageUrl ? (
                                        <img src={site.imageUrl} alt={site.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-dark-surface flex items-center justify-center">
                                            <span className="material-symbols-rounded text-gray-600 text-4xl">apartment</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-black/20 to-transparent"></div>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => handleEditSite(site)}
                                            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-white transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-lg">edit</span>
                                        </button>
                                        {user.role === UserRole.SUPER_ADMIN && (
                                            <button
                                                onClick={() => handleDeleteSite(site.id)}
                                                className="p-2 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-lg text-white transition-colors"
                                            >
                                                <span className="material-symbols-rounded text-lg">delete</span>
                                            </button>
                                        )}
                                    </div>
                                    <span className={`absolute top-3 left-3 w-3 h-3 rounded-full border-2 border-dark-card ${status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-orange-500' : 'bg-red-500'}`}></span>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="absolute bottom-2 right-2 bg-gold-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                            <span className="material-symbols-rounded text-sm">check_circle</span>
                                            YÖNETİLİYOR
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 cursor-pointer" onClick={() => switchSite(site.id)}>
                                    <div className="mb-3">
                                        <h3 className="font-bold text-gray-200 text-lg">{site.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <span className="material-symbols-rounded text-sm">location_on</span>
                                            {site.city}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-[14px]">person</span>
                                            <span>{site.managerName || 'Atanmadı'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-rounded text-[14px]">apartment</span>
                                            <span>{site.blockCount} Blok • {site.unitCount} Konut</span>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2">
                                            <span className="material-symbols-rounded text-[14px]">payments</span>
                                            <span>Aidat: <strong className="text-gold-500">₺{site.duesAmount || 0}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
