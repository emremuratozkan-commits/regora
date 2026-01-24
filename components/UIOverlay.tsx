
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_BANK_DETAILS } from '../constants';
import { UserRole, ThemeAccent, Ticket, Site } from '../types';

const UIOverlay: React.FC = () => {
  const { 
    modal, toast, closeModal, property, showToast, user, 
    addTicket, addAnnouncement, addForumPost, createPoll,
    addSite, updateSite, approveUser, rejectUser, 
    pendingUsers, sites, theme, setTheme, addLicensePlate, serviceLogs, updateTicketStatus
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
      name: '', address: '', city: '', managerName: '', blockCount: 1, unitCount: 1, duesAmount: 0, imageUrl: '', features: {
          has_pool: false, has_gym: false, has_freight_elevator: false, has_parking_recognition: false, has_guest_kiosk: false
      }
  });

  useEffect(() => {
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
          else setSiteForm({ name: '', address: '', city: '', managerName: '', blockCount: 1, unitCount: 1, duesAmount: 0, imageUrl: '', features: {} as any });
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
      switch(ticketCategory) {
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

  const ticketCategories = ['Teknik Destek', 'Güvenlik', 'Temizlik', 'Peyzaj', 'Bakım & Onarım'];

  if (!modal && !toast) return null;

  return (
    <div className="relative z-[100]">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-[110] animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 ${
            toast.type === 'success' ? 'bg-white text-black' : 
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
              <h3 className="font-bold text-[10px] tracking-[0.2em] uppercase text-gray-500">{modal.title || 'ÅKRONA'}</h3>
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
                                className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    ticketCategory === cat 
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
                  <div className="space-y-3">
                      <input type="text" placeholder="Site Adı" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.name} onChange={(e) => setSiteForm({...siteForm, name: e.target.value})} />
                      <input type="text" placeholder="Konum / Şehir" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.city} onChange={(e) => setSiteForm({...siteForm, city: e.target.value})} />
                      <input type="text" placeholder="Yönetici İsmi" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.managerName} onChange={(e) => setSiteForm({...siteForm, managerName: e.target.value})} />
                      <div className="flex gap-2">
                          <input type="number" placeholder="Blok Sayısı" className="w-1/2 bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.blockCount} onChange={(e) => setSiteForm({...siteForm, blockCount: parseInt(e.target.value) || 0})} />
                          <input type="number" placeholder="Konut Sayısı" className="w-1/2 bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.unitCount} onChange={(e) => setSiteForm({...siteForm, unitCount: parseInt(e.target.value) || 0})} />
                      </div>
                      <input type="number" placeholder="Sabit Aidat Tutarı" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.duesAmount} onChange={(e) => setSiteForm({...siteForm, duesAmount: parseInt(e.target.value) || 0})} />
                      <input type="text" placeholder="Kapak Resmi URL" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs" value={siteForm.imageUrl || ''} onChange={(e) => setSiteForm({...siteForm, imageUrl: e.target.value})} />
                      <textarea placeholder="Tam Adres" className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-3 text-white text-xs h-16 resize-none" value={siteForm.address} onChange={(e) => setSiteForm({...siteForm, address: e.target.value})} />
                      <button onClick={handleSiteSubmit} className="w-full bg-white text-black font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest">SİTEYİ KAYDET</button>
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

              {modal.type === 'CONFIRMATION' && (
                  <div className="text-center space-y-6">
                      <p className="text-sm text-gray-300 leading-relaxed">{modal.message}</p>
                      <div className="flex gap-4">
                          <button onClick={closeModal} className="flex-1 py-4 rounded-2xl border border-dark-border text-[10px] font-bold uppercase text-gray-500">İptal</button>
                          <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); closeModal(); }} className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-bold uppercase">Onayla</button>
                      </div>
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
