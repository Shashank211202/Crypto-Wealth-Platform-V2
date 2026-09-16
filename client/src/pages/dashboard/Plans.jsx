import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, Zap, Shield, TrendingUp, Clock, DollarSign, Star, ArrowRight, Layers, Crown, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import PaymentModal from '../../components/dashboard/PaymentModal';

// Dynamic themes to rotate through regardless of plan name
const THEMES = [
    { color: 'from-blue-500 to-indigo-500', accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Shield },
    { color: 'from-emerald-500 to-teal-500', accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Zap },
    { color: 'from-purple-500 to-pink-500', accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Crown },
    { color: 'from-amber-500 to-orange-500', accent: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Gem },
];

export const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [modIsOpen, setModIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [plansData, overviewData] = await Promise.all([
                dashboardService.getPlans(),
                dashboardService.getOverview()
            ]);
            setPlans(plansData);
            // Overview returns `withdrawable` which is liquid. Using that as wallet balance.
            setWalletBalance(overviewData.withdrawable || 0);
        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleActivateClick = (plan) => {
      setSelectedPlan(plan);
      setModIsOpen(true);
  };

  const handlePayWallet = async (planId, amount) => {
      await dashboardService.investFromWallet(planId, amount);
      // Refresh balance
      const newData = await dashboardService.getOverview();
      setWalletBalance(newData.withdrawable || 0);
      alert("Investment Successful!"); // Using alert or toast if imported. Toast not imported in original snippet but likely available globally or I should import.
      // Assuming toast is not imported in this file yet. I'll rely on global or add import.
      // Looking at imports: Check, Zap... no toast.
      // I'll add toast import in a separate block or simple alert for now.
      // Actually, let's use a nice success feedback in Modal or just close and toast?
  };

  const handlePayExternal = (planId) => {
      navigate('/dashboard/deposit', { state: { planId } });
  };

  if (loading) return <CryptoLoader />;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="relative text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crypto-accent/10 border border-crypto-accent/20 text-crypto-accent text-xs font-bold tracking-wider uppercase mb-2">
            <Layers className="w-3 h-3" /> Exclusive Investment Opportunities
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-crypto-accent to-emerald-400">Growth Strategy</span>
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
          Maximize your crypto holdings with our precision-engineered investment tiers. 
          Professional-grade returns for every level of investor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {plans.map((plan, index) => {
            const theme = THEMES[index % THEMES.length];
            const Icon = theme.icon;
            const isRecommended = plan.isRecommended;

            return (
              <motion.div
                key={plan._id}
                layoutId={`card-${plan._id}`}
                onMouseEnter={() => setHoveredId(plan._id)}
                onMouseLeave={() => setHoveredId(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative h-full"
              >
                {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className="bg-gradient-to-r from-crypto-accent to-emerald-400 text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-crypto-accent/20 flex items-center gap-2">
                            <Star className="w-3 h-3 fill-black" /> Most Popular
                        </span>
                    </div>
                )}

                <Card className={clsx(
                    "h-full relative overflow-hidden p-0 bg-[#121419]/60 backdrop-blur-xl transition-all duration-500 border",
                    hoveredId === plan._id ? `translate-y-[-8px] shadow-2xl ${theme.border.replace('border', 'shadow')}` : "border-white/5",
                    isRecommended ? "border-crypto-accent/30" : "border-white/5"
                )}>
                  {/* Dynamic Background Accent */}
                  <div className={clsx(
                    "absolute -top-20 -right-20 w-40 h-40 blur-[80px] transition-all duration-700 opacity-20",
                    theme.bg.replace('/10', '/30')
                  )} />

                  <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plan.durationDays} Day Term</p>
                        </div>
                        <div className={clsx(
                            "p-3 rounded-2xl bg-white/5 text-white shadow-sm transition-colors duration-300",
                            hoveredId === plan._id ? theme.bg + " " + theme.accent : ""
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="mb-8 p-6 rounded-3xl bg-black/20 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="flex items-baseline gap-1">
                                <span className={clsx("text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br", theme.color)}>
                                    {plan.dailyRoi}%
                                </span>
                                <span className="text-gray-500 font-bold text-sm">/ Day</span>
                            </div>
                            <p className={clsx("text-[10px] font-black uppercase tracking-wider mt-2 flex items-center gap-1.5", theme.accent)}>
                                <TrendingUp className="w-3 h-3" /> Compounded ROI
                            </p>
                        </div>
                    </div>

                    {plan.description && (
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                            {plan.description}
                        </p>
                    )}

                    <div className="space-y-5 mb-10 flex-grow">
                        <div className="flex items-center justify-between text-sm group/item">
                            <span className="text-gray-500 flex items-center gap-2 group-hover/item:text-gray-300 transition-colors">
                                <DollarSign className="w-4 h-4 text-emerald-500/50" /> Deposit Range
                            </span>
                            <span className="text-white font-black tracking-tight">${plan.minDeposit?.toLocaleString()} - ${plan.maxDeposit?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm group/item">
                            <span className="text-gray-500 flex items-center gap-2 group-hover/item:text-gray-300 transition-colors">
                                <Clock className="w-4 h-4 text-blue-500/50" /> Duration
                            </span>
                            <span className="text-white font-black tracking-tight">{plan.durationDays} Days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm group/item">
                            <span className="text-gray-500 flex items-center gap-2 group-hover/item:text-gray-300 transition-colors">
                                <Zap className="w-4 h-4 text-orange-500/50" /> Withdrawal
                            </span>
                            <span className="text-white font-black tracking-tight">Instant Payout</span>
                        </div>
                    </div>

                    <Button 
                      onClick={() => handleActivateClick(plan)}
                      className={clsx(
                        "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 group relative overflow-hidden",
                        isRecommended 
                            ? "bg-crypto-accent hover:bg-emerald-400 text-black shadow-lg shadow-crypto-accent/20" 
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10"
                      )}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Activate Plan <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>

                  {/* Decorative progress-like bar at bottom */}
                  <div className="h-1 w-full bg-black/20">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: index * 0.2 }}
                        className={clsx(
                            "h-full transition-all duration-500 opacity-50 bg-gradient-to-r",
                            theme.color
                        )}
                      />
                  </div>
                </Card>
              </motion.div>
            );
        })}
      </div>

      <PaymentModal 
        isOpen={modIsOpen}
        onClose={() => setModIsOpen(false)}
        plan={selectedPlan}
        onPayWallet={handlePayWallet}
        onPayExternal={handlePayExternal}
        balance={walletBalance}
      />
    </div>
  );
};
