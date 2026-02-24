
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Ticket } from '../types';
import { Bell, ShieldAlert, Car, Hammer, CheckCircle2, Navigation } from 'lucide-react';

const StaffDashboard: React.FC = () => {
    const { user, property, tickets, updateTicketStatus, activities, showToast } = useApp();
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
    const [lastTicketCount, setLastTicketCount] = useState(tickets.length);

    // Filter tickets based on department
    const departmentTickets = tickets.filter(t => {
        const jobTitle = user.jobTitle?.toLowerCase() || '';
        if (jobTitle.includes('güvenlik')) {
            return ['SECURITY', 'EMERGENCY', 'TAXI_REQUEST', 'GUEST_ACCESS', 'VALE'].includes(t.category);
        }
        if (jobTitle.includes('teknik')) {
            return ['MAINTENANCE', 'TECHNICAL', 'EMERGENCY'].includes(t.category);
        }
        if (jobTitle.includes('resepsiyon') || jobTitle.includes('concierge')) {
            return ['CONCIERGE', 'FACILITY_RESERVE', 'GUEST_ACCESS'].includes(t.category);
        }
        if (user.role === UserRole.MANAGER) {
            return true; // Managers see all
        }
        return t.targetRole === UserRole.STAFF || t.category === 'CONCIERGE';
    });

    const filteredTickets = departmentTickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    // Real-time notification effect (simulated)
    useEffect(() => {
        if (tickets.length > lastTicketCount) {
            const newTicket = tickets[0];
            if (newTicket && departmentTickets.some(dt => dt.id === newTicket.id)) {
                showToast(`YENİ GÖREV: ${newTicket.title}`, 'info');
                // Symbolize audio with a console log for now
                console.log('🔔 Notification Sound Played');
            }
        }
        setLastTicketCount(tickets.length);
    }, [tickets.length, departmentTickets, lastTicketCount, showToast]);

    const stats = {
        open: departmentTickets.filter(t => t.status === 'open').length,
        inProgress: departmentTickets.filter(t => t.status === 'in_progress').length,
        total: departmentTickets.length
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'EMERGENCY': return <ShieldAlert className="text-red-500" />;
            case 'TAXI_REQUEST': return <Car className="text-orange-500" />;
            case 'MAINTENANCE':
            case 'TECHNICAL': return <Hammer className="text-blue-500" />;
            case 'VALE': return <Car className="text-purple-500" />;
            case 'CONCIERGE': return <Bell className="text-gold-500" />;
            case 'VALUATION': return <span className="material-symbols-rounded text-purple-400">psychology</span>;
            default: return <Bell className="text-gray-400" />;
        }
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
                        <p className="text-xl font-black text-white">{stats.inProgress}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Devam Eden</p>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                        <p className="text-xl font-black text-emerald-500">{activities.length}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Tamamlanan</p>
                    </div>
                </div>
            </div>

            {/* Task Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Canlı Görev Listesi</h3>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setFilter('open')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filter === 'open' ? 'bg-white text-black' : 'text-gray-500'}`}>Açık</button>
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${filter === 'all' ? 'bg-white text-black' : 'text-gray-500'}`}>Hepsi</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                        <div key={ticket.id} className={`group relative overflow-hidden bg-white/5 border rounded-[24px] p-5 transition-all ${ticket.category === 'EMERGENCY' ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 hover:border-white/20'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        {getCategoryIcon(ticket.category)}
                                    </div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{ticket.category} • {ticket.date}</span>
                                </div>
                                <span className="bg-white/5 text-[8px] font-bold text-white px-2 py-1 rounded-full border border-white/5 uppercase">{ticket.status}</span>
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

                                <div className="flex gap-2">
                                    {ticket.status === 'open' && (
                                        <>
                                            <button
                                                onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                                                className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                <Navigation size={12} />
                                                Yoldayım
                                            </button>
                                            <button
                                                onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                                className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={12} />
                                                Tamamla
                                            </button>
                                        </>
                                    )}
                                    {ticket.status === 'in_progress' && (
                                        <button
                                            onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Görev Tamamlandı
                                        </button>
                                    )}
                                </div>
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
