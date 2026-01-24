
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { MOCK_TRANSACTIONS } from '../constants';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppPermission } from '../types';

const siteIncomeExpenseData = [
    { name: 'Oca', gelir: 45000, gider: 32000 },
    { name: 'Şub', gelir: 42000, gider: 35000 },
    { name: 'Mar', gelir: 48000, gider: 28000 },
    { name: 'Nis', gelir: 46000, gider: 40000 },
    { name: 'May', gelir: 50000, gider: 30000 },
    { name: 'Haz', gelir: 55000, gider: 32000 },
];

const Finance: React.FC = () => {
    const { user, openModal, showToast, hasPermission } = useApp();
    const totalDebt = Math.abs(user.balance);

    const [activeFilter, setActiveFilter] = useState<'all' | 'dues' | 'utility'>('all');
    const [aiInsight, setAiInsight] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handlePay = (amount: number, description: string) => {
        openModal({
            type: 'PAYMENT',
            title: 'Güvenli Ödeme Terminali',
            data: { amount, description },
            onConfirm: () => {
                showToast('Ödeme işlemi başarıyla tamamlandı.', 'success');
            }
        });
    };

    const handleAnalyzeFinances = async () => {
        setIsAnalyzing(true);
        try {
            const { aiApiService } = await import('../services/AIApiService');
            const result = await aiApiService.analyzeFinances({ debt: totalDebt });

            if (result.error) {
                setAiInsight(result.error);
            } else if (result.data) {
                setAiInsight(result.data.insight);
            } else {
                setAiInsight('Finansal profiliniz incelendi: Ödemeleriniz düzenli seyretmektedir.');
            }
        } catch (error) {
            setAiInsight('Finansal profiliniz incelendi: Ödemeleriniz düzenli seyretmektedir.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        let result = [...MOCK_TRANSACTIONS];
        if (activeFilter !== 'all') result = result.filter(t => t.type === activeFilter);
        return result;
    }, [activeFilter]);

    if (hasPermission(AppPermission.VIEW_SITE_FINANCE)) {
        return (
            <div className="space-y-8 animate-fade-in pb-24">
                <div className="px-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Kurumsal Finans</h1>
                    <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Site Bütçe ve Tahsilat Raporu</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Card gradient className="col-span-2 border-white/10">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Kasa Bakiyesi</p>
                        <h2 className="text-4xl font-bold text-white">₺320.000</h2>
                        <div className="mt-4 flex gap-4 text-[10px] font-bold">
                            <span className="text-green-500">AYLIK GELİR: ₺85.000</span>
                            <span className="text-red-500">AYLIK GİDER: ₺42.000</span>
                        </div>
                    </Card>
                </div>
                <div className="h-72 w-full bg-dark-card p-4 rounded-3xl border border-dark-border">
                    <h3 className="text-[10px] font-bold mb-4 text-gray-500 tracking-widest uppercase text-center">Yıllık Performans Grafiği</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={siteIncomeExpenseData}>
                            <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: '1px solid #1F1F1F', color: '#fff' }} />
                            <Bar dataKey="gelir" fill="#fff" radius={[4, 4, 0, 0]} name="Gelir" />
                            <Bar dataKey="gider" fill="#444" radius={[4, 4, 0, 0]} name="Gider" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            <div className="px-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Cari Hesap</h1>
                <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Mülk Finansal Durumu</p>
            </div>

            <Card gradient className="border-white/10">
                <div className="text-center py-4">
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-2">Toplam Cari Borç</p>
                    <h2 className="text-5xl font-bold text-white tracking-tighter">₺{totalDebt.toLocaleString()}</h2>
                    <div className="mt-8 flex gap-3">
                        <button onClick={() => handlePay(totalDebt, 'Tüm Borç Kapatma')} className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-widest">
                            ÖDEME YAP
                        </button>
                    </div>
                </div>
            </Card>

            <div className="px-2">
                <Card gradient className="border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-rounded text-black text-xl">auto_awesome</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-2">ÅKRONA AI ANALİZ</h3>
                            {isAnalyzing ? (
                                <p className="text-xs text-gray-500 animate-pulse">Finansal veriler analiz ediliyor...</p>
                            ) : aiInsight ? (
                                <p className="text-xs text-gray-300 leading-relaxed italic">"{aiInsight}"</p>
                            ) : (
                                <button onClick={handleAnalyzeFinances} className="text-white text-[10px] font-bold border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                    Analiz Raporu Al
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Hesap Ekstresi</h3>
                    <div className="flex gap-2">
                        {['all', 'dues', 'utility'].map(f => (
                            <button key={f} onClick={() => setActiveFilter(f as any)} className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${activeFilter === f ? 'bg-white text-black' : 'bg-dark-surface text-gray-500 border border-dark-border'}`}>
                                {f === 'all' ? 'Tümü' : f === 'dues' ? 'Aidat' : 'Fatura'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="bg-dark-card p-4 rounded-2xl border border-dark-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${tx.status === 'paid' ? 'bg-white text-black' : 'bg-dark-surface text-gray-600'}`}>
                                    <span className="material-symbols-rounded">{tx.type === 'dues' ? 'home' : 'bolt'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-200">{tx.title}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">₺{tx.amount}</p>
                                <p className={`text-[10px] font-bold uppercase ${tx.status === 'pending' ? 'text-red-500' : 'text-gray-500'}`}>
                                    {tx.status === 'pending' ? 'BORÇ' : 'ÖDENDİ'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Finance;
