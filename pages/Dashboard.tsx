
import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { AppPermission, UserRole } from '../types';
import { ShieldAlert, Car, QrCode, Bell, Package, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { user, property, openModal, showToast, logout, globalStats, hasPermission, addTicket, tickets } = useApp();
  const { t } = useTranslation();

  const handleGuestQR = async () => {
    openModal({
      type: 'QR',
      title: t('dashboard.guest_code'),
      message: 'Güvenlik taraması için bu kodu resepsiyon kamerasında okutunuz.',
      data: `REGORA-GUEST-${user.id}-${Date.now()}`
    });

    // Notify Security
    await addTicket({
      title: 'Ziyaretçi Giriş Talebi',
      description: `${user.name} (${user.apartment}) için QR kod oluşturuldu.`,
      category: 'GUEST_ACCESS',
      targetRole: UserRole.STAFF,
      requestorName: user.name
    });
  };

  const handleStaffCall = () => {
    openModal({
      type: 'TICKET',
      title: 'Hizmet Talebi Oluştur',
      onConfirm: async (data: any) => {
        await addTicket({
          title: data.title,
          description: data.description,
          category: 'MAINTENANCE',
          targetRole: UserRole.STAFF,
          requestorName: user.name
        });
      }
    });
  };

  const handleCourier = () => {
    openModal({
      type: 'COURIER_SELECT',
      title: t('dashboard.courier_notify'),
      onConfirm: async (brand: string) => {
        let finalBrand = brand;
        if (brand === 'Diğer') {
          const otherBrand = prompt('Lütfen firma adını yazınız:');
          if (!otherBrand) return;
          finalBrand = otherBrand;
        }

        await addTicket({
          title: 'Kurye Bekleniyor',
          description: `${finalBrand} kuryesi için güvenlik onayı verildi.`,
          category: 'GUEST_ACCESS',
          targetRole: UserRole.STAFF,
          requestorName: user.name
        });
        showToast(`${finalBrand} kuryesi için güvenlik onayı verildi.`, 'success');
      }
    });
  };

  const handlePanic = async () => {
    if (confirm('Site Güvenliği aranıyor, emin misiniz?')) {
      await addTicket({
        title: 'ACİL DURUM / PANİK SİNYALİ',
        description: `${user.name} (${user.apartment}) ACİL DURUM SİNYALİ GÖNDERDİ!`,
        category: 'EMERGENCY',
        targetRole: UserRole.STAFF,
        requestorName: user.name
      });
      showToast('Güvenlik birimine acil durum sinyali gönderildi!', 'error');
    }
  };

  const handleTaxi = async () => {
    await addTicket({
      title: 'VIP Ulaşım Talebi',
      description: `${user.name} (${user.apartment}) için taksi talep edildi.`,
      category: 'TAXI_REQUEST',
      targetRole: UserRole.STAFF,
      requestorName: user.name
    });
    showToast('Taksi çağrıldı, kapıya yönlendiriliyor.', 'info');
  };

  const activeUserTickets = tickets.filter(t => t.userId === user.id && t.status !== 'resolved');
  const latestTicket = activeUserTickets[0];

  if (hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD)) {
    return (
      <div className="space-y-6 animate-fade-in pb-24">
        <div className="flex justify-between items-center px-2">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.admin_panel')}</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('dashboard.financial_summary')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={logout} className="p-2 bg-dark-card border border-dark-border rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-rounded text-lg">logout</span>
            </button>
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/20 object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card gradient className="col-span-2 border-white/10">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{t('dashboard.budget_liquidity')}</p>
              <h2 className="text-4xl font-bold text-white tracking-tighter">₺{globalStats.totalBalance.toLocaleString()}</h2>
              <div className="flex gap-3 mt-4">
                <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded">{t('dashboard.income')}: ₺{globalStats.monthlyIncome.toLocaleString()}</span>
                <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded">{t('dashboard.expense')}: ₺{globalStats.monthlyExpense.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 border-white/5">
            <div className="flex flex-col h-full justify-between">
              <span className="material-symbols-rounded text-white text-xl">confirmation_number</span>
              <div>
                <span className="text-2xl font-bold text-white">{globalStats.activeTickets}</span>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{t('dashboard.technical_ticket')}</p>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 border-white/5">
            <div className="flex flex-col h-full justify-between">
              <span className="material-symbols-rounded text-white text-xl">group</span>
              <div>
                <span className="text-2xl font-bold text-white">{globalStats.totalResidents}</span>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{t('dashboard.active_resident')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <div className="flex justify-between items-center px-2">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.welcome')},</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="p-2 bg-dark-card border border-dark-border rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-rounded text-lg">logout</span>
          </button>
          <div className="w-12 h-12 rounded-full border border-white/20 p-0.5">
            <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-dark-surface py-2.5 px-5 rounded-full w-fit border border-dark-border mx-2">
        <span className="material-symbols-rounded text-white text-lg font-variation-filled">location_on</span>
        <span className="text-xs font-bold text-gray-300 tracking-wide">{property.name}</span>
      </div>

      {latestTicket && (
        <div className="mx-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {latestTicket.status === 'open' ? <Clock className="w-4 h-4 text-orange-400" /> : <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {latestTicket.status === 'open' ? 'Talep İletildi' : 'İşlem Yapılıyor'}
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase">{latestTicket.category}</span>
          </div>
          <p className="text-xs font-bold text-white mb-1">{latestTicket.title}</p>
          <p className="text-[10px] text-gray-400 font-medium">
            {latestTicket.status === 'open' ? 'Görevli bekleniyor...' : 'Ekiplerimiz yola çıktı / ilgileniyor.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card gradient className="col-span-1 border-white/10">
          <div className="flex flex-col h-full justify-between gap-6">
            <span className="material-symbols-rounded text-white p-2 bg-white/10 rounded-xl w-fit">payments</span>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t('dashboard.dues_debt')}</p>
              <p className="text-2xl font-bold text-white mt-1">₺{Math.abs(user.balance).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 border-white/5">
          <div className="flex flex-col h-full justify-between gap-6">
            <span className="material-symbols-rounded text-gray-400 p-2 bg-white/5 rounded-xl w-fit">notifications</span>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t('dashboard.new_announcement')}</p>
              <p className="text-2xl font-bold text-white mt-1">1</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">{t('dashboard.quick_access')}</h2>
        <div className="grid grid-cols-2 gap-3 px-2">
          {/* Ziyaretçi Kodu */}
          <button onClick={handleGuestQR} className="flex flex-col gap-3 bg-[#121212] border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-all active:scale-95 text-left group">
            <QrCode className="text-white w-7 h-7" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">{t('dashboard.guest_code')}</p>
          </button>

          {/* Kurye Bildir */}
          <button onClick={handleCourier} className="flex flex-col gap-3 bg-[#121212] border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-all active:scale-95 text-left group">
            <Package className="text-white w-7 h-7" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">{t('dashboard.courier_notify')}</p>
          </button>

          {/* Personel Çağır */}
          <button onClick={handleStaffCall} className="flex flex-col gap-3 bg-[#121212] border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-all active:scale-95 text-left group">
            <Bell className="text-white w-7 h-7" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">{t('dashboard.staff_call')}</p>
          </button>

          {/* Taksi Çağır */}
          <button onClick={handleTaxi} className="flex flex-col gap-3 bg-[#121212] border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-all active:scale-95 text-left group">
            <Car className="text-white w-7 h-7" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">{t('dashboard.taxi_call')}</p>
          </button>

          {/* Acil Durum (Panic Button) */}
          <button onClick={handlePanic} className="col-span-2 flex flex-row items-center justify-center gap-3 bg-[#121212] border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-3xl p-5 hover:bg-red-500/10 transition-all active:scale-95 text-left group">
            <ShieldAlert className="text-white w-7 h-7 group-hover:text-red-400 transition-colors" />
            <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-wider">{t('dashboard.panic_button')}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
