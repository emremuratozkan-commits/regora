
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_BANK_DETAILS } from '../constants';
import { UserRole, ThemeAccent, Ticket, Site } from '../types';

const UIOverlay: React.FC = () => {
    const {
        modal, toast, closeModal, property, showToast, user,
        addTicket, addAnnouncement, addForumPost, createPoll,
        addSite, updateSite, approveUser, rejectUser,
        pendingUsers, sites, theme, setTheme, addLicensePlate, serviceLogs, updateTicketStatus, language, setLanguage, allUsers, assignManager, assignStaff, createAuthority, confirmPasswordChange
    } = useApp();

    const [isPaying, setIsPaying] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [pollOptions, setPollOptions] = useState('');
    const [targetSiteId, setTargetSiteId] = useState('');

    // Ticket State
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [ticketCategory, setTicketCategory] = useState('Teknik Destek');

    const [licensePlate, setLicensePlate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');

    // Reservation State
    const [resDate, setResDate] = useState('');
    const [resTime, setResTime] = useState('');

    // Real Estate State
    const [reNote, setReNote] = useState('');

    // Site Form State
    const [siteForm, setSiteForm] = useState<Omit<Site, 'id'>>({
        name: '', address: '', city: '', managerName: '', managerId: '', blockCount: 1, unitCount: 1, duesAmount: 0, imageUrl: '', features: {
            has_pool: false, has_gym: false, has_freight_elevator: false, has_parking_recognition: false, has_guest_kiosk: false,
            has_vale: false, has_concierge: false, has_taxi: false
        }
    });
    const [assignSearchTerm, setAssignSearchTerm] = useState('');
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('Teknik Personel');
    const [authForm, setAuthForm] = useState({
        name: '', username: '', role: UserRole.MANAGER, jobTitle: 'Site Müdürü', password: ''
    });

    // AI Valuation State
    const [isValuating, setIsValuating] = useState(false);
    const [showValuationResult, setShowValuationResult] = useState(false);

    // Add Service State
    const [serviceForm, setServiceForm] = useState({
        title: '',
        description: '',
        icon: 'star',
        action: 'Talep Et'
    });

    useEffect(() => {
        if (modal?.type === 'ASSIGN_MANAGER') {
            setAssignSearchTerm('');
            setSelectedManagerId('');
        }
        if (modal?.type === 'MANAGE_STAFF') {
            setStaffSearchTerm('');
        }
        if (modal?.type === 'TICKET') {
            setTicketTitle('');
            setTicketDesc('');
            setTicketCategory('Teknik Destek');
        }
        if (modal?.type === 'CREATE_ANNOUNCEMENT') { setPostTitle(''); setPostContent(''); setTargetSiteId(property.id); }
        if (modal?.type === 'CREATE_POST') { setPostTitle(''); setPostContent(''); }
        if (modal?.type === 'CREATE_POLL') { setPostTitle(''); setPollOptions(''); setTargetSiteId(property.id); }
        if (modal?.type === 'ADD_LICENSE_PLATE') { setLicensePlate(''); }
        if (modal?.type === 'RESERVATION') { setResDate(''); setResTime(''); }
        if (modal?.type === 'REAL_ESTATE') { setReNote(''); }
        if (modal?.type === 'MANAGE_SITE') {
            if (modal.data) setSiteForm({ ...modal.data });
            else setSiteForm({ name: '', address: '', city: '', managerName: '', managerId: '', blockCount: 1, unitCount: 1, duesAmount: 0, imageUrl: '', features: {} as any });
        }
        if (modal?.type === 'AI_VALUATION') {
            setIsValuating(true);
            setShowValuationResult(false);
            setTimeout(() => {
                setIsValuating(false);
                setShowValuationResult(true);
            }, 3000);
        }
        if (modal?.type === 'ADD_SERVICE') {
            setServiceForm({ title: '', description: '', icon: 'star', action: 'Talep Et' });
        }
    }, [modal, property.id]);

    const handlePaymentConfirm = () => {
        setIsPaying(true);
        setTimeout(() => {
            setIsPaying(false);
            if (modal?.onConfirm) modal.onConfirm();
            closeModal();
            showToast('Ödeme başarıyla tamamlandı.', 'success');
        }, 1500);
    };

    const handleTicketSubmit = () => {
        if (!ticketTitle || !ticketDesc) return showToast('Lütfen tüm alanları doldurun.', 'error');

        let mappedCategory: Ticket['category'] = 'technical';
        switch (ticketCategory) {
            case 'Güvenlik': mappedCategory = 'security'; break;
            case 'Temizlik': mappedCategory = 'cleaning'; break;
            case 'Peyzaj': mappedCategory = 'landscape'; break;
            case 'Bakım & Onarım': mappedCategory = 'maintenance'; break;
            default: mappedCategory = 'technical';
        }

        addTicket({
            title: ticketTitle,
            description: ticketDesc,
            category: mappedCategory,
            requestorName: user.name
        });
        showToast('Talebiniz teknik ekibe iletildi.', 'success');
        closeModal();
    };

    const handleAnnouncementSubmit = () => {
        if (!postTitle || !postContent) return showToast('Tüm alanları doldurun.', 'error');
        addAnnouncement(postTitle, postContent, 'routine', targetSiteId);
        closeModal();
    };

    const handleForumSubmit = () => {
        if (!postTitle || !postContent) return showToast('Tüm alanları doldurun.', 'error');
        addForumPost(postTitle, postContent);
        closeModal();
    };

    const handlePollSubmit = () => {
        if (!postTitle || !pollOptions) return showToast('Tüm alanları doldurun.', 'error');
        const options = pollOptions.split(',').map(o => o.trim()).filter(o => o !== '');
        createPoll(postTitle, options, targetSiteId);
        closeModal();
    };

    const handlePlateSubmit = () => {
        if (!licensePlate) return showToast('Plaka giriniz.', 'error');
        addLicensePlate(licensePlate);
        closeModal();
    };

    const handleResSubmit = () => {
        if (!resDate || !resTime) return showToast('Tarih ve saat seçiniz.', 'error');
        if (modal?.onConfirm) modal.onConfirm({ date: resDate, time: resTime });
        closeModal();
    };

    const handleRESubmit = () => {
        if (modal?.onConfirm) modal.onConfirm({ note: reNote });
        closeModal();
    };

    const handleSiteSubmit = () => {
        if (!siteForm.name) return showToast('Site adı gereklidir.', 'error');
        if (modal?.data?.id) updateSite({ ...siteForm, id: modal.data.id } as Site);
        else addSite(siteForm);
        closeModal();
    };

    const handleServiceSubmit = () => {
        if (!serviceForm.title) return showToast('Hizmet adı gereklidir.', 'error');
        if (modal?.onConfirm) {
            const key = `has_${serviceForm.title.toLowerCase().replace(/\s+/g, '_')}`;
            modal.onConfirm({
                ...serviceForm,
                id: `s_${Date.now()}`,
                key,
                color: 'text-white'
            });
        }
        closeModal();
    };

    const ticketCategories = ['Teknik Destek', 'Güvenlik', 'Temizlik', 'Peyzaj', 'Bakım & Onarım'];

    if (!modal && !toast) return null;

    return (
        <div className="relative z-[100]">
            {toast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-[110] animate-fade-in">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 ${toast.type === 'success' ? 'bg-white text-black' :
                        toast.type === 'error' ? 'bg-red-900 text-white' : 'bg-dark-surface text-white'
                        }`}>
                        <span className="material-symbols-rounded">{toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
                    </div>
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
                    <div className={`bg-dark-card border border-dark-border w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-w-sm max-h-[85vh]`}>
                        <div className="p-5 border-b border-dark-border flex justify-between items-center bg-dark-surface">
                            <h3 className="font-bold text-[10px] tracking-[0.2em] uppercase text-gray-500">{modal.title || 'REGORA'}</h3>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                <span className="material-symbols-rounded text-white">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">

                            {modal.type === 'PAYMENT' && (
                                <div className="space-y-6 text-center">
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{modal.data?.description}</p>
                                    <h2 className="text-4xl font-bold text-white tracking-tighter">₺{modal.data?.amount}</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setPaymentMethod('credit_card')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${paymentMethod === 'credit_card' ? 'bg-white text-black border-white' : 'bg-dark-surface text-gray-500 border-dark-border'}`}>
                                            <span className="material-symbols-rounded">credit_card</span>
                                            <span className="text-[10px] font-bold">KART</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('bank_transfer')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${paymentMethod === 'bank_transfer' ? 'bg-white text-black border-white' : 'bg-dark-surface text-gray-500 border-dark-border'}`}>
                                            <span className="material-symbols-rounded">account_balance</span>
                                            <span className="text-[10px] font-bold">HAVALE</span>
                                        </button>
                                    </div>
                                    <button onClick={handlePaymentConfirm} disabled={isPaying} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">
                                        {isPaying ? 'İŞLENİYOR...' : 'ÖDEMEYİ TAMAMLA'}
                                    </button>
                                </div>
                            )}

                            {modal.type === 'RESERVATION' && (
                                <div className="space-y-4">
                                    <div className="bg-dark-surface p-4 rounded-2xl border border-dark-border text-center">
                                        <span className="material-symbols-rounded text-4xl text-white mb-2">{modal.data?.icon}</span>
                                        <h4 className="font-bold text-white">{modal.data?.serviceName}</h4>
                                    </div>
                                    <input type="date" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={resDate} onChange={(e) => setResDate(e.target.value)} />
                                    <input type="time" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={resTime} onChange={(e) => setResTime(e.target.value)} />
                                    <button onClick={handleResSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">REZERVE ET</button>
                                </div>
                            )}

                            {modal.type === 'REAL_ESTATE' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{modal.message}</p>
                                    <textarea placeholder="Eklemek istediğiniz notlar (Opsiyonel)" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none h-24 text-sm" value={reNote} onChange={(e) => setReNote(e.target.value)} />
                                    <button onClick={handleRESubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">DANIŞMANA İLET</button>
                                </div>
                            )}

                            {modal.type === 'SERVICE_LOGS' && (
                                <div className="space-y-3">
                                    {serviceLogs.length > 0 ? serviceLogs.map(log => (
                                        <div key={log.id} className="bg-dark-surface p-4 rounded-2xl border border-dark-border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-rounded ${log.color}`}>{log.icon}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{log.serviceName}</p>
                                                    <p className="text-[10px] text-gray-500">{log.userName} • {log.userApartment}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">{log.time}</p>
                                                <p className="text-[10px] text-gray-600">{log.date}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 text-xs py-10">Henüz bir kayıt bulunmuyor.</p>}
                                </div>
                            )}

                            {modal.type === 'TICKET_DETAIL' && (
                                <div className="space-y-4">
                                    <div className="bg-dark-surface p-4 rounded-2xl border border-dark-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{modal.data?.category}</span>
                                            <span className="text-[10px] text-gray-500">{modal.data?.date}</span>
                                        </div>
                                        <h4 className="font-bold text-white mb-2">{modal.data?.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">{modal.data?.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase px-1">Durumu Güncelle</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['open', 'in_progress', 'resolved'].map((s: any) => (
                                                <button
                                                    key={s}
                                                    onClick={() => { updateTicketStatus(modal.data.id, s); closeModal(); showToast('Durum güncellendi.', 'success'); }}
                                                    className={`py-2 rounded-xl text-[10px] font-bold border ${modal.data.status === s ? 'bg-white text-black border-white' : 'bg-dark-surface text-gray-500 border-dark-border'}`}
                                                >
                                                    {s === 'open' ? 'AÇIK' : s === 'in_progress' ? 'İŞLEMDE' : 'ÇÖZÜLDÜ'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modal.type === 'QR' && (
                                <div className="flex flex-col items-center py-4 space-y-6">
                                    <div className="bg-white p-6 rounded-3xl">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${modal.data}&color=000&bgcolor=fff`} alt="QR" className="w-40 h-40" />
                                    </div>
                                    <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">{modal.message}</p>
                                </div>
                            )}

                            {modal.type === 'TICKET' && (
                                <div className="space-y-4">
                                    {/* Category Selector */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                                        {ticketCategories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setTicketCategory(cat)}
                                                className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold border transition-all ${ticketCategory === cat
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-dark-surface text-gray-500 border-dark-border'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <input type="text" placeholder="Arıza Başlığı" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none focus:border-white text-sm" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} />
                                    <textarea placeholder="Sorunu detaylandırın..." className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none focus:border-white text-sm h-24 resize-none" value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} />
                                    <button onClick={handleTicketSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">TALEBİ GÖNDER</button>
                                </div>
                            )}

                            {modal.type === 'CREATE_ANNOUNCEMENT' && (
                                <div className="space-y-4">
                                    <select value={targetSiteId} onChange={(e) => setTargetSiteId(e.target.value)} className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white text-xs outline-none">
                                        <option value="global">Tüm Portföy</option>
                                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <input type="text" placeholder="Duyuru Başlığı" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                                    <textarea placeholder="Mesaj içeriği..." className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm h-24 resize-none" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                                    <button onClick={handleAnnouncementSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">YAYINLA</button>
                                </div>
                            )}

                            {modal.type === 'CREATE_POST' && (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Konu Başlığı" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                                    <textarea placeholder="Mesajınız..." className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm h-24 resize-none" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                                    <button onClick={handleForumSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">PAYLAŞ</button>
                                </div>
                            )}

                            {modal.type === 'CREATE_POLL' && (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Anket Sorusu" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                                    <input type="text" placeholder="Seçenekler (virgülle ayırın)" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none text-sm" value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} />
                                    <button onClick={handlePollSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">ANKETİ BAŞLAT</button>
                                </div>
                            )}

                            {modal.type === 'ADD_LICENSE_PLATE' && (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Plaka (Örn: 34AKR123)" className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white outline-none uppercase font-bold text-center text-lg" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
                                    <button onClick={handlePlateSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">PLAKAYI TANIMLA</button>
                                </div>
                            )}

                            {modal.type === 'MANAGE_SITE' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Temel Bilgiler</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">home</span>
                                                    <input type="text" placeholder="Site Adı" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-gold-500/30 transition-all font-medium" value={siteForm.name} onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })} />
                                                </div>
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">location_on</span>
                                                    <input type="text" placeholder="Şehir / Bölge" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-gold-500/30 transition-all font-medium" value={siteForm.city} onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Kapasite & Finans</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="flex gap-3">
                                                    <div className="w-1/2 space-y-1">
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase ml-1">Blok Sayısı</p>
                                                        <input type="number" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-bold" value={siteForm.blockCount} onChange={(e) => setSiteForm({ ...siteForm, blockCount: parseInt(e.target.value) || 0 })} />
                                                    </div>
                                                    <div className="w-1/2 space-y-1">
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase ml-1">Konut Sayısı</p>
                                                        <input type="number" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-bold" value={siteForm.unitCount} onChange={(e) => setSiteForm({ ...siteForm, unitCount: parseInt(e.target.value) || 0 })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase ml-1">Birim Aidat (₺)</p>
                                                    <input type="number" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-bold" value={siteForm.duesAmount} onChange={(e) => setSiteForm({ ...siteForm, duesAmount: parseInt(e.target.value) || 0 })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Görsel & Adres</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <input type="text" placeholder="Görsel URL (Unsplash vb.)" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-medium italic" value={siteForm.imageUrl || ''} onChange={(e) => setSiteForm({ ...siteForm, imageUrl: e.target.value })} />
                                                <textarea placeholder="Detaylı Adres Tarifi" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs h-20 resize-none outline-none font-medium" value={siteForm.address} onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            <div className="flex justify-between items-center px-1">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Müdür Atama</p>
                                                {siteForm.managerId && (
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase">Seçildi</span>
                                                )}
                                            </div>

                                            {/* Selected Manager display */}
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold text-xs border border-gold-500/20">
                                                        {siteForm.managerName ? siteForm.managerName.charAt(0) : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{siteForm.managerName || 'Henüz Atanmadı'}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Site Müdürlüğü</p>
                                                    </div>
                                                </div>
                                                {siteForm.managerId && (
                                                    <button
                                                        onClick={() => setSiteForm({ ...siteForm, managerId: '', managerName: '' })}
                                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <span className="material-symbols-rounded text-sm">close</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Candidate Search */}
                                            <div className="relative">
                                                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                                                <input
                                                    type="text"
                                                    placeholder="Müdür adayı ara..."
                                                    value={assignSearchTerm}
                                                    onChange={(e) => setAssignSearchTerm(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                                {allUsers
                                                    .filter(u => u.role !== UserRole.SUPER_ADMIN && (u.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(assignSearchTerm.toLowerCase())))
                                                    .map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={() => {
                                                                setSiteForm({ ...siteForm, managerId: u.id, managerName: u.name });
                                                                setAssignSearchTerm('');
                                                            }}
                                                            className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left ${siteForm.managerId === u.id ? 'border-gold-500/50 bg-gold-500/5' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-[10px]">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-white">{u.name}</p>
                                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{u.role} • @{u.username}</p>
                                                                </div>
                                                            </div>
                                                            {siteForm.managerId === u.id ? (
                                                                <span className="material-symbols-rounded text-gold-500 text-sm">check_circle</span>
                                                            ) : (
                                                                <span className="material-symbols-rounded text-gray-700 text-sm">person_add</span>
                                                            )}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSiteSubmit}
                                        className="w-full bg-gold-500 text-black font-black py-5 rounded-[24px] text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gold-500/20 active:scale-95 transition-all"
                                    >
                                        Portföye Kaydet
                                    </button>
                                </div>
                            )}

                            {modal.type === 'MANAGE_USERS' && (
                                <div className="space-y-4">
                                    {pendingUsers.length > 0 ? pendingUsers.map(u => (
                                        <div key={u.id} className="bg-dark-surface p-4 rounded-2xl border border-dark-border">
                                            <p className="text-sm font-bold text-white">{u.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{u.apartment}</p>
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={() => { approveUser(u.id); showToast('Onaylandı.', 'success'); }} className="flex-1 bg-white text-black text-[10px] font-bold py-2 rounded-lg uppercase">ONAYLA</button>
                                                <button onClick={() => { rejectUser(u.id); showToast('Reddedildi.', 'info'); }} className="flex-1 bg-dark-card border border-dark-border text-white text-[10px] font-bold py-2 rounded-lg uppercase">REDDET</button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 text-xs py-10 uppercase tracking-widest">Bekleyen onay bulunmuyor.</p>}
                                </div>
                            )}

                            {modal.type === 'CAMERA_SETTINGS' && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Vurgu Rengi</h4>
                                        <div className="flex justify-between">
                                            {['gold', 'blue', 'purple', 'emerald', 'rose'].map((t) => (
                                                <button key={t} onClick={() => setTheme(t as ThemeAccent)} className={`w-8 h-8 rounded-full border-2 transition-all ${theme === t ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: t === 'gold' ? '#fff' : t === 'blue' ? '#3b82f6' : t === 'purple' ? '#a855f7' : t === 'emerald' ? '#10b981' : '#f43f5e' }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modal.type === 'COURIER_SELECT' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] text-center mb-6">Lütfen Firma Seçiniz</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { name: 'Getir', color: 'bg-purple-600' },
                                            { name: 'Trendyol Go', color: 'bg-orange-500' },
                                            { name: 'Migros Hemen', color: 'bg-orange-600' },
                                            { name: 'Yemeksepeti', color: 'bg-rose-600' },
                                            { name: 'Tıkla Gelsin', color: 'bg-red-600' },
                                            { name: 'Dominos', color: 'bg-blue-800' },
                                            { name: 'Diğer', color: 'bg-gray-700' }
                                        ].map(brand => (
                                            <button
                                                key={brand.name}
                                                onClick={() => {
                                                    if (modal.onConfirm) modal.onConfirm(brand.name);
                                                    closeModal();
                                                }}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-dark-surface border border-dark-border hover:border-white/20 transition-all active:scale-95 group"
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${brand.color} mb-2 flex items-center justify-center text-[10px] font-bold text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                    {brand.name[0]}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">{brand.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modal.type === 'LANGUAGE_SELECT' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] text-center mb-6 text-gray-400">Uygulama Dili Seçimi</p>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'tr', label: 'Türkçe' },
                                            { id: 'en', label: 'English' }
                                        ].map((l) => (
                                            <button
                                                key={l.id}
                                                onClick={() => {
                                                    setLanguage(l.id as 'tr' | 'en');
                                                    showToast(`Dil ${l.label} olarak güncellendi.`, 'success');
                                                    closeModal();
                                                }}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] group ${language === l.id ? 'bg-white border-white' : 'bg-dark-surface border-dark-border hover:border-white/20'}`}
                                            >
                                                <span className={`text-xs font-bold uppercase tracking-wider ${language === l.id ? 'text-black' : 'text-gray-400 group-hover:text-white'}`}>{l.label}</span>
                                                {language === l.id && (
                                                    <span className="material-symbols-rounded text-black font-bold">check</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {modal.type === 'CONFIRMATION' && (
                                <div className="text-center space-y-6">
                                    <p className="text-sm text-gray-300 leading-relaxed">{modal.message}</p>
                                    <div className="flex gap-4">
                                        <button onClick={closeModal} className="flex-1 py-4 rounded-2xl border border-dark-border text-[10px] font-bold uppercase text-gray-500">İptal</button>
                                        <button onClick={() => { if (modal.onConfirm) modal.onConfirm(); closeModal(); }} className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-bold uppercase">Onayla</button>
                                    </div>
                                </div>
                            )}

                            {modal.type === 'AI_VALUATION' && (
                                <div className="space-y-8 py-4">
                                    {isValuating ? (
                                        <div className="space-y-6 text-center animate-pulse">
                                            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                                                <span className="material-symbols-rounded text-white text-4xl animate-spin">data_usage</span>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-white font-bold text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Regora AI Analiz Ediyor...</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                                                    Dairenizin konumu, piyasa verileri ve <br /> güncel trendler analiz ediliyor...
                                                </p>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 animate-progress"></div>
                                            </div>
                                        </div>
                                    ) : showValuationResult && (
                                        <div className="space-y-8 text-center animate-fade-in">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">AI Değerleme Sonucu</p>
                                                <div className="flex flex-col items-center">
                                                    <h2 className="text-4xl font-black text-white tracking-tighter italic">₺12.450.000</h2>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-rounded text-emerald-400 text-sm">trending_up</span>
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">%5 Değer Artışı (Son 30 Gün)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase mb-1">Bölge Ortalaması</p>
                                                    <p className="text-xs font-bold text-white">₺11.2M</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase mb-1">Talep Endeksi</p>
                                                    <p className="text-xs font-bold text-emerald-400">%94 Yüksek</p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                                                <p className="text-[10px] text-purple-300 font-medium leading-relaxed">
                                                    "Bu değerleme Regora AI tarafından son 30 günlük emsal satışlar baz alınarak hesaplanmıştır."
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (modal.onConfirm) modal.onConfirm({ price: '12.450.000' });
                                                    closeModal();
                                                }}
                                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-[24px] text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(124,58,237,0.3)] active:scale-95 transition-all"
                                            >
                                                Yönetime Bildir & İlan Ver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modal.type === 'USER_CREATION' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Hesap Bilgileri</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">person</span>
                                                    <input type="text" placeholder="Ad Soyad" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
                                                </div>
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">alternate_email</span>
                                                    <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} />
                                                </div>
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">lock</span>
                                                    <input type="text" placeholder="Geçici Şifre" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Yetki & Görev</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                                                    {['MANAGER', 'STAFF'].map((r) => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setAuthForm({ ...authForm, role: r as UserRole, jobTitle: r === 'MANAGER' ? 'Site Müdürü' : 'Teknik Personel' })}
                                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${authForm.role === r ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            {r === 'MANAGER' ? 'Müdür' : 'Personel'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">badge</span>
                                                    <input type="text" placeholder="Departman / Görev" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={authForm.jobTitle} onChange={(e) => setAuthForm({ ...authForm, jobTitle: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!authForm.name || !authForm.username) return showToast('Lütfen zorunlu alanları doldurun.', 'error');
                                            createAuthority(authForm);
                                            closeModal();
                                        }}
                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                                    >
                                        YETKİLİ HESABINI OLUŞTUR
                                    </button>
                                </div>
                            )}

                            {modal.type === 'ASSIGN_MANAGER' && (
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-gold-500/5 p-4 rounded-2xl border border-gold-500/10 mb-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hedef Mülk</p>
                                            <div className="flex items-center gap-2 text-gold-500">
                                                <span className="material-symbols-rounded text-sm">domain</span>
                                                <p className="text-xs font-bold">{modal.data.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mevcut Üst Yönetici</p>
                                            {modal.data.managerId ? (
                                                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-extrabold">Aktif Atama</span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold">Yönetici Yok</span>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold text-xs border border-gold-500/20">
                                                    {modal.data.managerName ? modal.data.managerName.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{modal.data.managerName || 'Henüz Atanmadı'}</p>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Site Müdürlüğü</p>
                                                </div>
                                            </div>
                                            {modal.data.managerId && (
                                                <span className="material-symbols-rounded text-emerald-500 text-sm">verified</span>
                                            )}
                                        </div>

                                        <div className="border-t border-white/5 pt-4 space-y-4">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Yeni Yönetici Seç</p>
                                            <div className="relative">
                                                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                                                <input
                                                    type="text"
                                                    placeholder="Arama yapın..."
                                                    value={assignSearchTerm}
                                                    onChange={(e) => setAssignSearchTerm(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                {allUsers
                                                    .filter(u => u.role !== UserRole.SUPER_ADMIN && (u.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(assignSearchTerm.toLowerCase())))
                                                    .map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={async () => {
                                                                await assignManager(modal.data.id, u.id);
                                                                closeModal();
                                                            }}
                                                            className={`w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-gold-500/10 hover:border-gold-500/20 transition-all text-left group ${modal.data.managerId === u.id ? 'border-gold-500/40 bg-gold-500/5' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white/5 text-gray-500 flex items-center justify-center font-bold text-xs border border-white/5 group-hover:text-gold-500">
                                                                    {u.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-white leading-tight">{u.name}</p>
                                                                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 tracking-wider">@{u.username}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-gold-500 group-hover:text-black transition-all">
                                                                <span className="material-symbols-rounded text-sm">person_add</span>
                                                            </div>
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modal.type === 'MANAGE_STAFF' && (
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                                            {['current', 'add'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setStaffSearchTerm(t === 'current' ? '' : ' ')}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${((staffSearchTerm === '') === (t === 'current')) ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    {t === 'current' ? 'Mevcut Ekip' : 'Personel Ata'}
                                                </button>
                                            ))}
                                        </div>

                                        {(staffSearchTerm === '') ? (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {allUsers.filter(u => u.siteId === modal.data.siteId && u.role === UserRole.STAFF).map(u => (
                                                    <div key={u.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between border-l-4 border-l-blue-500">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs border border-blue-500/10">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                            </div>
                                                        </div>

                                                        {/* Tab Switcher */}
                                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                                            <button
                                                                onClick={() => setPostTitle('ACTIVE')} // Reusing postTitle as a temporary tab state
                                                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(!postTitle || postTitle === 'ACTIVE') ? 'bg-white text-black' : 'text-gray-500'}`}
                                                            >
                                                                Mevcut Ekip
                                                            </button>
                                                            <button
                                                                onClick={() => setPostTitle('ADD')}
                                                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${postTitle === 'ADD' ? 'bg-white text-black' : 'text-gray-500'}`}
                                                            >
                                                                Personel Ata
                                                            </button>
                                                        </div>

                                                        {(!postTitle || postTitle === 'ACTIVE') && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aktif Personeller</p>
                                                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
                                                                        {allUsers.filter(u => u.siteId === modal.data.siteId && u.role === UserRole.STAFF).length} Kişi
                                                                    </span>
                                                                </div>

                                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {allUsers
                                                                        .filter(u => u.siteId === modal.data.siteId && u.role === UserRole.STAFF)
                                                                        .map(u => (
                                                                            <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/10">
                                                                                        {u.name.charAt(0)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-white">{u.name}</p>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <span className="bg-white/10 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">@{u.username}</span>
                                                                                            <span className="text-[9px] text-blue-400 font-bold uppercase">{u.jobTitle || 'Personel'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <button className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                                                                    <span className="material-symbols-rounded text-lg">person_remove</span>
                                                                                </button>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                    {allUsers.filter(u => u.siteId === modal.data.siteId && u.role === UserRole.STAFF).length === 0 && (
                                                                        <div className="text-center py-12 space-y-3">
                                                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                                                <span className="material-symbols-rounded text-gray-700">group_off</span>
                                                                            </div>
                                                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Henüz personel atanmadı</p>
                                                                            <button
                                                                                onClick={() => setPostTitle('ADD')}
                                                                                className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline"
                                                                            >
                                                                                Hemen Ata
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {postTitle === 'ADD' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Görev Tanımı</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {['Güvenlik', 'Kapıcı', 'Teknik Personel', 'Temizlik', 'Bahçıvan'].map((title) => (
                                                                            <button
                                                                                key={title}
                                                                                onClick={() => setSelectedJobTitle(title)}
                                                                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedJobTitle === title
                                                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                                            >
                                                                                {title}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3 border-t border-white/5 pt-4">
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Aday Seçimi</p>
                                                                    <div className="relative">
                                                                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Sakin ismi veya kullanıcı adı..."
                                                                            value={staffSearchTerm}
                                                                            onChange={(e) => setStaffSearchTerm(e.target.value)}
                                                                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:border-blue-500/40 transition-all font-medium"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                                        {allUsers
                                                                            .filter(u => u.siteId === modal.data.siteId && u.role === UserRole.RESIDENT && (u.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(staffSearchTerm.toLowerCase())))
                                                                            .map(u => (
                                                                                <button
                                                                                    key={u.id}
                                                                                    onClick={async () => {
                                                                                        await assignStaff(modal.data.siteId, u.id, selectedJobTitle);
                                                                                    }}
                                                                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-left group"
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-10 h-10 rounded-full bg-white/5 text-gray-500 flex items-center justify-center font-bold text-xs border border-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                                                                            {u.name.charAt(0)}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-bold text-white leading-tight">{u.name}</p>
                                                                                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 tracking-wider">@{u.username}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{selectedJobTitle} YAP</span>
                                                                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                                                            <span className="material-symbols-rounded text-sm">person_add</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </button>
                                                                            ))
                                                                        }
                                                                        {allUsers.filter(u => u.siteId === modal.data.siteId && u.role === UserRole.RESIDENT).length === 0 && (
                                                                            <p className="text-center py-6 text-gray-600 text-[9px] font-bold uppercase tracking-widest">Atanabilir sakin bulunamadı</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                                                    {['Teknik', 'Güvenlik', 'Temizlik', 'Bahçıvan'].map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => setSelectedJobTitle(role)}
                                                            className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase transition-all whitespace-nowrap ${selectedJobTitle === role ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Sakinlerden ekip oluştur..."
                                                        value={staffSearchTerm.trim()}
                                                        onChange={(e) => setStaffSearchTerm(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                                                    />
                                                </div>

                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {allUsers
                                                        .filter(u => u.siteId === modal.data.siteId && u.role === UserRole.RESIDENT && u.name.toLowerCase().includes(staffSearchTerm.trim().toLowerCase()))
                                                        .map(u => (
                                                            <button
                                                                key={u.id}
                                                                onClick={async () => {
                                                                    await assignStaff(modal.data.siteId, u.id, selectedJobTitle);
                                                                    setStaffSearchTerm('');
                                                                }}
                                                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-left group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-white/5 text-gray-500 flex items-center justify-center font-bold text-xs border border-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                                                        {u.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-white leading-tight">{u.name}</p>
                                                                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 tracking-wider">@{u.username}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{selectedJobTitle} YAP</span>
                                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                                        <span className="material-symbols-rounded text-sm">person_add</span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))
                                                    }
                                                    {allUsers.filter(u => u.siteId === modal.data.siteId && u.role === UserRole.RESIDENT).length === 0 && (
                                                        <p className="text-center py-6 text-gray-600 text-[9px] font-bold uppercase tracking-widest">Atanabilir sakin bulunamadı</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modal.type === 'ADD_SERVICE' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Yeni Hizmet Detayları</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">label</span>
                                                    <input type="text" placeholder="Hizmet Adı (Örn: Araç Yıkama)" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
                                                </div>
                                                <div className="relative">
                                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">description</span>
                                                    <input type="text" placeholder="Kısa Açıklama" className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-xs outline-none focus:border-blue-500/30 transition-all font-medium" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Görünüm & Buton</p>
                                            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                                <div className="flex gap-3">
                                                    <div className="w-1/2 space-y-1">
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase ml-1">İkon (Material Sym.)</p>
                                                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-bold" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} />
                                                    </div>
                                                    <div className="w-1/2 space-y-1">
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase ml-1">Buton Metni</p>
                                                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none font-bold" value={serviceForm.action} onChange={(e) => setServiceForm({ ...serviceForm, action: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                                    <span className="material-symbols-rounded text-blue-400">{serviceForm.icon}</span>
                                                    <p className="text-[9px] text-gray-400 font-medium">Bu ikon sakin ekranında görünecektir.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleServiceSubmit}
                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                                    >
                                        HİZMETİ AKTİF ET
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UIOverlay;
