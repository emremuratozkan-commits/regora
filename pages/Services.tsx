import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { ServiceItem, AppPermission, Ticket } from '../types';
import { useTranslation } from 'react-i18next';

const Services: React.FC = () => {
    const { property, openModal, showToast, logActivity, user, addServiceLog, updatePropertyFeature, services, addTicket, hasPermission, cameraPermissions } = useApp();
    const { t } = useTranslation();

    // --- ADMIN HANDLERS ---
    const handleToggleFeature = (key: any, title: string) => {
        const currentValue = property.features[key];
        updatePropertyFeature(key, !currentValue);
        showToast(`${title} ${t('common.status_updated')}`, 'info');
    };

    const handleViewLogs = () => {
        openModal({
            type: 'SERVICE_LOGS',
            title: t('services.usage_logs'),
            message: t('services.usage_logs_desc')
        });
    };

    const handleAddService = () => {
        openModal({
            type: 'ADD_SERVICE',
            title: t('services.add_service')
        });
    };

    // --- RESIDENT HANDLERS ---
    const handleServiceAction = (service: ServiceItem) => {
        if (service.key === 'has_guest_kiosk') {
            openModal({
                type: 'QR',
                title: 'KIOSK ACCESS',
                message: 'Scan this code at the kiosk.',
                data: `KIOSK-${Date.now()}`
            });
            addServiceLog(service.title, service.icon, service.color);
            return;
        }

        if (service.key === 'has_pool' || service.key === 'has_freight_elevator' || service.key === 'has_gym') {
            openModal({
                type: 'RESERVATION',
                title: service.title,
                message: `${service.title} reservation request.`,
                data: { serviceName: service.title, icon: service.icon, color: service.color },
                onConfirm: (data) => {
                    showToast(`${data.date} ${data.time} for ${service.title} reserved.`, 'success');
                    addServiceLog(service.title, service.icon, service.color);
                }
            });
            return;
        }

        if (service.key === 'has_parking_recognition') {
            openModal({
                type: 'ADD_LICENSE_PLATE',
                title: 'Parking Recognition',
                message: 'Enter your license plate.',
                onConfirm: () => {
                    addServiceLog(service.title, service.icon, service.color);
                }
            });
            return;
        }

        showToast(`${service.title} action initiated.`, 'success');
        addServiceLog(service.title, service.icon, service.color);
    };

    const handleTicket = () => {
        openModal({
            type: 'TICKET',
            title: t('services.new_ticket'),
            onConfirm: (data: any) => {
                let categoryType: Ticket['category'] = 'maintenance';
                const ticketTitle = data.title && data.title.trim() !== '' ? data.title : data.category;

                addTicket({
                    title: ticketTitle,
                    description: data.description,
                    category: categoryType,
                    requestorName: user.name,
                    attachment: data.attachment
                });

                showToast(t('services.ticket_success'), 'success');
                logActivity('ticket', 'Technical Ticket', `${user.name}: ${ticketTitle}`);
            }
        });
    };

    const handleRateServices = () => {
        openModal({
            type: 'RATE_SERVICES',
            title: 'Rate Today\'s Services'
        });
    };

    const handleRealEstate = (type: 'sell' | 'rent') => {
        openModal({
            type: 'REAL_ESTATE',
            title: type === 'sell' ? 'Property Sale Application' : 'Property Rental Application',
            message: 'Our experts will contact you for valuation.',
            data: { type },
            onConfirm: () => {
                showToast('Application received.', 'success');
                logActivity('real_estate', type === 'sell' ? 'Sale' : 'Rent', `${user.name} application`);
            }
        });
    };

    const handleVirtualTour = () => {
        if (cameraPermissions.virtualTour) {
            openModal({
                type: 'QR',
                title: 'Virtual Tour',
                message: 'AR Module loading...',
                data: 'AR-START'
            });
        } else {
            showToast('Camera permission required.', 'error');
        }
    };

    const handleViewHistory = () => {
        openModal({
            type: 'SERVICE_LOGS',
            title: 'Service History',
            message: 'History of your facility usage.'
        });
    };

    // --- RENDER FOR ADMIN ---
    if (hasPermission(AppPermission.MANAGE_FACILITIES)) {
        return (
            <div className="space-y-6 animate-fade-in pb-24">
                <div className="px-2 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('services.admin_title')}</h1>
                        <p className="text-gray-400 text-sm">Property Configuration</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAddService} className="px-3 py-1.5 rounded-lg bg-gold-500 text-black text-xs font-bold hover:bg-gold-400 transition-colors flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm">add</span>
                            Add
                        </button>
                        <button onClick={handleViewLogs} className="px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-gray-300 hover:text-white transition-colors">
                            Logs
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Card className="divide-y divide-dark-border">
                        {services.map((item) => {
                            const isActive = property.features[item.key];
                            return (
                                <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-dark-surface border border-dark-border ${item.color} ${!isActive && 'opacity-50 grayscale'}`}>
                                            <span className="material-symbols-rounded text-xl">{item.icon}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-sm ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>{item.title}</p>
                                                {isActive ? (
                                                    <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Active</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded bg-dark-surface text-gray-600 text-[10px] font-bold uppercase">Passive</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleFeature(item.key, item.title)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </Card>
                </div>
            </div>
        );
    }

    // --- RENDER FOR RESIDENT ---
    const availableServices = services.filter(service => property.features[service.key]);

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            <div className="px-2 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{t('services.title')}</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleRateServices} className="px-3 py-1.5 rounded-lg bg-gold-500 text-black text-xs font-bold hover:bg-gold-400">Rate</button>
                    <button onClick={handleViewHistory} className="px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-xs text-gray-300">History</button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('services.my_services')}</h2>
                <div className="grid grid-cols-1 gap-4 px-2">
                    {availableServices.length > 0 ? (
                        availableServices.map((service) => (
                            <Card key={service.id} className="flex items-center justify-between group h-full bg-[#121212]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center ${service.color}`}>
                                        <span className="material-symbols-rounded text-3xl">{service.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-100">{service.title}</h3>
                                        <p className="text-sm text-gray-500">{service.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleServiceAction(service)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase font-bold text-gold-400">
                                    {service.action}
                                </button>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 text-xs uppercase tracking-widest">NO SERVICES AVAILABLE</div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('services.technical_support')}</h2>
                <div className="px-2">
                    <Card className="flex items-center justify-between group cursor-pointer bg-[#121212]" onClick={handleTicket}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                                <span className="material-symbols-rounded">support_agent</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{t('services.new_ticket')}</p>
                                <p className="text-[10px] text-gray-500 uppercase">24/7 SUPPORT</p>
                            </div>
                        </div>
                        <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Services;
