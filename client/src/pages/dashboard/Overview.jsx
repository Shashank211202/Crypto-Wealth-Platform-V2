import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboard.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Activity, LifeBuoy, CreditCard, ChevronRight, ArrowRight, FileText } from 'lucide-react';
import { MarketChart, COINS } from '../../components/dashboard/MarketChart';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import axios from 'axios';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickActionButton from '../../components/dashboard/QuickActionButton';

export const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeDeposits, setActiveDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Market Data State
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [tickers, setTickers] = useState({});

  useEffect(() => {
    const fetchTickers = async () => {
        try {
            const symbols = JSON.stringify(COINS.map(c => c.binanceSymbol));
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
            
            const tickerMap = {};
            res.data.forEach(t => {
                tickerMap[t.symbol] = {
                    price: parseFloat(t.lastPrice),
                    change: parseFloat(t.priceChangePercent),
                    volume: parseFloat(t.quoteVolume)
                };
            });
            setTickers(tickerMap);
        } catch (err) {
            console.error("Failed to fetch tickers", err);
        }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [overviewData, depositsData, withdrawalsData] = await Promise.all([
             dashboardService.getOverview(),
             dashboardService.getUserDeposits(),
             dashboardService.getUserWithdrawals()
        ]);
        setStats(overviewData);
        
        setActiveDeposits(depositsData.filter(d => d.status === 'Approved'));

        const combined = [
            ...depositsData.map(d => ({ 
                ...d, 
                amount: Number(d.claimedAmount?.$numberDecimal || d.claimedAmount || d.amount || 0),
                type: 'deposit' 
            })),
            ...withdrawalsData.map(w => ({ 
                ...w, 
                amount: Number(w.amount || 0),
                type: 'withdrawal' 
            }))
        ].sort((a, b) => new Date(b.approvedAt || b.date || b.createdAt) - new Date(a.approvedAt || a.date || a.createdAt)).slice(0, 5);
        
        setRecentTransactions(combined);

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <CryptoLoader />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Cinematic Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] bg-[#121419] border border-white/5 p-10 shadow-2xl group"
      >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 transition-all duration-1000 group-hover:opacity-80" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-crypto-accent/20 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[10000ms]" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Platform Live Status</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-crypto-accent to-purple-400">Wealth journey</span>, {user?.name}
                  </h1>
                  <p className="text-gray-400 max-w-xl text-lg font-medium leading-relaxed">
                      Your portfolio is projected to grow. You have <span className="text-white font-black">{activeDeposits.length} premium strategies</span> actively generating ROI.
                  </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  <Link to="/dashboard/plans">
                      <Button className="h-16 px-8 bg-white text-black hover:bg-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95">
                          Invest Now <TrendingUp className="w-4 h-4 ml-3" />
                      </Button>
                  </Link>
                  <Link to="/dashboard/portfolio">
                    <Button variant="outline" className="h-16 px-8 border-white/10 hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
                        Analyze Portfolio
                    </Button>
                  </Link>
              </div>
          </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <StatsCard 
          label="Estimated Balance" 
          value={`$${(stats?.total_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Wallet} 
          trend="+2.4% vs last week" 
          color="blue"
        />
        <StatsCard 
          label="Net Earnings" 
          value={`$${(stats?.profit_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          trend="Total Credited" 
          color="emerald"
          isPositive 
        />
        <StatsCard 
          label="Active Staking" 
          value={`$${(stats?.active_deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Activity} 
         
          color="purple"
        />
        <StatsCard 
          label="Liquid Capital" 
          value={`$${(stats?.withdrawable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={CreditCard} 
          trend="Instantly Available" 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-crypto-accent/20 text-crypto-accent">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Market Dynamics</h3>
                    </div>
                </div>
                
                <Card className="p-8 border-white/5 bg-[#121419]/80 backdrop-blur-xl shadow-2xl h-[540px] flex flex-col rounded-[40px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
                    <div className="flex-1 w-full min-h-0 relative z-10">
                       <MarketChart coin={selectedCoin} />
                    </div>
                </Card>
              </div>

              <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-crypto-accent rounded-full" />
                    <h3 className="text-lg font-black text-white tracking-widest uppercase">Global Control</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <QuickActionButton to="/dashboard/deposit" icon={ArrowUpRight} label="Deposit" color="text-emerald-400" bg="bg-emerald-500/10" desc="Add Capital" />
                      <QuickActionButton to="/dashboard/withdraw" icon={ArrowDownLeft} label="Withdraw" color="text-rose-400" bg="bg-rose-500/10" desc="Exit Position" />
                      <QuickActionButton to="/dashboard/plans" icon={TrendingUp} label="Investment" color="text-blue-400" bg="bg-blue-500/10" desc="New Strategy" />
                      <QuickActionButton to="/dashboard/support" icon={LifeBuoy} label="Support" color="text-yellow-400" bg="bg-yellow-500/10" desc="24/7 Access" />
                  </div>
              </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
              <Card className="p-0 border-white/5 bg-[#121419]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[600px] rounded-[40px]">
                  <div className="p-8 border-b border-white/5 bg-black/40 flex justify-between items-center">
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">Global Trends</h3>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <TrendingUp className="w-4 h-4 text-crypto-accent" />
                      </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
                      {COINS.map(coin => {
                          const data = tickers[coin.binanceSymbol] || {};
                          const isSelected = selectedCoin.id === coin.id;
                          return (
                              <motion.div 
                                key={coin.id}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedCoin(coin)}
                                className={clsx(
                                    "p-4 rounded-3xl flex items-center justify-between cursor-pointer transition-all duration-300 border relative overflow-hidden group/coin",
                                    isSelected 
                                        ? "bg-white/5 border-white/10 shadow-xl ring-1 ring-white/10" 
                                        : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                                )}
                              >
                                  {isSelected && <motion.div layoutId="selectionGlow" className="absolute -left-20 top-0 bottom-0 w-32 bg-crypto-accent/10 blur-3xl pointer-events-none" />}
                                  
                                  <div className="flex items-center gap-4 relative z-10">
                                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 group-hover/coin:scale-110 transition-transform shadow-inner">
                                          <span className="font-black text-base" style={{ color: coin.color }}>{coin.symbol}</span>
                                      </div>
                                      <div>
                                          <p className={clsx("font-black text-sm transition-colors", isSelected ? "text-white" : "text-gray-500 group-hover/coin:text-white")}>{coin.name}</p>
                                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Vol: {(data.volume / 1000000)?.toFixed(1)}M</p>
                                      </div>
                                  </div>
                                  <div className="text-right relative z-10">
                                      <p className="text-base font-black text-white font-mono tracking-tighter">
                                          {data.price ? `$${data.price.toLocaleString()}` : <span className="animate-pulse">---</span>}
                                      </p>
                                      <div className={clsx(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight w-fit",
                                        (data.change || 0) >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                      )}>
                                          {(data.change || 0) > 0 ? '+' : ''}{(data.change || 0).toFixed(2)}%
                                      </div>
                                  </div>
                              </motion.div>
                          );
                      })}
                  </div>
              </Card>

              {/* <Card className="p-8 border-white/5 bg-gradient-to-br from-[#121419] to-[#0B0E14] shadow-2xl relative overflow-hidden rounded-[40px] group/status">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-[60px] group-hover/status:bg-yellow-500/10 transition-colors duration-700" />
                  
                  <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Account Status</p>
                          <h3 className="text-3xl font-black text-white tracking-tight">{user?.level || 'Bronze'}</h3>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 ring-4 ring-white/5">
                          <span className="text-black font-black text-xs uppercase tracking-tighter">{(user?.level || 'BRONZE').toUpperCase().substring(0,3)}</span>
                      </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 relative z-10 space-y-6">
                      {(() => {
                          const points = user?.points || 0;
                          let next = 'Silver', threshold = 1000, progress = (points / 1000) * 100;
                          if (points >= 100000) { next = 'MAX'; progress = 100; }
                          else if (points >= 20000) { next = 'Elite'; threshold = 100000; progress = ((points - 20000) / 80000) * 100; }
                          else if (points >= 5000) { next = 'Premium'; threshold = 20000; progress = ((points - 5000) / 15000) * 100; }
                          else if (points >= 1000) { next = 'Gold'; threshold = 5000; progress = ((points - 1000) / 4000) * 100; }
                          
                          return (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Next Evolution</p>
                                        <p className="text-sm font-black text-white">{next}</p>
                                    </div>
                                    <span className="text-2xl font-black text-yellow-500/50">{Math.min(100, Math.round(progress))}%</span>
                                </div>
                                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 ring-1 ring-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, progress)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-600 font-bold text-center tracking-[0.2em] uppercase">Stake more to unlock elite features</p>
                            </div>
                          );
                      })()}
                  </div>
              </Card> */}
          </div>
      </div>

      {activeDeposits.length > 0 && (
          <div className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Live Strategies</h3>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Real-time capital deployment tracking</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDeposits.map((deposit, idx) => {
                      const plan = deposit.planId || {};
                      const startDate = new Date(deposit.approvedAt);
                      const endDate = new Date(startDate);
                      endDate.setDate(endDate.getDate() + (plan.durationDays || 0));
                      
                      const daysRunning = Math.max(0, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)));
                      const progress = Math.min(100, (daysRunning / (plan.durationDays || 1)) * 100);
                      const expectedProfit = (deposit.approvedAmount * (plan.dailyRoi || 0) / 100) * (plan.durationDays || 0);
                      const currentProfit = (deposit.approvedAmount * (plan.dailyRoi || 0) / 100) * daysRunning;

                      return (
                          <motion.div
                            key={deposit._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                              <Card className="p-8 border-white/5 bg-[#121419] shadow-2xl relative overflow-hidden group hover:border-crypto-accent/40 transition-all duration-500 rounded-[40px] flex flex-col h-full">
                                   <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] group-hover:bg-emerald-500/10 transition-colors" />
                                   
                                   <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="space-y-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{plan.name || 'Core Strategy'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-4xl font-black text-white tracking-tighter">${deposit.approvedAmount?.toLocaleString()}</h4>
                                                    <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest">Active Principal Locked</p>
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center min-w-[80px] shadow-inner">
                                                <div className="text-emerald-400 font-black text-xl">+{plan.dailyRoi}%</div>
                                                <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Daily Cap</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5 my-6 flex-1">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Target Gain</p>
                                                <p className="text-xl font-black text-emerald-400">+${expectedProfit.toFixed(2)}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Accrued Profit</p>
                                                <p className="text-xl font-black text-white">${currentProfit.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Cycle Progress</p>
                                                    <p className="text-sm font-black text-white">{Math.round(progress)}% Complete</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Duration</p>
                                                    <p className="text-sm font-black text-white">{plan.durationDays} Days</p>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-1 shadow-inner relative">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 2, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-crypto-accent to-emerald-400 rounded-full relative"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                                                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]" />
                                                </motion.div>
                                            </div>
                                            
                                            <div className="flex justify-between text-[9px] text-gray-600 font-black uppercase tracking-widest pt-2">
                                                <span className="flex items-center gap-2">
                                                    <FileText className="w-3 h-3 text-indigo-400" />
                                                    Issued: {startDate.toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    Ends: {endDate.toLocaleDateString()}
                                                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                                                </span>
                                            </div>
                                        </div>
                                   </div>
                              </Card>
                          </motion.div>
                      );
                  })}
              </div>
          </div>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Activity Records</h3>
            </div>
            <Link to="/dashboard/portfolio">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-crypto-accent hover:text-white hover:bg-white/5 border border-crypto-accent/20 rounded-full px-5">
                    View Archival Records <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
            </Link>
        </div>
        
        <Card className="border-white/5 bg-[#121419]/90 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[40px]">
            <div className="overflow-x-auto overflow-y-hidden">
                 <table className="min-w-full text-left text-sm">
                    <thead className="bg-black/40 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
                        <tr>
                            <th className="px-8 py-6">Transaction Type</th>
                            <th className="px-8 py-6">Operational Details</th>
                            <th className="px-8 py-6">Net Amount (USD)</th>
                            <th className="px-8 py-6">Execution Status</th>
                            <th className="px-8 py-6 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recentTransactions.length > 0 ? recentTransactions.map((t, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={t._id || t.id} 
                                className="hover:bg-white/[0.04] transition-all duration-300 group"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                                            t.type === 'deposit' ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" : "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
                                        )}>
                                            {t.type === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                        <span className="font-black text-white text-sm uppercase tracking-widest">{t.type}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 font-bold text-xs truncate max-w-[200px]">
                                            {t.type === 'deposit' ? `Strategy Funding - ${t.planId?.name || 'Investment'}` : `Outbound to ${t.address}`}
                                        </p>
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-tight">{t.coin || 'USDT'} Network</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <span className={clsx("font-black text-lg font-mono tracking-tighter", t.type === 'deposit' ? "text-emerald-400" : "text-white")}>
                                            {t.type === 'deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </span>
                                        <p className="text-[10px] text-gray-600 font-black uppercase">Settled in USD</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={clsx(
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        t.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white" :
                                        t.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white" :
                                        "bg-rose-500/10 text-rose-500 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white"
                                    )}>
                                        <div className={clsx(
                                            "w-1.5 h-1.5 rounded-full transition-colors",
                                            t.status === 'Approved' ? "bg-emerald-500 group-hover:bg-white" :
                                            t.status === 'Pending' ? "bg-amber-500 group-hover:bg-white" :
                                            "bg-rose-500 group-hover:bg-white"
                                        )} />
                                        {t.status}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <p className="text-xs font-black text-white mb-0.5">{new Date(t.date || t.approvedAt || t.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{new Date(t.date || t.approvedAt || t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Activity className="w-16 h-16 text-white" />
                                        <p className="text-sm font-black text-white uppercase tracking-[0.3em]">No execution logs found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </Card>
      </div>
    </div>
  );
};


