import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { depositService } from '../../services/deposit.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Upload, Copy, Wallet, ArrowRight, ShieldCheck, Loader2, CheckCircle, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { notify } from '../../utils/notifications';
import { validateAmount, validateRequired } from '../../utils/validators';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION_MESSAGES } from '../../utils/constants';

export const Deposit = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(location.state?.planId || '');
  const [amount, setAmount] = useState('');
  
  // New state for options
  const [depositOptions, setDepositOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(''); // adminWalletId
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fullData, setFullData] = useState(null);
  
  // File upload
  const [proofFile, setProofFile] = useState(null);
  const [txHash, setTxHash] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [plansData, optionsData, overviewData] = await Promise.all([
                dashboardService.getPlans(),
                depositService.getDepositOptions(),
                dashboardService.getOverview()
            ]);
            
            setPlans(plansData);
            setDepositOptions(optionsData);
            setFullData(overviewData);
            
            if (optionsData.length > 0) {
                setSelectedOptionId(optionsData[0]._id);
            }
        } catch (err) {
            console.error(err);
            notify.error(ERROR_MESSAGES.LOAD_FAILED('deposit data'));
        } finally{
            setDataLoading(false);
        }
    };
    
    fetchData();
  }, []);

  const getSelectedOption = () => depositOptions.find(o => o._id === selectedOptionId);

  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
          setProofFile(e.target.files[0]);
      }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    // Validate plan selection
    if (!selectedPlan) {
        notify.error('Please select an investment plan.');
        return;
    }

    // Validate amount against plan limits
    const planObj = plans.find(p => p._id === selectedPlan);
    if (planObj) {
        const validation = validateAmount(amount, planObj.minDeposit, planObj.maxDeposit);
        if (!validation.isValid) {
            notify.error(`${validation.error} for ${planObj.name}`);
            return;
        }
    }

    // Validate payment method
    if (!selectedOptionId) {
        notify.error('Please select a valid payment method.');
        return;
    }
    
    // Validate proof file
    if (!proofFile) {
        notify.error('Please upload the payment screenshot.');
        return;
    }
    
    // Validate TxHash if required
    if (settings?.requireTxHash && !txHash) {
        notify.error('Please enter the transaction hash.');
        return;
    }

    setLoading(true);
    try {
      await dashboardService.createDeposit(selectedPlan, amount, proofFile, selectedOptionId, txHash);
      notify.success(SUCCESS_MESSAGES.DEPOSIT_SUBMITTED);
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      notify.apiError(err, ERROR_MESSAGES.SUBMIT_FAILED('Deposit request'));
    } finally {
      setLoading(false);
    }
  };

  const selectedWallet = getSelectedOption();
  const walletAddress = selectedWallet?.address || 'Loading...';
  const coinLabel = selectedWallet ? `${selectedWallet.coin} (${selectedWallet.network})` : 'Select Method';

  const handleCopy = () => {
      if (!walletAddress) return;
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      notify.success(SUCCESS_MESSAGES.ADDRESS_COPIED, { position: 'bottom-center' });
      setTimeout(() => setCopied(false), 2000);
  };

  if (dataLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <Loader2 className="w-12 h-12 text-crypto-accent animate-spin" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Gateway...</p>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
          <div className="space-y-2">
              <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-crypto-accent/20 text-crypto-accent">
                      <Wallet className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight">Deposit Funds</h2>
              </div>
              <p className="text-gray-500 text-base font-medium pl-1">Fuel your account and start earning daily ROI.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#121419] border border-white/5 text-xs font-black text-emerald-400 uppercase tracking-widest shadow-xl">
              <ShieldCheck className="w-4 h-4" />
              End-to-End Encrypted
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Plan Selection Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pl-1">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-sm">01</div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Select Your Plan</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plans.map(p => (
                        <div 
                            key={p._id}
                            onClick={() => setSelectedPlan(p._id)}
                            className={clsx(
                                "cursor-pointer p-6 rounded-[32px] border transition-all duration-500 flex flex-col gap-4 relative overflow-hidden group",
                                selectedPlan === p._id 
                                    ? "bg-crypto-accent/10 border-crypto-accent shadow-2xl shadow-crypto-accent/10" 
                                    : "bg-[#0B0E14] border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className={clsx(
                                "absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] transition-all duration-1000",
                                selectedPlan === p._id ? "bg-crypto-accent/20 opacity-100" : "bg-white/5 opacity-0 group-hover:opacity-100"
                            )} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-1">
                                    <h4 className={clsx("font-black text-lg transition-colors", selectedPlan === p._id ? "text-white" : "text-gray-400 group-hover:text-white")}>{p.name}</h4>
                                    <div className={clsx(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border",
                                        selectedPlan === p._id ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/5"
                                    )}>
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {p.dailyRoi}% ROI
                                    </div>
                                </div>
                                <div className={clsx(
                                    "w-8 h-8 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                    selectedPlan === p._id ? "bg-crypto-accent border-crypto-accent text-white" : "bg-black/40 border-white/10 text-gray-700 group-hover:border-white/20"
                                )}>
                                    <CheckCircle className={clsx("w-5 h-5", selectedPlan === p._id ? "opacity-100 scale-100" : "opacity-0 scale-50 transition-all")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Min Entry</p>
                                    <p className={clsx("font-black text-sm", selectedPlan === p._id ? "text-white" : "text-gray-400")}>{formatCurrency(p.minDeposit)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Max Cap</p>
                                    <p className={clsx("font-black text-sm", selectedPlan === p._id ? "text-white" : "text-gray-400")}>{formatCurrency(p.maxDeposit)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* Amount & Asset Selection */}
              <Card className="p-8 border-white/5 bg-[#121419]/80 backdrop-blur-xl relative overflow-hidden rounded-[40px] shadow-2xl space-y-10">
                <form onSubmit={handleDeposit} className="space-y-10 relative z-10">
                    
                    {/* Payment Method Cards */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] pl-1">Choose Asset</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {depositOptions.map(opt => {
                                const isActive = selectedOptionId === opt._id;
                                return (
                                    <div
                                        key={opt._id}
                                        onClick={() => setSelectedOptionId(opt._id)}
                                        className={clsx(
                                            "relative p-5 rounded-[28px] border cursor-pointer transition-all duration-500 group/asset overflow-hidden",
                                            isActive 
                                                ? "bg-white/5 border-crypto-accent shadow-xl ring-1 ring-crypto-accent/20" 
                                                : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg transition-all shadow-inner",
                                                isActive ? "bg-crypto-accent" : "bg-white/5 text-gray-600 group-hover/asset:text-gray-400"
                                            )}>
                                                {opt.coin?.[0]}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className={clsx("font-black text-sm transition-colors", isActive ? "text-white" : "text-gray-500 group-hover/asset:text-gray-300")}>
                                                    {opt.coin}
                                                </p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">{opt.network}</p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-4 right-4 animate-in zoom-in-50 duration-300 text-crypto-accent">
                                                <div className="w-2 h-2 rounded-full bg-crypto-accent shadow-[0_0_12px_rgba(var(--crypto-accent-rgb),0.8)]" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] pl-1">Deposit Amount (USD)</label>
                        <div className="relative group/input">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-2xl font-black group-focus-within/input:text-crypto-accent transition-colors">$</span>
                            <input 
                                type="number" 
                                className="w-full bg-black/40 border border-white/10 rounded-[28px] px-8 pl-12 py-6 text-white text-3xl focus:ring-2 focus:ring-crypto-accent/20 focus:border-crypto-accent/50 outline-none font-black tracking-tight placeholder:text-white/5 transition-all shadow-inner"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <div className="h-8 w-[1px] bg-white/10" />
                                <span className="text-gray-600 font-black text-sm uppercase tracking-widest pl-2">USD</span>
                            </div>
                        </div>

                        {amount > 0 && selectedWallet?.coin?.includes('BTC') && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-crypto-accent/10 border border-crypto-accent/20 animate-in slide-in-from-top-2 duration-500">
                                <TrendingUp className="w-5 h-5 text-crypto-accent animate-pulse" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.1em]">Estimated Receive Amount</p>
                                    <p className="text-lg font-black text-white">
                                        {(parseFloat(amount) / (fullData?.btcPrice || 95000)).toFixed(8)} BTC
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Execution Block */}
                    <div className="space-y-6 pt-6 ">
                         <div className="flex items-center gap-3 pl-1 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs">03</div>
                            <h4 className="text-sm font-black text-white tracking-widest uppercase">Transaction Gateway</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/60 rounded-[32px] p-8 border border-white/5 shadow-inner">
                            {/* QR Section */}
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-white rounded-[24px] shadow-2xl shadow-white/5 ring-8 ring-white/5 hover:ring-white/10 transition-all duration-700 group/qr active:scale-95">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${walletAddress}&bgcolor=ffffff&color=000000`}
                                        alt="Wallet QR Code" 
                                        className="w-40 h-40 opacity-90 group-hover/qr:opacity-100 transition-opacity"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    Scan to Pay
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Official Receiver Address</label>
                                    <div 
                                        onClick={handleCopy}
                                        className="group flex flex-col items-start bg-black/40 p-5 rounded-[24px] border border-white/5 cursor-pointer hover:border-crypto-accent/40 transition-all active:scale-[0.98] relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center w-full mb-3">
                                            <span className="text-[10px] font-black text-crypto-accent bg-crypto-accent/10 px-3 py-1 rounded-lg uppercase tracking-widest">{selectedWallet?.network} NETWORK</span>
                                            <Copy className={clsx("w-4 h-4 transition-all", copied ? "text-emerald-400 scale-125" : "text-gray-700 group-hover:text-white")} />
                                        </div>
                                        <code className="text-white text-xs break-all font-mono leading-relaxed line-clamp-2 pr-6">{walletAddress}</code>
                                        
                                        {copied && (
                                            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                                                <span className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Copied to Clipboard
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                                    <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5" /> Important Notice
                                    </p>
                                    <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                                        Only send the selected currency via the specified network. Sending any other asset or using wrong network will result in permanent loss.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proof Upload Area */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pl-1">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs">04</div>
                            <h4 className="text-sm font-black text-white tracking-widest uppercase">Payment Confirmation</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                 onClick={() => fileInputRef.current?.click()}
                                 className={clsx(
                                     "relative border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden",
                                     proofFile 
                                        ? "border-emerald-500/30 bg-emerald-500/5" 
                                        : "border-white/5 bg-black/20 hover:border-crypto-accent/50 hover:bg-crypto-accent/5 group"
                                 )}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                
                                {proofFile ? (
                                    <div className="text-center animate-in zoom-in duration-500 relative z-10">
                                        <div className="w-16 h-16 rounded-3xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] mx-auto mb-4 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-white font-black text-sm block mb-1">Receipt Loaded</span>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2">{proofFile.name.slice(0, 20)}...</p>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-gray-600 hover:border-white pb-0.5">Change Receipt</span>
                                    </div>
                                ) : (
                                    <div className="text-center relative z-10 space-y-4">
                                        <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 group-hover:bg-crypto-accent group-hover:border-crypto-accent group-hover:scale-110 flex items-center justify-center mx-auto transition-all duration-500 shadow-xl">
                                            <Upload className="w-7 h-7 text-gray-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-gray-500 group-hover:text-white transition-colors block uppercase tracking-widest">Attach Screenshot</span>
                                            <span className="text-[9px] text-gray-700 mt-2 block font-bold">MAX SIZE 5MB (JPG, PNG)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {settings?.requireTxHash && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Transaction Hash (Recommended)</label>
                                         <input 
                                             type="text"
                                             className="w-full bg-black/40 border border-white/10 rounded-[20px] px-6 py-5 text-white focus:border-crypto-accent/50 outline-none font-mono text-xs shadow-inner transition-all placeholder:text-gray-800"
                                             placeholder="0x... or network ID"
                                             value={txHash}
                                             onChange={e => setTxHash(e.target.value)}
                                         />
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-blue-500/5 border border-blue-500/10 flex gap-4">
                                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                            Providing a transaction hash significantly speeds up the verification process as we can instantly track it on the explorer.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-20 text-xl font-black shadow-2xl shadow-crypto-accent/20 rounded-[32px] uppercase tracking-[0.2em] mt-10" isLoading={loading} disabled={loading}>
                        {loading ? 'Processing Transaction...' : 'Confirm Deposit'}
                    </Button>
                </form>
              </Card>
          </div>

          {/* Info Side Panel */}
          <div className="lg:col-span-4 space-y-8">
                <Card className="p-8 border-white/5 bg-gradient-to-br from-[#121419] to-[#0B0E14] relative overflow-hidden rounded-[40px] shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-accent/5 rounded-full blur-2xl" />
                    <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Quick Guide</h3>
                    <div className="space-y-8 relative z-10">
                        {[
                            { step: '01', title: 'Choose Strategy', desc: 'Select an investment plan that fits your risk appetite and objectives.' },
                            { step: '02', title: 'Payment Setup', desc: 'Choose your preferred cryptocurrency and network from the available options.' },
                            { step: '03', title: 'Execute Transfer', desc: 'Copy the wallet address or scan the QR code to send exactly the amount desired.' },
                            { step: '04', title: 'File Confirmation', desc: 'Upload a clear screenshot of the payment receipt to finalize your request.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-5 group items-start">
                                <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white font-black text-xs transition-all duration-500 group-hover:bg-crypto-accent group-hover:border-crypto-accent group-hover:scale-110 shadow-lg">
                                    {item.step}
                                </span>
                                <div className="space-y-1 pt-1">
                                    <p className="text-sm font-black text-white transition-colors group-hover:text-crypto-accent uppercase tracking-widest">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10 space-y-4 relative overflow-hidden group hover:bg-emerald-500/10 transition-all duration-700">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">Safe & Secured</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium relative z-10">
                        Your transaction is processed through a secure high-availability gateway. Verification typically takes <span className="text-emerald-400 font-black">1-2 hours</span>.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] py-4">
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    System Version v2.4.0
                </div>
          </div>
      </div>
    </div>
  );
};
