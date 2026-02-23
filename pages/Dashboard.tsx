
import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { AppPermission } from '../types';

const Dashboard: React.FC = () => {
  const { user, property, openModal, showToast, logout, globalStats, hasPermission } = useApp();

  const handleGuestQR = () => {
    openModal({
      type: 'QR',
      title: 'Ziyaretçi Geçiş Protokolü',
      message: 'Güvenlik taraması için bu kodu resepsiyon kamerasında okutunuz.',
      data: `REGORA-GUEST-${user.id}-${Date.now()}`
    });
  };

  const handleTaxi = () => {
    showToast('VIP Taksi adresinize yönlendiriliyor...', 'info');
  };

  if (hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD)) {
    return (
      <div className="space-y-6 animate-fade-in pb-24">
        <div className="flex justify-between items-center px-2">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">YÖNETİCİ TERMİNALİ</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Portföy Özeti</h1>
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
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Kurumsal Likidite</p>
              <h2 className="text-4xl font-bold text-white tracking-tighter">₺{globalStats.totalBalance.toLocaleString()}</h2>
              <div className="flex gap-3 mt-4">
                <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded">GELİR: ₺{globalStats.monthlyIncome.toLocaleString()}</span>
                <span className="text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded">GİDER: ₺{globalStats.monthlyExpense.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 border-white/5">
            <div className="flex flex-col h-full justify-between">
              <span className="material-symbols-rounded text-white text-xl">confirmation_number</span>
              <div>
                <span className="text-2xl font-bold text-white">{globalStats.activeTickets}</span>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Teknik Talep</p>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 border-white/5">
            <div className="flex flex-col h-full justify-between">
              <span className="material-symbols-rounded text-white text-xl">group</span>
              <div>
                <span className="text-2xl font-bold text-white">{globalStats.totalResidents}</span>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Aktif Sakin</p>
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
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">HOŞ GELDİNİZ,</p>
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

      <div className="grid grid-cols-2 gap-4">
        <Card gradient className="col-span-1 border-white/10">
          <div className="flex flex-col h-full justify-between gap-6">
            <span className="material-symbols-rounded text-white p-2 bg-white/10 rounded-xl w-fit">payments</span>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Cari Borç</p>
              <p className="text-2xl font-bold text-white mt-1">₺{Math.abs(user.balance).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="col-span-1 border-white/5">
          <div className="flex flex-col h-full justify-between gap-6">
            <span className="material-symbols-rounded text-gray-400 p-2 bg-white/5 rounded-xl w-fit">notifications</span>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Yeni Duyuru</p>
              <p className="text-2xl font-bold text-white mt-1">1</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 gap-3 px-2">
          <button onClick={handleGuestQR} className="flex flex-col gap-3 bg-dark-surface border border-dark-border rounded-3xl p-5 hover:bg-dark-card transition-colors active:scale-95 text-left">
            <span className="material-symbols-rounded text-white text-3xl">qr_code_scanner</span>
            <p className="text-sm font-bold text-white">Ziyaretçi Kodu</p>
          </button>
          <button onClick={handleTaxi} className="flex flex-col gap-3 bg-dark-surface border border-dark-border rounded-3xl p-5 hover:bg-dark-card transition-colors active:scale-95 text-left">
            <span className="material-symbols-rounded text-white text-3xl">local_taxi</span>
            <p className="text-sm font-bold text-white">VIP Ulaşım</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
