
import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../../components/Card';
import { ServiceItem } from '../../types';
import { useTranslation } from 'react-i18next';

const ServiceSettings: React.FC = () => {
    const { property, showToast, updatePropertyFeature, services, openModal, addNewService } = useApp();
    const { t } = useTranslation();

    const handleToggleFeature = (key: string, title: string) => {
        const currentValue = property.features[key] || false;
        updatePropertyFeature(key, !currentValue);
        showToast(`${title} durumu güncellendi.`, 'info');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <div className="px-2 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Hizmet Ayarları</h1>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{property.name} Kontrol Paneli</p>
                </div>
                <button
                    onClick={() => openModal({
                        type: 'ADD_SERVICE',
                        title: 'YENİ HİZMET TANIMLA',
                        onConfirm: (data) => {
                            addNewService(data);
                            showToast(`${data.title} başarıyla eklendi ve aktif edildi.`, 'success');
                        }
                    })}
                    className="px-4 py-2.5 rounded-2xl bg-white text-black flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all group"
                >
                    <span className="material-symbols-rounded text-sm group-hover:rotate-180 transition-transform duration-500">add</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hizmet Ekle</span>
                </button>
            </div>

            <div className="space-y-3">
                <Card className="divide-y divide-dark-border bg-[#0A0A0A] border-white/5">
                    {services.map((item) => {
                        const isActive = property.features[item.key] || false;
                        return (
                            <div key={item.key} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} ${!isActive && 'opacity-20 grayscale'}`}>
                                        <span className="material-symbols-rounded text-2xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm uppercase tracking-tight ${isActive ? 'text-white' : 'text-gray-600'}`}>{item.title}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.key.replace('has_', '')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleFeature(item.key, item.title)}
                                    className={`w-14 h-7 rounded-full transition-all relative ${isActive ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-800'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-1 left-1 ${isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        );
                    })}
                </Card>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] space-y-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bilgi</p>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Buradan kapattığınız hizmetler, sakinlerin uygulama ekranından anında kaldırılacaktır.
                    Yeni hizmetler eklemek için REGORA desteği ile iletişime geçebilirsiniz.
                </p>
            </div>
        </div>
    );
};

export default ServiceSettings;
