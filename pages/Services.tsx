
import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { ServiceItem, AppPermission, Ticket } from '../types';
import { useTranslation } from 'react-i18next';
import ServiceSettings from './Manager/ServiceSettings';

const Services: React.FC = () => {
    const { property, openModal, showToast, logActivity, user, addServiceLog, updatePropertyFeature, services, addTicket, hasPermission } = useApp();
    const { t } = useTranslation();
    const [showTour, setShowTour] = React.useState(false);

    // --- VIEW HISTORY ---
    const handleViewHistory = () => {
        openModal({
            type: 'SERVICE_LOGS',
            title: 'Hizmet Geçmişi',
            message: 'Tesis kullanım geçmişiniz.'
        });
    };

    // --- RENDER FOR ADMIN ---
    if (hasPermission(AppPermission.MANAGE_FACILITIES)) {
        return <ServiceSettings />;
    }

    // --- RESIDENT HANDLERS ---
    const handleServiceAction = (service: ServiceItem) => {
        if (service.key === 'has_guest_kiosk') {
            openModal({
                type: 'QR',
                title: 'KIOSK ERİŞİMİ',
                message: 'Kiosktaki okuyucuya okutun.',
                data: `KIOSK-${Date.now()}`
            });
            addServiceLog(service.title, service.icon, service.color);
            return;
        }

        if (service.key === 'has_pool' || service.key === 'has_gym' || service.key === 'has_freight_elevator') {
            openModal({
                type: 'RESERVATION',
                title: service.title,
                message: `${service.title} rezervasyon talebi.`,
                data: { serviceName: service.title, icon: service.icon, color: service.color },
                onConfirm: (data: any) => {
                    showToast(`${data.date} ${data.time} için ${service.title} rezerve edildi.`, 'success');
                    addServiceLog(service.title, service.icon, service.color);

                    addTicket({
                        title: `${service.title} Rezervasyonu`,
                        description: `${user.name} tarafından ${data.date} ${data.time} için rezervasyon talebi.`,
                        category: 'FACILITY_RESERVE',
                        requestorName: user.name
                    });
                }
            });
            return;
        }

        if (service.key === 'has_parking_recognition') {
            openModal({
                type: 'ADD_LICENSE_PLATE',
                title: 'Plaka Tanıma',
                message: 'Plakanızı girin.',
                onConfirm: () => {
                    addServiceLog(service.title, service.icon, service.color);
                }
            });
            return;
        }

        if (service.key === 'has_taxi') {
            addTicket({
                title: 'Taksi Talebi',
                description: `${user.name} için taksi çağrısı yapıldı.`,
                category: 'TAXI_REQUEST',
                requestorName: user.name
            });
            showToast('Taksi talebiniz güvenliğe iletildi.', 'success');
            addServiceLog(service.title, service.icon, service.color);
            return;
        }

        if (service.key === 'has_vale') {
            addTicket({
                title: 'Vale / Araç Çağrı',
                description: `${user.name} aracını talep ediyor.`,
                category: 'VALE',
                requestorName: user.name
            });
            showToast('Araç talebiniz valeye iletildi.', 'success');
            addServiceLog(service.title, service.icon, service.color);
            return;
        }

        if (service.key === 'has_concierge') {
            openModal({
                type: 'TICKET',
                title: 'Concierge Talebi',
                onConfirm: (data: any) => {
                    addTicket({
                        title: data.title || 'Concierge Talebi',
                        description: data.description,
                        category: 'CONCIERGE',
                        requestorName: user.name
                    });
                    showToast('Talebiniz concierge ekibine iletildi.', 'success');
                }
            });
            return;
        }

        showToast(`${service.title} işlemi başlatıldı.`, 'success');
        addServiceLog(service.title, service.icon, service.color);
    };

    const handleTicket = () => {
        openModal({
            type: 'TICKET',
            title: t('services.new_ticket'),
            onConfirm: (data: any) => {
                addTicket({
                    title: data.title || 'Destek Talebi',
                    description: data.description,
                    category: 'technical',
                    requestorName: user.name,
                    attachment: data.attachment
                });
                showToast(t('services.ticket_success'), 'success');
                logActivity('ticket', 'Teknik Destek', `${user.name} talep oluşturdu.`);
            }
        });
    };

    const availableServices = services.filter(service => property.features[service.key]);

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            <div className="px-2 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">{t('services.title')}</h1>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Premium Yaşam Hizmetleri</p>
                </div>
                <button onClick={handleViewHistory} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-rounded">history</span>
                </button>
            </div>

            {/* AI Premium Section - Always Top */}
            <div className="px-2">
                <Card className="relative overflow-hidden group bg-[#0A0A0A] border-purple-500/30 hover:border-purple-500/60 transition-all duration-700 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] group-hover:bg-purple-600/30 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] group-hover:bg-blue-600/20 transition-all duration-700"></div>

                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(124,58,237,0.4)] ring-4 ring-purple-500/20">
                                    <span className="material-symbols-rounded text-4xl animate-pulse">psychology</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter">REGORA AI</h3>
                                        <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-[8px] font-black uppercase tracking-widest animate-bounce">Live</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest opacity-80">Yapay Zeka Destekli Değerleme</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Mülk Değeri</p>
                                <p className="text-lg font-black text-white italic">₺12.450.000</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Piyasa Trendi</p>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-rounded text-emerald-400 text-sm">trending_up</span>
                                    <p className="text-lg font-black text-emerald-400 italic">%5 Artış</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => openModal({
                                type: 'AI_VALUATION',
                                title: 'REGORA AI DEĞERLEME',
                                onConfirm: (data: any) => {
                                    showToast('Değerleme raporunuz müdür onayına sunuldu', 'success');
                                    addTicket({
                                        title: 'Mülk Satış / Ekspertiz Talebi',
                                        description: `${user.name} tarafından AI değerleme üzerinden satış onayı istendi. Değer: ₺${data.price}`,
                                        category: 'VALUATION',
                                        requestorName: user.name
                                    });
                                }
                            })}
                            className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 hover:text-white transition-all shadow-[0_15px_35px_rgba(0,0,0,0.5)] active:scale-95"
                        >
                            Dairemi Değerle / İlan Ver
                        </button>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-2 italic">Aktif Hizmetler ({availableServices.length})</h2>
                <div className="grid grid-cols-1 gap-4 px-2">
                    {availableServices.length > 0 ? (
                        availableServices.map((service) => (
                            <Card key={service.id} className="flex items-center justify-between group h-full bg-[#111111] border-white/5 hover:border-white/10 transition-all p-5">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-rounded text-3xl">{service.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-tight">{service.title}</h3>
                                        <p className="text-[11px] text-gray-500 font-medium mt-1">{service.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleServiceAction(service)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] uppercase font-black text-white hover:bg-white hover:text-black transition-all">
                                    {service.action}
                                </button>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <span className="material-symbols-rounded text-4xl text-gray-800 mb-2">dashboard_customize</span>
                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Henüz bir hizmet aktif edilmedi</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 px-2">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Ekstra Hizmetler</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col gap-4 bg-[#111111] border-white/5 hover:border-blue-500/30 transition-all group" onClick={() => setShowTour(true)}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <span className="material-symbols-rounded text-2xl">view_in_ar</span>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-tight">360 Tur</h3>
                                <p className="text-[9px] text-gray-500 font-medium">Sanal Gezinti</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="flex flex-col gap-4 bg-[#111111] border-white/5 hover:border-emerald-500/30 transition-all group" onClick={handleTicket}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-rounded text-2xl">support_agent</span>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-tight">Yardım</h3>
                                <p className="text-[9px] text-gray-500 font-medium">7/24 Destek</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {showTour && (
                <div className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col">
                    <button onClick={() => setShowTour(false)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80" alt="Tour" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-8">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto"></div>
                                <p className="text-white font-black uppercase tracking-widest text-sm italic">Sanal Tur Yükleniyor...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
