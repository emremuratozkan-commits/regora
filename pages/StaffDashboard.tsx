
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Ticket } from '../types';

const StaffDashboard: React.FC = () => {
    const { user, property, tickets, updateTicketStatus, activities } = useApp();
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const stats = {
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        myTasks: tickets.filter(t => t.category.toLowerCase() === user.jobTitle?.toLowerCase()).length
    };

    return (
        <div className="space-y-8 animate-fade-in p-2">
            {/* Staff Header */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="material-symbols-rounded text-3xl text-blue-500">engineering</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">{user.name}</h1>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user.jobTitle || 'Saha Personeli'} • {property.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                        <p className="text-xl font-black text-white">{stats.open}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Açık İş</p>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                        <p className="text-xl font-black text-white">{stats.myTasks}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Bölümüm</p>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                        <p className="text-xl font-black text-emerald-500">{activities.length}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Aktivite</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions for Staff */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded">local_taxi</span>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-white uppercase">Taksi Çağır</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Lobi Bildirim</p>
                    </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded">notifications_active</span>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-white uppercase">Acil Durum</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Saha Alarm</p>
                    </div>
                </button>
            </div>

            {/* Task Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Görev Listesi</h3>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setFilter('open')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filter === 'open' ? 'bg-white text-black' : 'text-gray-500'}`}>Açık</button>
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filter === 'all' ? 'bg-white text-black' : 'text-gray-500'}`}>Hepsi</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                        <div key={ticket.id} className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-[24px] p-5 hover:border-white/20 transition-all underline-none">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${ticket.status === 'open' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{ticket.category} • {ticket.date}</span>
                                </div>
                                <span className="bg-white/5 text-[8px] font-bold text-white px-2 py-1 rounded-full border border-white/5 uppercase">{ticket.id}</span>
                            </div>

                            <h4 className="text-sm font-bold text-white mb-2 leading-snug">{ticket.title}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 line-clamp-2">{ticket.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[8px]">
                                        {ticket.requestorName.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{ticket.requestorName}</span>
                                </div>

                                {ticket.status === 'open' && (
                                    <button
                                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Tamamla
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center opacity-20">
                                <span className="material-symbols-rounded text-3xl">task</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Bekleyen görev bulunmuyor</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
