import React, { useState } from 'react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { AppPermission, UserRole } from '../types';
import { useTranslation } from 'react-i18next';

type Tab = 'announcements' | 'polls' | 'forum';

const Community: React.FC = () => {
    const { user, announcements, forumPosts, activePoll, openModal, showToast, addAnnouncement, addForumPost, approveForumPost, createPoll, hasPermission } = useApp();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('announcements');
    const [hasVoted, setHasVoted] = useState(false);

    // Admin Actions
    const handleCreateAnnouncement = () => {
        openModal({
            type: 'CREATE_ANNOUNCEMENT',
            title: t('community.new_announcement'),
            onConfirm: (data) => {
                addAnnouncement(data.title, data.content, 'important', data.siteId);
                showToast(t('community.announced'), 'success');
            }
        });
    };

    const handleCreatePoll = () => {
        openModal({
            type: 'CREATE_POLL',
            title: t('community.new_poll'),
            onConfirm: (data) => {
                const options = data.options.split(',').map((s: string) => s.trim());
                createPoll(data.title, options, data.siteId);
                showToast(t('community.poll_started'), 'success');
            }
        });
    };

    // Resident Actions
    const handleCreatePost = () => {
        openModal({
            type: 'CREATE_POST',
            title: t('community.new_post'),
            onConfirm: (data) => {
                addForumPost(data.title, data.content);
                showToast(t('community.post_pending'), 'info');
            }
        });
    };

    const handleVoteChange = () => {
        if (hasVoted) {
            setHasVoted(false);
            showToast('Vote retracted.', 'info');
        } else {
            setHasVoted(true);
            showToast('Vote recorded!', 'success');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-28">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{t('community.title')}</h1>
            </div>

            {/* Tabs */}
            <div className="flex bg-dark-surface p-1 rounded-2xl border border-dark-border mx-1">
                {(['announcements', 'polls', 'forum'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {t(`community.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {activeTab === 'announcements' && (
                    <div className="space-y-4">
                        {hasPermission(AppPermission.MANAGE_COMMUNITY) && (
                            <button
                                onClick={handleCreateAnnouncement}
                                className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded">add_circle</span>
                                {t('community.new_announcement')}
                            </button>
                        )}
                        {announcements.length > 0 ? (
                            announcements.map(announcement => (
                                <div key={announcement.id} className="bg-dark-card p-5 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-200">{announcement.title}</h3>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{announcement.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">{announcement.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                NO ANNOUNCEMENTS
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'polls' && (
                    <div className="space-y-4">
                        {hasPermission(AppPermission.MANAGE_COMMUNITY) && (
                            <button
                                onClick={handleCreatePoll}
                                className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded">ballot</span>
                                {t('community.new_poll')}
                            </button>
                        )}
                        {activePoll ? (
                            <Card gradient className="border-white/10 shadow-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tight">Active</span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{activePoll.endDate}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">{activePoll.title}</h3>
                                <div className="space-y-4">
                                    {activePoll.options.map((option, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-gray-400">{option.label}</span>
                                                <span className="text-white">{hasVoted ? `${option.percentage}%` : '?'}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-white transition-all duration-1000 ${!hasVoted && 'opacity-0'}`}
                                                    style={{ width: hasVoted ? `${option.percentage}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleVoteChange}
                                    className={`w-full mt-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] ${hasVoted ? 'border border-white/20 text-white' : 'bg-white text-black'}`}
                                >
                                    {hasVoted ? 'Change Vote' : 'Vote Now'}
                                </button>
                            </Card>
                        ) : (
                            <div className="text-center py-20 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                NO ACTIVE POLLS
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'forum' && (
                    <div className="space-y-4">
                        {forumPosts.filter(p => (hasPermission(AppPermission.MANAGE_COMMUNITY) || p.status === 'approved')).map(post => (
                            <div key={post.id} className={`bg-dark-card p-5 rounded-3xl border ${post.status === 'pending' ? 'border-orange-500/20 shadow-orange-500/5 shadow-2xl' : 'border-white/5'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">{post.author}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{post.date}</p>
                                        </div>
                                        {post.status === 'pending' && <span className="text-[8px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Pending Approval</span>}
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-200 mb-2 tracking-tight">{post.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">{post.content}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                                            <span className="material-symbols-rounded text-sm">thumb_up</span>
                                            {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                                            <span className="material-symbols-rounded text-sm">chat_bubble</span>
                                            {post.comments}
                                        </button>
                                    </div>
                                    {hasPermission(AppPermission.MANAGE_COMMUNITY) && post.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { approveForumPost(post.id); showToast('Published', 'success'); }} className="px-3 py-1.5 bg-green-500 text-black text-[10px] font-bold rounded-lg uppercase">Approve</button>
                                            <button className="px-3 py-1.5 bg-white/5 text-red-500 text-[10px] font-bold rounded-lg uppercase">Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* Floating Action Button - Positioned relative to the 430px container */}
                        <div className="fixed bottom-28 max-w-[430px] w-full pointer-events-none z-20">
                            <div className="flex justify-end px-6">
                                <button
                                    onClick={handleCreatePost}
                                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all pointer-events-auto"
                                >
                                    <span className="material-symbols-rounded text-3xl">edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
