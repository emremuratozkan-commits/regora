
import React, { useState } from 'react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { AppPermission, UserRole } from '../types';

type Tab = 'announcements' | 'polls' | 'forum';

const Community: React.FC = () => {
  const { user, announcements, forumPosts, activePoll, openModal, showToast, addAnnouncement, addForumPost, approveForumPost, createPoll, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [hasVoted, setHasVoted] = useState(false);

  // Admin Actions
  const handleCreateAnnouncement = () => {
    openModal({
        type: 'CREATE_ANNOUNCEMENT',
        title: 'Yeni Duyuru Ekle',
        onConfirm: (data) => {
            // data now includes siteId from the modal if user is Admin
            addAnnouncement(data.title, data.content, 'important', data.siteId);
            showToast('Duyuru yayınlandı', 'success');
        }
    });
  };

  const handleCreatePoll = () => {
      openModal({
          type: 'CREATE_POLL',
          title: 'Yeni Oylama Başlat',
          onConfirm: (data) => {
              const options = data.options.split(',').map((s: string) => s.trim());
              createPoll(data.title, options, data.siteId);
              showToast('Oylama başlatıldı', 'success');
          }
      });
  };

  // Resident Actions
  const handleCreatePost = () => {
      openModal({
          type: 'CREATE_POST',
          title: 'Konu Oluştur',
          onConfirm: (data) => {
              addForumPost(data.title, data.content);
              showToast('Gönderiniz onaya gönderildi.', 'info');
          }
      });
  };

  const handleVoteChange = () => {
    if (hasVoted) {
        setHasVoted(false);
        showToast('Oyunuz geri çekildi. Lütfen tekrar seçim yapınız.', 'info');
    } else {
        setHasVoted(true);
        showToast('Oyunuz başarıyla kaydedildi!', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="px-2">
        <h1 className="text-2xl font-bold text-white">Yaşam & Topluluk</h1>
        <p className="text-gray-400 text-sm">İletişim, Kararlar ve Forum</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-dark-card rounded-xl border border-dark-border mx-2">
          <button 
            onClick={() => setActiveTab('announcements')} 
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'announcements' ? 'bg-dark-surface text-white shadow-sm' : 'text-gray-500'}`}
          >
              Duyurular
          </button>
          <button 
            onClick={() => setActiveTab('polls')} 
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'polls' ? 'bg-dark-surface text-white shadow-sm' : 'text-gray-500'}`}
          >
              Oylama
          </button>
          <button 
            onClick={() => setActiveTab('forum')} 
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'forum' ? 'bg-dark-surface text-white shadow-sm' : 'text-gray-500'}`}
          >
              Forum
          </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        
        {/* --- Announcements Tab --- */}
        {activeTab === 'announcements' && (
            <>
                {hasPermission(AppPermission.MANAGE_COMMUNITY) && (
                    <button 
                        onClick={handleCreateAnnouncement}
                        className="w-full py-3 border-2 border-dashed border-dark-border rounded-xl text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">add_circle</span>
                        Yeni Duyuru Yayınla
                    </button>
                )}

                {announcements.length > 0 ? announcements.map(announcement => (
                    <div key={announcement.id} className="bg-dark-card p-5 rounded-3xl border border-dark-border relative overflow-hidden">
                        {announcement.priority === 'emergency' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                        )}
                        <div className="flex justify-between items-start mb-2 pl-2">
                            <h3 className="font-bold text-gray-200">{announcement.title}</h3>
                            <span className="text-[10px] text-gray-500">{announcement.date}</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed pl-2">
                            {announcement.content}
                        </p>
                        {announcement.priority === 'emergency' && (
                            <span className="absolute top-4 right-4 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-500">
                        Bu sitede henüz bir duyuru bulunmuyor.
                    </div>
                )}
            </>
        )}

        {/* --- Polls Tab --- */}
        {activeTab === 'polls' && (
            <div className="px-1">
                {hasPermission(AppPermission.MANAGE_COMMUNITY) && (
                    <button 
                        onClick={handleCreatePoll}
                        className="w-full mb-4 py-3 border-2 border-dashed border-dark-border rounded-xl text-gray-400 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-rounded">ballot</span>
                        Yeni Anket Başlat
                    </button>
                )}

                {activePoll ? (
                    <Card gradient className="border-gold-500/30">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2 py-1 rounded">AKTİF</span>
                            <span className="text-xs text-gray-400">{activePoll.endDate}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4">{activePoll.title}</h3>
                        
                        <div className="space-y-3">
                            {activePoll.options.map((option, idx) => (
                                <div key={idx} className={`relative transition-opacity duration-300 ${!hasVoted ? 'opacity-70' : 'opacity-100'}`}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-300">{option.label}</span>
                                        <span className="text-gold-500 font-bold">{hasVoted ? `%${option.percentage}` : '?'}</span>
                                    </div>
                                    <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${idx === 0 ? 'bg-gold-500' : 'bg-gray-600'}`} 
                                            style={{ width: hasVoted ? `${option.percentage}%` : '0%' }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleVoteChange}
                            className={`w-full mt-6 py-3 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${
                                hasVoted 
                                ? 'border-gold-500 text-gold-500 hover:bg-gold-500/10' 
                                : 'bg-gold-500 text-black border-gold-500 hover:bg-gold-400'
                            }`}
                        >
                            {hasVoted ? 'Oyunu Değiştir' : 'Oy Kullan'}
                        </button>
                    </Card>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        Aktif oylama bulunmuyor.
                    </div>
                )}
            </div>
        )}

        {/* --- Forum Tab --- */}
        {activeTab === 'forum' && (
            <div className="px-1 space-y-4">
                {/* Pending Posts Section for Admin */}
                {hasPermission(AppPermission.MANAGE_COMMUNITY) && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3 px-1">Onay Bekleyenler</h3>
                        <div className="space-y-3">
                            {forumPosts.filter(p => p.status === 'pending').map(post => (
                                <div key={post.id} className="bg-dark-surface border border-orange-500/20 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{post.author}</p>
                                            <p className="text-[10px] text-gray-500">{post.date}</p>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-200 mb-1">{post.title}</h4>
                                    <p className="text-sm text-gray-400 mb-3">{post.content}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { approveForumPost(post.id); showToast('Gönderi onaylandı', 'success'); }}
                                            className="flex-1 bg-green-500/20 text-green-400 text-xs font-bold py-2 rounded-lg hover:bg-green-500/30"
                                        >
                                            Onayla
                                        </button>
                                        <button className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg hover:bg-red-500/30">
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {forumPosts.filter(p => p.status === 'pending').length === 0 && (
                                <p className="text-xs text-gray-500 text-center py-2">Bekleyen gönderi yok.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Approved Posts */}
                {forumPosts.filter(p => p.status === 'approved').map(post => (
                    <div key={post.id} className="bg-dark-card p-4 rounded-2xl border border-dark-border">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold text-white">{post.author}</p>
                                    <p className="text-[10px] text-gray-500">{post.date}</p>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-200 mb-1">{post.title}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed mb-3">
                            {post.content}
                        </p>
                        <div className="flex items-center gap-4 border-t border-dark-border pt-3">
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gold-500 transition-colors">
                                <span className="material-symbols-rounded text-base">thumb_up</span>
                                {post.likes}
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-rounded text-base">chat_bubble</span>
                                {post.comments} Yorum
                            </button>
                        </div>
                    </div>
                ))}
                
                {forumPosts.filter(p => p.status === 'approved').length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Henüz bir gönderi yok.
                    </div>
                )}

                {/* FAB to add post */}
                <button 
                    onClick={handleCreatePost}
                    className="fixed bottom-24 right-4 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20 text-black active:scale-90 transition-transform z-10"
                >
                    <span className="material-symbols-rounded text-3xl">edit</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Community;
