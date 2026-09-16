import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { walletService } from '../../services/wallet.service';
import { depositService } from '../../services/deposit.service';
import { ledgerService } from '../../services/ledger.service';
import { investmentService } from '../../services/investment.service';
import { userService } from '../../services/user.service';
import TransactionModal from '../../components/modals/TransactionModal';
import AddWalletModal from '../../components/modals/AddWalletModal';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Wallet, ArrowUpRight, ArrowDownLeft, PieChart as PieChartIcon, TrendingUp, Copy, CheckCircle, Activity, X, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import axios from 'axios';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import CountdownTimer from '../../components/dashboard/CountdownTimer';
import { notify } from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

export const Portfolio = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [activePlanTab, setActivePlanTab] = useState('active');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loadingTx, setLoadingTx] = useState(true);
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState(null);
    const [depositOptions, setDepositOptions] = useState([]);
    const [copiedAddress, setCopiedAddress] = useState(null);
    const [btcPrice, setBtcPrice] = useState(95000);
    
    // User Wallet State
    const [userWallets, setUserWallets] = useState([]);
    const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    useEffect(() => {
        const loadData = async () => {
             try {
                 const [wallet, options, priceRes, txRes, invRes, userRes] = await Promise.all([
                     walletService.getMyWallet(),
                     depositService.getDepositOptions(),
                     axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').catch(() => ({ data: { price: "95000" } })),
                     ledgerService.getMyTransactions({ limit: 10 }),
                     investmentService.getMyInvestments(),
                     userService.getProfile()
                 ]);
                 setWalletData(wallet);
                 setDepositOptions(options);
                 if (priceRes?.data?.price) {
                     setBtcPrice(parseFloat(priceRes.data.price));
                 }
                 if(txRes?.transactions) setTransactions(txRes.transactions);
                 if(invRes) setInvestments(invRes);
                 if(userRes?.user?.savedWallets) setUserWallets(userRes.user.savedWallets);

             } catch (error) {
                 console.error("Failed to load portfolio data", error);
                 notify.error(ERROR_MESSAGES.LOAD_FAILED('portfolio data'));
             } finally {
                 setLoading(false);
                 setLoadingTx(false);
             }
        };
        loadData();
    }, []);

    const normalize = (val) => {
        if (!val) return 0;
        if (val.$numberDecimal) return parseFloat(val.$numberDecimal);
        if (typeof val === 'object') return parseFloat(val.toString()) || 0;
        return parseFloat(val) || 0;
    };

    const copyToClipboard = (text, coin) => {
        navigator.clipboard.writeText(text);
        setCopiedAddress(coin);
        notify.success(`${coin} ${SUCCESS_MESSAGES.ADDRESS_COPIED}`);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    const handleDeleteWallet = (walletId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Terminate Saved Wallet',
            message: 'Are you sure you want to permanently remove this entry from your secure wallet vault?',
            isDanger: true,
            confirmText: 'Terminate Entry',
            onConfirm: async () => {
                try {
                    const res = await userService.removeSavedWallet(walletId);
                    setUserWallets(res.savedWallets);
                    notify.success(SUCCESS_MESSAGES.WALLET_REMOVED);
                } catch(err) {
                    notify.apiError(err, ERROR_MESSAGES.DELETE_FAILED('wallet'));
                }
            }
        });
    };
    
    if (loading) return <CryptoLoader />;
    
    let liquidUSD = 0;
    let cryptoHoldingsUSD = 0;

    if (walletData?.balances) {
        Object.entries(walletData.balances).forEach(([key, val]) => {
            const amount = normalize(val);
            if (key === 'USDT' || key === 'USDC' || key.includes('USDT') || key.includes('USDC')) {
                liquidUSD += amount;
            } else if (key.includes('BTC')) {
                cryptoHoldingsUSD += (amount * btcPrice);
            }
        });
    }
    
    const totalBalance = liquidUSD + cryptoHoldingsUSD + (walletData?.investmentBalanceUSD || 0);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto px-4 sm:px-0">
            {/* High-Impact Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <ShieldCheck className="w-3 h-3 text-crypto-accent" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Institutional Grade Vault</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">Capital Portfolio</h1>
                    <p className="text-gray-500 font-medium max-w-md">Precision management of your digital assets, staking strategies, and liquidity.</p>
                </div>
                 <div className="flex gap-4">
                    <Link to="/dashboard/deposit">
                        <Button className="h-14 px-8 bg-white text-black hover:bg-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105">
                            Capital Injection
                        </Button>
                    </Link>
                    <Link to="/dashboard/withdraw">
                        <Button variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105">
                            Liquidate Position
                        </Button>
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Main Asset Centerpiece */}
                 <Card className="lg:col-span-8 p-10 bg-[#121419] border-white/5 relative overflow-hidden shadow-2xl rounded-[40px] group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <PieChartIcon className="w-80 h-80 text-crypto-accent transform rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-crypto-accent/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-crypto-accent/20 text-crypto-accent shadow-xl shadow-crypto-accent/10">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <span className="font-black text-xs text-gray-400 tracking-[0.3em] uppercase">Total Assets Under Management</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                     <span className="text-gray-500 text-3xl mr-1 font-mono">$</span>
                                    {formatCurrency(totalBalance, { showSymbol: false })}
                                </h2>
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl h-fit">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-400 font-black text-sm">+2.45%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Liquid Capital', val: (liquidUSD + cryptoHoldingsUSD), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                { label: 'Locked Strategies', val: (walletData?.investmentBalanceUSD || 0), color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                { label: 'Historical Profit', val: (user?.totalProfit || 0), color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-sm shadow-inner group/stat transition-all hover:border-white/10">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">{stat.label}</p>
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-2 h-2 rounded-full", stat.bg.replace('/10', ''))} />
                                        <div className="text-2xl font-black text-white font-mono">{formatCurrency(stat.val, { minimumFractionDigits: 1 })}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Secure Wallet Vault */}
                <Card className="lg:col-span-4 p-8 bg-[#121419]/90 backdrop-blur-xl border-white/5 rounded-[40px] flex flex-col h-full shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-accent/5 rounded-full blur-3xl pointer-events-none" />
                     
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Wallet Vault</h3>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Encrypted Endpoints</p>
                        </div>
                        <Button 
                            className="bg-crypto-accent/10 hover:bg-crypto-accent/20 text-crypto-accent border border-crypto-accent/20 rounded-2xl h-12 w-12 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                            onClick={() => setIsAddWalletModalOpen(true)}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 max-h-[460px] relative z-10">
                        {userWallets && userWallets.length > 0 ? (
                            userWallets.map((wallet, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={wallet._id} 
                                    className="p-5 rounded-[24px] bg-black/40 border border-white/5 hover:border-crypto-accent/30 transition-all group/wallet relative"
                                >
                                    <button 
                                        onClick={() => handleDeleteWallet(wallet._id)}
                                        className="absolute top-3 right-3 text-gray-700 hover:text-rose-500 opacity-0 group-hover/wallet:opacity-100 transition-all p-2 bg-white/5 rounded-xl hover:bg-rose-500/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white border border-white/10 shadow-inner group-hover/wallet:scale-110 transition-transform">
                                            {wallet.coin.substring(0,2)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-white uppercase tracking-widest">
                                                {wallet.label || `${wallet.coin} Base`}
                                            </h4>
                                            <div className="flex gap-2 items-center mt-1">
                                                 <span className="text-[9px] uppercase font-black tracking-widest text-crypto-accent/80 bg-crypto-accent/10 px-2 py-0.5 rounded-lg border border-crypto-accent/20">{wallet.network}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#0B0E14] p-3 rounded-2xl border border-white/5 flex items-center justify-between group-hover/wallet:border-crypto-accent/30 transition-colors">
                                         <code className="text-xs text-gray-400 truncate font-mono tracking-tighter">
                                             {wallet.address}
                                         </code>
                                         <button 
                                            onClick={() => copyToClipboard(wallet.address, wallet.coin)}
                                            className="p-2 text-gray-600 hover:text-white transition-colors ml-2 bg-white/5 rounded-xl"
                                         >
                                            {copiedAddress === wallet.coin ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                         </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center justify-center text-gray-600 bg-black/20 rounded-[32px] border border-dashed border-white/10">
                                <Wallet className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-widest">Vault Empty</p>
                                <button 
                                    onClick={() => setIsAddWalletModalOpen(true)}
                                    className="text-crypto-accent text-[10px] font-black uppercase tracking-widest mt-4 hover:opacity-80 transition-opacity"
                                >
                                    Initialize First Access
                                </button>
                            </div>
                        )}
                     </div>
                </Card>
            </div>

            {/* Strategic Deployment Tracking */}
            {investments.length > 0 && (
                <div className="space-y-8 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Strategy Deployment</h3>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Operational performance of active capital</p>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                            {[
                                { id: 'active', label: 'Active Strategies' },
                                { id: 'history', label: 'Archived Logs' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActivePlanTab(tab.id)}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activePlanTab === tab.id ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {investments.filter(inv => activePlanTab === 'active' ? inv.status === 'ACTIVE' : inv.status !== 'ACTIVE').map((inv, idx) => (
                             <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={inv._id}
                             >
                                <Card className={clsx("p-8 border-white/5 transition-all duration-500 rounded-[40px] shadow-2xl relative overflow-hidden group/plan", inv.status === 'ACTIVE' ? 'bg-[#121419] hover:border-crypto-accent/40' : 'bg-[#0B0E14] grayscale hover:grayscale-0')}>
                                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-crypto-accent/5 rounded-full blur-3xl pointer-events-none group-hover/plan:bg-crypto-accent/10 transition-colors" />
                                     
                                     <div className="flex justify-between items-start mb-8 relative z-10">
                                         <div className="space-y-3">
                                             <div className={clsx(
                                                 "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                 inv.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-800 text-gray-500 border-white/5'
                                             )}>
                                                 <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", inv.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-600')} />
                                                 {inv.status}
                                             </div>
                                             <h4 className="font-black text-white text-xl tracking-tight uppercase leading-none">
                                                 {inv.depositId?.planId?.name || 'Alpha Strategy'}
                                             </h4>
                                         </div>
                                         <div className="text-right space-y-1">
                                             <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Initial Stake</p>
                                             <p className="text-white font-mono font-black text-lg">{formatCurrency(inv.principalUSD)}</p>
                                         </div>
                                     </div>
                                     
                                     <div className="space-y-6 pt-6 border-t border-white/5 relative z-10 flex-1">
                                         <div className="flex justify-between items-end">
                                             <div className="space-y-1">
                                                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">ROI Momentum</p>
                                                 <p className="text-2xl font-black text-emerald-400 font-mono">+{inv.profitPercent || inv.dailyRate || 0}% <span className="text-gray-700 text-xs font-bold uppercase">/ Daily</span></p>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Total Yield</p>
                                                 <p className="text-xl font-black text-white font-mono">+${(inv.totalCredited || inv.totalEarned || 0).toFixed(2)}</p>
                                             </div>
                                         </div>

                                         <div className="space-y-3 pt-4">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Time to Maturity</p>
                                                    <p className="text-xs font-black text-white tracking-widest uppercase">
                                                       {new Date(new Date(inv.startAt || inv.startDate).getTime() + (inv.durationDays * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {inv.status === 'ACTIVE' && (
                                                    <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                                                        <CountdownTimer targetDate={new Date(new Date(inv.startAt || inv.startDate).getTime() + (inv.durationDays * 24 * 60 * 60 * 1000))} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (Math.max(0, Math.floor((new Date() - new Date(inv.startAt || inv.startDate)) / (1000 * 60 * 60 * 24))) / (inv.durationDays || 1)) * 100)}%` }}
                                                    transition={{ duration: 2 }}
                                                    className="h-full bg-gradient-to-r from-crypto-accent to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                                />
                                            </div>
                                         </div>
                                     </div>
                                </Card>
                             </motion.div>
                        ))}
                        {investments.filter(inv => activePlanTab === 'active' ? inv.status === 'ACTIVE' : inv.status !== 'ACTIVE').length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-700 bg-white/[0.02] rounded-[40px] border-2 border-dashed border-white/5">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-[0.3em]">No {activePlanTab} Deployment Logs</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Comprehensive Transaction Ledger */}
            <div className="space-y-8 pt-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Full Execution Records</h3>
                </div>
                <Card className="overflow-hidden border-white/5 bg-[#121419]/90 backdrop-blur-xl rounded-[40px] shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-black/40 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
                                <tr>
                                    <th className="px-8 py-6">Operational Type</th>
                                    <th className="px-8 py-6">Net Amount</th>
                                    <th className="px-8 py-6">Final Status</th>
                                    <th className="px-8 py-6">Timestamp</th>
                                    <th className="px-8 py-6 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loadingTx ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20">
                                            <div className="flex justify-center"><CryptoLoader size={20} /></div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Activity className="w-12 h-12 text-white" />
                                                <p className="text-xs font-black text-white uppercase tracking-[0.3em]">No transaction records discovered</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={tx._id} 
                                            className="hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
                                            onClick={() => setSelectedTransaction(tx)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                                                        tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 
                                                        tx.type === 'WITHDRAWAL' ? 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : 
                                                        'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white'
                                                    )}>
                                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-5 h-5" /> : 
                                                         tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="w-5 h-5" /> : 
                                                         <Activity className="w-5 h-5" />}
                                                    </div>
                                                    <span className="font-black text-white text-sm uppercase tracking-widest group-hover:text-crypto-accent transition-colors">
                                                        {tx.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono font-black text-lg text-white tracking-tighter">
                                                {tx.type === 'WITHDRAWAL' ? '-' : '+'}{parseFloat(tx.amount?.$numberDecimal || tx.amount || 0).toFixed(4)} <span className="text-gray-700 text-[10px] font-black uppercase ml-1">{tx.coin}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={clsx(
                                                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white' : 
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white'
                                                )}>
                                                    <div className={clsx("w-1.5 h-1.5 rounded-full transition-colors", tx.status === 'COMPLETED' ? 'bg-emerald-500 group-hover:bg-white' : 'bg-amber-500 group-hover:bg-white')} />
                                                    {tx.status || 'SETTLED'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-white mb-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-crypto-accent hover:text-white hover:bg-white/5 border border-crypto-accent/20 rounded-xl px-4 py-2">
                                                    Inspect <ChevronRight className="w-3 h-3 ml-2" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {selectedTransaction && (
                <TransactionModal 
                    transaction={selectedTransaction} 
                    onClose={() => setSelectedTransaction(null)} 
                />
            )}

            <AddWalletModal 
                isOpen={isAddWalletModalOpen} 
                onClose={() => setIsAddWalletModalOpen(false)}
                onSuccess={(updatedWallets) => setUserWallets(updatedWallets)}
            />

            <ActionConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

const Plus = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
