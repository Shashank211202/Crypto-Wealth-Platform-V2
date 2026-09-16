import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { withdrawalService } from '../../services/withdrawal.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loader2, AlertCircle, ArrowDownLeft, CheckCircle2, Wallet, ArrowRight, Eye, Settings, Copy, ExternalLink, Search, Clock, XCircle, Info, Filter, History, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import { useSettings } from '../../context/SettingsContext';
import ProofModal from '../../components/modals/ProofModal';
import WithdrawalOtpModal from '../../components/dashboard/WithdrawalOtpModal';

const getStatusConfig = (status) => {
    switch (status) {
        case 'COMPLETED':
            return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Success' };
        case 'REJECTED':
            return { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Rejected' };
        case 'ADMIN_REVIEW':
        case 'FUNDS_LOCKED':
            return { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Clock, label: 'Pending Review' };
        case 'ADMIN_PROCESSING':
            return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Loader2, label: 'Processing' };
        case 'FAILED':
            return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: AlertCircle, label: 'Failed' };
        default:
            return { color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: Info, label: status };
    }
};

export const Withdraw = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  // Default values
  const [currency, setCurrency] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [customNetwork, setCustomNetwork] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState({ withdrawable: 0, locked: 0 });
  const [fullData, setFullData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedSavedWallet, setSelectedSavedWallet] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Reset selection on network/currency change
  useEffect(() => {
    setSelectedSavedWallet(null);
    setAddress('');
  }, [currency, network]);

  // Fetch wallet balance & history on mount
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [overviewData, historyData] = await Promise.all([
                 dashboardService.getOverview(),
                 withdrawalService.getMyWithdrawals()
            ]);
            
            if (overviewData) {
                 setFullData(overviewData);
                 setWalletBalance({ 
                     withdrawable: overviewData.withdrawable || 0,
                     locked: overviewData.active_deposit || 0
                 });
            }
            setWithdrawals(historyData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load wallet data");
        } finally {
            setDataLoading(false);
        }
    };
    
    if (user) {
        fetchData();
    }
  }, [user]);

  const getAssetBalance = () => {
    if (!fullData?.balances) return 0;
    
    // For USD assets (USDT/USDC), we return Liquid + Invested total from walletBalance.withdrawable
    if (currency === 'USDT' || currency === 'USDC') {
        return walletBalance.withdrawable;
    }

    const key = (currency === 'USDT' || currency === 'USDC') ? currency : `${currency}_${network}`;
    let val = fullData.balances[key] || fullData.balances[currency];
    
    if (!val) return 0;
    if (val.$numberDecimal) return parseFloat(val.$numberDecimal);
    return parseFloat(val);
  };

  if (authLoading || !user || dataLoading) {
      return <CryptoLoader />;
  }

  // Asset & Network configuration
  const ASSETS = {
    USDT: {
        name: 'Tether',
        symbol: 'USDT',
        networks: ['TRC20', 'ERC20', 'BEP20', 'SOL', 'POLYGON'],
        min: settings.minWithdrawal || 10,
        fee: Number(settings.withdrawalFee || 0)
    },
    BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        networks: ['BTC Native', 'BTC Legacy', 'BEP20 (BTC.b)'],
        min: settings.minWithdrawalBTC || 0.0001,
        fee: Number(settings.withdrawalFeeBTC || 0.00005)
    }
  };


  const handleWithdraw = async (e) => {
    if (e) e.preventDefault();
    
    if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount.");
        return;
    }

    const assetBalance = getAssetBalance();
    let withdrawalAmount = parseFloat(amount);
    
    if (currency === 'BTC') {
        const btcPrice = fullData?.btcPrice || 95000;
        withdrawalAmount = parseFloat(amount) / btcPrice;
        if (withdrawalAmount > assetBalance) {
            toast.error(`Insufficient ${currency} balance. Available: ${assetBalance.toFixed(8)}`);
            return;
        }
    } else {
        if (withdrawalAmount > assetBalance) {
            toast.error(`Insufficient ${currency} balance. Available: ${assetBalance.toFixed(2)}`);
            return;
        }
    }

    setLoading(true);

    try {
      const finalNetwork = network === 'OTHER' ? customNetwork : network;
      if (network === 'OTHER' && !finalNetwork.trim()) {
          toast.error("Please specify the network name");
          setLoading(false);
          return;
      }

      const res = await withdrawalService.createWithdrawal(withdrawalAmount, currency, finalNetwork, address, otpValue || null);
      
      toast.success("Withdrawal request submitted successfully!");
      setAmount('');
      setAddress('');
      setOtpValue('');
      setIsOtpModalOpen(false);

      // Refresh data
      const newData = await dashboardService.getOverview();
      if (newData) {
          setFullData(newData);
          setWalletBalance({ withdrawable: newData.withdrawable, locked: newData.active_deposit });
      }
    } catch (err) {
      if (err.requiresOtp) {
          setIsOtpModalOpen(true);
          toast.success("OTP sent to your email!");
      } else {
          toast.error(typeof err === 'string' ? err : (err.message || "Withdrawal failed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
      try {
          await withdrawalService.requestOtp();
          toast.success("New OTP sent to your email!");
      } catch (error) {
          toast.error(error.toString());
      }
  };


  const filteredHistory = withdrawals.filter(w => {
    const matchesSearch = (w.destinationAddress?.toLowerCase().includes(historySearch.toLowerCase()) || 
                         w.asset?.toLowerCase().includes(historySearch.toLowerCase()));
    
    if (historyFilter === 'ALL') return matchesSearch;
    if (historyFilter === 'PENDING') {
      return matchesSearch && ['ADMIN_REVIEW', 'FUNDS_LOCKED', 'ADMIN_PROCESSING'].includes(w.status);
    }
    return matchesSearch && w.status === historyFilter;
  });

  if (authLoading || !user || dataLoading) {
      return <CryptoLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <ArrowDownLeft className="w-8 h-8 text-crypto-accent" />
                Withdraw Funds
            </h2>
            <p className="text-gray-500 text-sm mt-1">Transfer your earnings to your external wallet.</p>
        </div>
        <Link to="/dashboard">
             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Cancel</Button>
        </Link>
      </div>

      <div className="relative p-8 rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-crypto-accent/20 via-black/20 to-black/40 backdrop-blur-xl transition-all duration-500" />
        <div className="absolute inset-0 border border-white/10 rounded-3xl z-10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-crypto-accent/20 rounded-full blur-[80px] group-hover:bg-crypto-accent/30 transition-all duration-700" />
        
        <div className="relative z-20 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-crypto-accent/20 text-crypto-accent animate-pulse">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Available to Withdraw</span>
                </div>
                
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-emerald-400 tracking-tight">
                        ${walletBalance.withdrawable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Liquid Funds
                    </div>
                    <span className="text-[10px] text-gray-500">Ready for transfer</span>
                </div>
            </div>

            <div className="hidden md:block opacity-30 group-hover:opacity-60 transition-opacity">
                <ArrowDownLeft className="w-24 h-24 text-white/5 rotate-[-15deg]" />
            </div>
        </div>
      </div>

      <Card className="space-y-10 p-8 pt-10 border-white/5 bg-[#121419]/80 backdrop-blur-md relative overflow-hidden">
        <form onSubmit={handleWithdraw} className="space-y-10 relative z-10">
          
          {/* Asset Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Select Asset</label>
            <div className="grid grid-cols-2 gap-4">
                {['USDT', 'BTC'].map(assetKey => {
                    const asset = ASSETS[assetKey];
                    const isActive = currency === assetKey;
                    return (
                        <div
                            key={assetKey}
                            onClick={() => {
                                setCurrency(assetKey);
                                setNetwork(asset.networks[0]);
                                setAmount('');
                            }}
                            className={clsx(
                                "relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 group/asset overflow-hidden",
                                isActive 
                                    ? "bg-crypto-accent/10 border-crypto-accent shadow-lg shadow-crypto-accent/10" 
                                    : "bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all",
                                    isActive ? "bg-crypto-accent text-white" : "bg-white/5 text-gray-500 group-hover/asset:text-gray-300"
                                )}>
                                    {assetKey === 'USDT' ? 'T' : '₿'}
                                </div>
                                <div>
                                    <p className={clsx("font-black text-sm transition-colors", isActive ? "text-white" : "text-gray-400")}>
                                        {asset.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{asset.symbol}</p>
                                </div>
                            </div>
                            {isActive && (
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-crypto-accent" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Network Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Select Network</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ASSETS[currency].networks.map((net) => (
                        <div
                            key={net}
                            onClick={() => setNetwork(net)}
                            className={clsx(
                                "px-4 py-3 rounded-xl border text-[11px] font-black cursor-pointer transition-all text-center uppercase tracking-widest",
                                network === net 
                                    ? "bg-white text-black border-white shadow-lg shadow-white/10" 
                                    : "bg-black/40 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                            )}
                        >
                            {net}
                        </div>
                    ))}
                    {currency === 'USDT' && (
                        <div
                            onClick={() => setNetwork('OTHER')}
                            className={clsx(
                                "px-4 py-3 rounded-xl border text-[11px] font-black cursor-pointer transition-all text-center uppercase tracking-widest",
                                network === 'OTHER' 
                                    ? "bg-white text-black border-white" 
                                    : "bg-black/40 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                            )}
                        >
                            OTHER
                        </div>
                    )}
                </div>
                {(network === 'OTHER' && currency === 'USDT') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1 px-1">
                        <input 
                            type="text"
                            placeholder="Specify Network Name (e.g. Cardano, XRP)"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-crypto-accent outline-none text-sm font-medium transition-all"
                            value={customNetwork}
                            onChange={(e) => setCustomNetwork(e.target.value)}
                        />
                    </div>
                )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Amount to Withdraw</label>
            <div className="relative group/input">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-black group-focus-within/input:text-crypto-accent transition-colors">$</span>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 pl-10 text-white text-2xl focus:ring-1 focus:ring-crypto-accent focus:border-crypto-accent transition-all outline-none font-black tracking-tight"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={ASSETS[currency].min}
                  step="0.01"
                />
                <button 
                    type="button"
                    onClick={() => {
                        const assetBal = getAssetBalance();
                        if (currency === 'BTC') {
                            const btcPrice = fullData?.btcPrice || 95000;
                            setAmount((assetBal * btcPrice).toFixed(2));
                        } else {
                            setAmount(assetBal.toFixed(2));
                        }
                    }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-crypto-accent hover:text-white transition-all bg-crypto-accent/10 px-3 py-1.5 rounded-lg hover:bg-crypto-accent/20 tracking-widest uppercase"
                >
                    MAX
                </button>
            </div>
            
            {currency === 'BTC' && amount > 0 && (
                <div className="flex items-center gap-2 px-2 text-crypto-accent font-black animate-in fade-in slide-in-from-top-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="text-lg">
                        {(parseFloat(amount) / (fullData?.btcPrice || 95000)).toFixed(8)} BTC
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Est. Conversion</span>
                </div>
            )}

            <div className="flex justify-between px-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Minimum: ${ASSETS[currency].min}</p>
                <p className="text-[10px] text-crypto-accent font-black uppercase tracking-widest">
                    Available: {getAssetBalance().toFixed(currency === 'BTC' ? 8 : 2)} {currency}
                </p>
            </div>
            
            {/* Fee & Calculation Section */}
            {amount > 0 && (
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-2 shadow-inner">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Withdrawal Amount:</span>
                        <span className="text-white">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Network Fee:</span>
                        <span className="text-red-400">-${ASSETS[currency].fee.toFixed(currency === 'BTC' ? 8 : 2)}</span>
                    </div>
                    <div className="border-t border-white/5 my-2 pt-3 flex justify-between items-end">
                        <span className="text-xs font-black text-crypto-accent uppercase tracking-[0.2em]">Net Receipt</span>
                        <div className="text-right">
                            <span className="text-2xl font-black text-emerald-400">
                                ${Math.max(0, parseFloat(amount) - ASSETS[currency].fee).toFixed(2)}
                            </span>
                            {currency === 'BTC' && (
                                <p className="text-[10px] text-emerald-400/60 font-black tracking-tight">
                                    ≈ {Math.max(0, (parseFloat(amount) - ASSETS[currency].fee) / (fullData?.btcPrice || 95000)).toFixed(8)} BTC
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {walletBalance.withdrawable < ASSETS[currency].min && (
                 <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Insufficient balance (Min ${Number(ASSETS[currency].min).toFixed(2)} required)
                 </p>
            )}
          </div>

          {/* Destination Wallet Section */}
          <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Destination Wallet</label>
                        <Link to="/dashboard/settings" className="text-[10px] text-crypto-accent flex items-center gap-1 hover:underline transition-opacity">
                            <Settings className="w-3 h-3" /> Manage
                        </Link>
                    </div>
                
                    {user?.savedWallets?.some(w => w.coin === currency && (w.networks?.includes(network) || w.network === network)) && (
                        <div className="flex p-1 bg-black/40 rounded-lg border border-white/5">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedSavedWallet(null);
                                    setAddress('');
                                }}
                                className={clsx(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all",
                                    !selectedSavedWallet ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                NEW
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const wallets = user.savedWallets.filter(w => w.coin === currency && (w.networks?.includes(network) || w.network === network));
                                    if (wallets.length > 0) {
                                        setSelectedSavedWallet(wallets[0]);
                                        setAddress(wallets[0].address);
                                    }
                                }}
                                className={clsx(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all",
                                    selectedSavedWallet ? "bg-crypto-accent text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                SAVED
                            </button>
                        </div>
                    )}
                </div>

                {selectedSavedWallet ? (
                    <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                        {user.savedWallets
                            .filter(w => w.coin === currency && (w.networks?.includes(network) || w.network === network))
                            .map((wallet, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    setSelectedSavedWallet(wallet);
                                    setAddress(wallet.address);
                                }}
                                className={clsx(
                                    "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden",
                                    selectedSavedWallet === wallet 
                                        ? "bg-crypto-accent/10 border-crypto-accent shadow-lg shadow-crypto-accent/10" 
                                        : "bg-[#0B0E14] border-zinc-800 hover:border-zinc-700 hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center border",
                                        selectedSavedWallet === wallet ? "bg-crypto-accent text-white border-crypto-accent" : "bg-zinc-900 border-white/10 text-gray-500"
                                    )}>
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{wallet.label || `${wallet.coin} Wallet`}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                                            {wallet.address.slice(0, 12)}...{wallet.address.slice(-12)}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(wallet.address); toast.success("Copied!"); }} className="p-2 text-gray-500 hover:text-white rounded-lg relative z-10">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="relative group">
                            <input 
                                type="text" 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 pr-12 text-white focus:border-crypto-accent/50 outline-none font-mono text-sm shadow-inner transition-all"
                                placeholder={`Enter your ${currency} (${network}) address`}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required={!selectedSavedWallet}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        {address && (
                            <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1">
                                <input 
                                    type="checkbox"
                                    id="saveWallet"
                                    checked={saveAddress}
                                    onChange={(e) => setSaveAddress(e.target.checked)}
                                    className="rounded border-white/10 bg-black/40 text-crypto-accent focus:ring-crypto-accent/50"
                                />
                                <label htmlFor="saveWallet" className="text-xs text-gray-400 select-none cursor-pointer">
                                    Save this wallet to my address book
                                </label>
                            </div>
                        )}
                    </div>
                )}
                
                <p className="text-xs text-yellow-500/60 flex items-center gap-1.5 px-2">
                    <AlertCircle className="w-3 h-3" />
                    Ensure the address matches the selected network to avoid permanent loss.
                </p>
          </div>

          <Button type="submit" className="w-full h-16 text-xl font-black shadow-2xl shadow-crypto-accent/20 rounded-[28px] uppercase tracking-widest" isLoading={loading} disabled={loading || walletBalance.withdrawable < (ASSETS[currency].min)}>
            {loading ? 'Processing Request...' : 'Confirm Withdrawal'}
          </Button>
        </form>
      </Card>
      
      {/* Transaction History Header */}
      <div className="space-y-6 mt-16 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                    <History className="w-6 h-6 text-crypto-accent" />
                    Transaction History
                </h3>
                <p className="text-xs text-gray-500 font-medium">Detailed log of your withdrawal activities and status</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-crypto-accent transition-colors" />
                    <input 
                        placeholder="Search address, asset or transaction..."
                        className="w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-crypto-accent/40 focus:ring-1 focus:ring-crypto-accent/20 outline-none transition-all placeholder:text-gray-600"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                    />
                </div>
                <div className="flex bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-1 w-full sm:w-auto">
                    {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setHistoryFilter(f)}
                            className={clsx(
                                "flex-1 sm:flex-none px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                                historyFilter === f 
                                    ? "bg-crypto-accent text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)]" 
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            {f === 'ALL' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid gap-5 px-1">
            <AnimatePresence mode="popLayout">
                {filteredHistory.length > 0 ? filteredHistory.map((w, index) => {
                    const config = getStatusConfig(w.status);
                    return (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                            key={w._id} 
                            className="group relative bg-[#0B0E14]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] overflow-hidden hover:border-white/10 hover:bg-[#0B0E14]/80 transition-all duration-500 shadow-2xl"
                        >
                            {/* Accent Glow */}
                            <div className={clsx(
                                "absolute top-0 left-0 w-1 bottom-0 opacity-60",
                                config.color.split(' ')[0].replace('text-', 'bg-')
                            )} />

                            <div className="p-8 space-y-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    {/* Left: Asset & Address info */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                                <ArrowDownLeft className="w-8 h-8 text-white group-hover:text-crypto-accent transition-colors" />
                                            </div>
                                            <div className={clsx(
                                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0B0E14] flex items-center justify-center shadow-lg",
                                                config.color.split(' ')[0].replace('text-', 'bg-')
                                            )}>
                                                <config.icon className="w-3 h-3 text-black font-bold" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-2xl font-black text-white tracking-tight">{w.asset}</h4>
                                                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 font-bold border border-white/5 uppercase tracking-widest">
                                                    {w.network}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 group/addr">
                                                <p className="text-[11px] text-gray-500 font-mono font-medium truncate max-w-[200px] lg:max-w-xs">
                                                    {w.destinationAddress}
                                                </p>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(w.destinationAddress);
                                                        toast.success("Address copied");
                                                    }}
                                                    className="p-1 text-gray-600 hover:text-white transition-colors"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Status & Actions */}
                                    <div className="flex flex-col lg:items-center gap-3">
                                        <div className={clsx(
                                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-xl transition-all duration-500",
                                            config.color
                                        )}>
                                            <config.icon className={clsx("w-3.5 h-3.5", w.status === 'ADMIN_PROCESSING' && 'animate-spin')} />
                                            {config.label}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2 ml-1 lg:ml-0">
                                            {w.proofScreenshot && (
                                                <button 
                                                    onClick={() => setSelectedProof(w.proofScreenshot)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-white hover:border-white/10 transition-all uppercase tracking-widest"
                                                >
                                                    <Eye className="w-3 h-3" /> Receipt 
                                                </button>
                                            )}
                                            {w.txHash && (
                                                <a 
                                                    href={`https://tronscan.org/#/transaction/${w.txHash}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-blue-400 hover:border-blue-400/20 transition-all uppercase tracking-widest"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Explorer
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Value & Date */}
                                    <div className="flex items-center justify-between lg:block lg:text-right shrink-0 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                                        <div className="space-y-0.5">
                                            <div className="text-3xl font-black text-white flex items-baseline lg:justify-end gap-1">
                                                <span className="text-sm text-crypto-accent font-black">$</span>
                                                {Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] lg:text-right">Withdrawal Value</p>
                                        </div>
                                        
                                        <div className="lg:mt-6 text-right">
                                            <p className="text-xs font-black text-white/50">
                                                {new Date(w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">
                                                {new Date(w.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Alert for rejections */}
                                {w.rejectionReason && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Rejection Reason</p>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                                                    "{w.rejectionReason}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Subtle status-colored glow */}
                            <div className={clsx(
                                "absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-[0.03] transition-colors duration-1000",
                                config.color.split(' ')[0].replace('text-', 'bg-')
                            )} />
                        </motion.div>
                    );
                }) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 bg-[#0B0E14]/30 border border-white/5 border-dashed rounded-[48px] flex flex-col items-center justify-center text-center px-6"
                    >
                        <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5 mb-6 group hover:rotate-12 transition-all duration-700">
                            <History className="w-10 h-10 text-gray-700 group-hover:text-crypto-accent/40 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-2xl font-black text-white/40 tracking-tight">Clean Slate</h5>
                            <p className="text-sm text-gray-600 max-w-xs mx-auto font-medium">Your financial history is empty. Once you make a withdrawal, it will be immortalized here.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
      
      <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
              Withdrawals are processed manually for security.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Average processing time: <span className="text-gray-400">2-4 hours</span>
          </div>
      </div>

      <AnimatePresence>
          {selectedProof && (
              <ProofModal imageUrl={selectedProof} onClose={() => setSelectedProof(null)} />
          )}
          {isOtpModalOpen && (
              <WithdrawalOtpModal 
                  isOpen={isOtpModalOpen}
                  onClose={() => setIsOtpModalOpen(false)}
                  user={user}
                  otpValue={otpValue}
                  setOtpValue={setOtpValue}
                  onVerify={() => handleWithdraw()}
                  loading={loading}
                  onResend={async () => {
                      try {
                          await withdrawalService.requestOtp();
                          toast.success("New OTP sent to your email!");
                      } catch (error) {
                          toast.error(error.toString());
                      }
                  }}
              />
          )}
      </AnimatePresence>
    </div>
  );
};
