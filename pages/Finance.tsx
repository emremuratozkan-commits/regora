
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { MOCK_TRANSACTIONS } from '../constants';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppPermission } from '../types';
import { useTranslation } from 'react-i18next';

const siteIncomeExpenseData = [
    { name: 'Oca', gelir: 45000, gider: 32000 },
    { name: 'Şub', gelir: 42000, gider: 35000 },
    { name: 'Mar', gelir: 48000, gider: 28000 },
    { name: 'Nis', gelir: 46000, gider: 40000 },
    { name: 'May', gelir: 50000, gider: 30000 },
    { name: 'Haz', gelir: 55000, gider: 32000 },
];

const Finance: React.FC = () => {
    const { user, openModal, showToast, hasPermission, globalStats, property } = useApp();
    const { t } = useTranslation();
    const totalDebt = Math.abs(user.balance);

    const [activeFilter, setActiveFilter] = useState<'all' | 'dues' | 'utility'>('all');
    const [aiInsight, setAiInsight] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handlePay = (amount: number, description: string) => {
        openModal({
            type: 'PAYMENT',
            title: t('finance.safe_payment'),
            data: { amount, description },
            onConfirm: () => {
                showToast(t('finance.payment_success'), 'success');
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
                    <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">{property.name} Raporu</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Card gradient className="col-span-2 border-white/10">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Kasa Bakiyesi</p>
                        <h2 className="text-4xl font-bold text-white">₺{globalStats.totalBalance.toLocaleString('tr-TR')}</h2>
                        <div className="mt-4 flex gap-4 text-[10px] font-bold">
                            <span className="text-green-500">AYLIK GELİR: ₺{globalStats.monthlyIncome.toLocaleString('tr-TR')}</span>
                            <span className="text-red-500">AYLIK GİDER: ₺{globalStats.monthlyExpense.toLocaleString('tr-TR')}</span>
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
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{t('finance.title')}</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Card gradient className="border-white/10 shadow-2xl shadow-black/50">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-2">{t('finance.total_debt')}</p>
                            <h2 className="text-4xl font-bold text-white tracking-tighter">₺{totalDebt.toLocaleString('tr-TR')}</h2>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl">
                            <span className="material-symbols-rounded text-white">account_balance_wallet</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handlePay(totalDebt, 'Toplam Aidat Borcu Ödemesi')}
                        className="w-full bg-white text-black font-extrabold py-4 rounded-2xl shadow-xl shadow-white/5 text-[11px] uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
                    >
                        {t('finance.pay_now')}
                    </button>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm text-gold-500">psychology</span>
                                {t('finance.analysis')}
                            </h3>
                            <button
                                onClick={handleAnalyzeFinances}
                                disabled={isAnalyzing}
                                className="text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                            >
                                {isAnalyzing ? t('finance.analyzing') : t('finance.analyze_btn')}
                            </button>
                        </div>
                        {isAnalyzing ? (
                            <p className="text-xs text-gray-500 animate-pulse">{t('finance.analyzing')}</p>
                        ) : aiInsight ? (
                            <p className="text-xs text-gray-300 leading-relaxed italic">"{aiInsight}"</p>
                        ) : (
                            // This button is now redundant as it's moved into the flex container above
                            // <button onClick={handleAnalyzeFinances} className="text-white text-[10px] font-bold border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                            //     Analiz Raporu Al
                            // </button>
                            null
                        )}
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Hesap Ekstresi</h3>
                    <div className="flex gap-2">
                        {['all', 'dues', 'utility'].map(f => (
                            <button key={f} onClick={() => setActiveFilter(f as any)} className={`text-[10px] font-bold px-4 py-2 rounded-2xl transition-all ${activeFilter === f ? 'bg-white text-black' : 'bg-dark-surface text-gray-500 border border-dark-border'}`}>
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
