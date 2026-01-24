
import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { ServiceItem, AppPermission, Ticket } from '../types';

const Services: React.FC = () => {
  const { property, openModal, showToast, logActivity, user, addServiceLog, updatePropertyFeature, services, addTicket, hasPermission, cameraPermissions } = useApp();

  // --- ADMIN HANDLERS ---
  const handleToggleFeature = (key: any, title: string) => {
      const currentValue = property.features[key];
      updatePropertyFeature(key, !currentValue);
      if (!currentValue) {
          showToast(`${title} kullanıma açıldı.`, 'success');
      } else {
          showToast(`${title} kullanıma kapatıldı.`, 'info');
      }
  };

  const handleViewLogs = () => {
      openModal({
          type: 'SERVICE_LOGS',
          title: 'Tesis Kullanım Kayıtları',
          message: 'Sakinlerin tesis ve hizmet kullanım detayları.'
      });
  };

  const handleAddService = () => {
      openModal({
          type: 'ADD_SERVICE',
          title: 'Yeni Hizmet Ekle'
      });
  };

  // --- RESIDENT HANDLERS ---
  const handleServiceAction = (service: ServiceItem) => {
    // Log the usage first
    // addServiceLog(service.title, service.icon, service.color); // Moved to confirmation

    // Simulating different actions based on service type
    if (service.key === 'has_guest_kiosk') {
        openModal({
            type: 'QR',
            title: 'Kiosk Giriş Kodu',
            message: 'Bu kodu kiosk ekranına okutun.',
            data: `KIOSK-${Date.now()}`
        });
        addServiceLog(service.title, service.icon, service.color);
        return;
    }

    if (service.key === 'has_pool' || service.key === 'has_freight_elevator' || service.key === 'has_gym') {
        // Open Reservation Modal
        openModal({
            type: 'RESERVATION',
            title: `${service.title} Rezervasyonu`,
            message: `Lütfen ${service.title} kullanımı için tarih ve saat seçiniz.`,
            data: { serviceName: service.title, icon: service.icon, color: service.color },
            onConfirm: (data) => {
                showToast(`${data.date} ${data.time} için rezervasyon talebi oluşturuldu.`, 'success');
                addServiceLog(service.title, service.icon, service.color);
                logActivity('system', 'Hizmet Rezervasyonu', `${user.name}: ${service.title} - ${data.date} ${data.time}`);
            }
        });
        return;
    }

    if (service.key === 'has_parking_recognition') {
        openModal({
            type: 'ADD_LICENSE_PLATE',
            title: 'Plaka Tanımlama',
            message: 'Otopark geçiş sistemi için araç plakanızı giriniz.',
            onConfirm: () => {
                // Confirmation handled in modal
                addServiceLog(service.title, service.icon, service.color);
            }
        });
        return;
    }

     // Generic response for dynamic services
     showToast(`${service.title} hizmeti için işlem başlatıldı.`, 'success');
     addServiceLog(service.title, service.icon, service.color);
  };

  const handleTicket = () => {
      openModal({
          type: 'TICKET',
          title: 'Yeni Arıza Talebi',
          onConfirm: (data: any) => {
              // Map friendly category names to internal types
              let categoryType: Ticket['category'] = 'maintenance';
              
              switch (data.category) {
                  case 'Güvenlik': categoryType = 'security'; break;
                  case 'Temizlik': categoryType = 'cleaning'; break;
                  case 'Peyzaj': categoryType = 'landscape'; break;
                  case 'Asansör': categoryType = 'technical'; break;
                  case 'Otopark': categoryType = 'technical'; break;
                  case 'Elektrik Arızası': categoryType = 'maintenance'; break;
                  case 'Su Tesisatı': categoryType = 'maintenance'; break;
                  default: categoryType = 'maintenance';
              }
              
              // Use the custom title if provided, otherwise fallback to category name
              const ticketTitle = data.title && data.title.trim() !== '' ? data.title : data.category;

              addTicket({
                  title: ticketTitle,
                  description: data.description,
                  category: categoryType,
                  requestorName: user.name,
                  attachment: data.attachment
              });
              
              showToast('Arıza talebiniz teknik ekibe iletildi.', 'success');
              logActivity('ticket', 'Yeni Arıza Talebi', `${user.name}: ${ticketTitle}`);
          }
      });
  };

  const handleRateServices = () => {
      openModal({
          type: 'RATE_SERVICES',
          title: 'Günün Hizmetlerini Puanla'
      });
  };

  const handleRealEstate = (type: 'sell' | 'rent') => {
    openModal({
        type: 'REAL_ESTATE',
        title: type === 'sell' ? 'Daire Satış Başvurusu' : 'Daire Kiralama Başvurusu',
        message: 'Uzman emlak danışmanlarımız mülkünüzün değerlemesi için sizinle iletişime geçecektir.',
        data: { type },
        onConfirm: () => {
            showToast('Başvurunuz alındı. Danışmanımız en kısa sürede arayacak.', 'success');
            const title = type === 'sell' ? 'Satılık Daire İlanı' : 'Kiralık Daire İlanı';
            const desc = `${user.name} dairesini ${type === 'sell' ? 'satmak' : 'kiralamak'} istiyor.`;
            logActivity('real_estate', title, desc);
        }
    });
  };

  const handleVirtualTour = () => {
      if (cameraPermissions.virtualTour) {
           openModal({
               type: 'QR', // Generic info modal usage
               title: 'Sanal Tur Başlatılıyor',
               message: 'AR modülü yükleniyor. Lütfen kameranızı odaya doğrultun.',
               data: 'AR-START'
           });
      } else {
          showToast('Sanal tur için kamera izni gerekiyor. Ayarlardan açabilirsiniz.', 'error');
      }
  };
  
  const handleViewHistory = () => {
      openModal({
          type: 'SERVICE_LOGS',
          title: 'Hizmet Geçmişim',
          message: 'Kullandığınız tesislerin ve hizmetlerin kaydı.'
      });
  };

  // --- RENDER FOR ADMIN ---
  if (hasPermission(AppPermission.MANAGE_FACILITIES)) {
      return (
        <div className="space-y-6 animate-fade-in pb-24">
            <div className="px-2 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hizmet Yönetimi</h1>
                    <p className="text-gray-400 text-sm">Tesis Özelliklerini Yapılandır</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleAddService}
                        className="px-3 py-1.5 rounded-lg bg-gold-500 text-black text-xs font-bold hover:bg-gold-400 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-rounded text-sm">add</span>
                        Ekle
                    </button>
                    <button 
                        onClick={handleViewLogs}
                        className="px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                        Kayıtlar
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
                                                <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold">AKTİF</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 rounded bg-dark-surface text-gray-600 text-[10px] font-bold">PASİF</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Sakinler {isActive ? 'görebiliyor' : 'göremiyor'}</p>
                                    </div>
                                </div>
                                
                                {/* Toggle Switch */}
                                <button 
                                    onClick={() => handleToggleFeature(item.key, item.title)}
                                    className={`w-12 h-7 rounded-full transition-colors duration-300 relative focus:outline-none ${
                                        isActive ? 'bg-green-500' : 'bg-gray-700'
                                    }`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 absolute top-0.5 left-0.5 ${
                                        isActive ? 'translate-x-5' : 'translate-x-0'
                                    }`}></div>
                                </button>
                            </div>
                        );
                    })}
                </Card>
            </div>
            
            <div className="px-4 py-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-3 items-start">
                <span className="material-symbols-rounded text-blue-400">info</span>
                <p className="text-xs text-blue-200">
                    Yeni bir hizmet eklediğinizde, bu hizmet varsayılan olarak "Aktif" şekilde listeye eklenir.
                </p>
            </div>
        </div>
      );
  }

  // --- RENDER FOR RESIDENT ---
  // Filter services based on property configuration
  const availableServices = services.filter(service => property.features[service.key]);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="px-2 flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-white">{property.name} Hizmetleri</h1>
            <p className="text-gray-400 text-sm">Site olanaklarına erişim</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleRateServices}
                className="px-3 py-1.5 rounded-lg bg-gold-500 text-black text-xs font-bold hover:bg-gold-400 transition-colors flex items-center gap-1"
            >
                <span className="material-symbols-rounded text-sm">star</span>
                Puanla
            </button>
            <button 
                onClick={handleViewHistory}
                className="px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
                Geçmişim
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {availableServices.length > 0 ? (
          availableServices.map((service) => (
            <Card key={service.id} className="flex items-center justify-between group">
               <div className="flex items-center gap-4">
                 <div className={`w-14 h-14 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center ${service.color} group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-rounded text-3xl">{service.icon}</span>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-gray-100">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                 </div>
               </div>
               <button 
                onClick={() => handleServiceAction(service)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-gold-400 transition-colors active:scale-95"
               >
                  {service.action}
               </button>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
             Bu sitede şu an erişilebilir dijital hizmet bulunmamaktadır.
          </div>
        )}
      </div>

      {/* Real Estate Section */}
      <div className="mt-2">
        <h2 className="text-lg font-bold px-2 mb-4">Mülk Yönetimi</h2>
        <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-1 bg-gradient-to-br from-indigo-900/20 to-dark-card border-indigo-500/20 active:scale-95 transition-transform" onClick={() => handleRealEstate('sell')}>
                <div className="flex flex-col items-center text-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <span className="material-symbols-rounded text-2xl">real_estate_agent</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">Dairemi Sat</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Değerleme & İlan</p>
                    </div>
                </div>
            </Card>
            <Card className="col-span-1 bg-gradient-to-br from-teal-900/20 to-dark-card border-teal-500/20 active:scale-95 transition-transform" onClick={() => handleRealEstate('rent')}>
                <div className="flex flex-col items-center text-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                        <span className="material-symbols-rounded text-2xl">key</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">Dairemi Kirala</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Kiracı Bul</p>
                    </div>
                </div>
            </Card>
            {/* New Virtual Tour Card */}
            <Card className="col-span-2 bg-gradient-to-r from-purple-900/20 to-dark-card border-purple-500/20 active:scale-95 transition-transform" onClick={handleVirtualTour}>
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <span className="material-symbols-rounded text-2xl">view_in_ar</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">3D Sanal Tur</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Evinizi AR ile görüntüleyin</p>
                    </div>
                     <span className="material-symbols-rounded text-gray-500 ml-auto">chevron_right</span>
                </div>
            </Card>
        </div>
      </div>

      {/* Maintenance Ticket Section - Always Available */}
      <div className="mt-4">
         <h2 className="text-lg font-bold px-2 mb-4">Bakım & Destek</h2>
         <Card className="bg-gradient-to-r from-red-900/20 to-dark-card border-red-500/20">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-red-400">Arıza Bildir</h3>
                    <p className="text-xs text-gray-400 mt-1">Teknik ekip, temizlik veya güvenlik</p>
                </div>
                <button 
                    onClick={handleTicket}
                    className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/20 active:scale-90 transition-transform"
                >
                    <span className="material-symbols-rounded">add</span>
                </button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Services;
