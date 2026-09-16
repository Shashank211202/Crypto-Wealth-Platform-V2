import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const PaymentModal = ({ isOpen, onClose, plan, onPayWallet, onPayExternal, balance }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('external'); // 'wallet' | 'external'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && plan) {
            setAmount(plan.minDeposit || '');
            setError('');
        }
    }, [plan, isOpen]);

    if (!isOpen || !plan) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (method === 'external') {
            onPayExternal(plan._id);
            return; // Navigation handled by parent
        }
        // Wallet Logic
        if (!amount || isNaN(amount)) {
            setError("Please enter a valid amount");
            return;
        }
        if (parseFloat(amount) < plan.minDeposit || parseFloat(amount) > plan.maxDeposit) {
            setError(`Amount must be between $${plan.minDeposit} and $${plan.maxDeposit}`);
            return;
        }
        if (parseFloat(amount) > balance) {
            setError("Insufficient wallet balance");
            return;
        }
        setLoading(true);
        try {
            await onPayWallet(plan._id, amount);
            onClose();
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-0 border-white/5 bg-[#121419] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <h3 className="text-xl font-bold text-white">Activate {plan.name}</h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <Check className="w-5 h-5 rotate-45" /> 
                        {/* Reuse check icon rotated as X or import X. Using Check rotated is hacky, let's use text X or similar if X not imported. imported Check, Zap etc. import X from lucide. */}
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* <button
                                type="button"
                                onClick={() => setMethod('wallet')}
                                className={clsx(
                                    "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                                    method === 'wallet' ? "border-crypto-accent bg-crypto-accent/10 text-white" : "border-white/5 bg-black/20 text-gray-400 hover:border-white/10"
                                )}
                            >
                                <div className="text-sm font-bold mb-1">Wallet Balance</div>
                                <div className="text-xs opacity-70">Pay with available funds</div>
                                {method === 'wallet' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-crypto-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                            </button> */}
                            <button
                                type="button"
                                onClick={() => setMethod('external')}
                                className={clsx(
                                    "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                                    method === 'external' ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/5 bg-black/20 text-gray-400 hover:border-white/10"
                                )}
                            >
                                <div className="text-sm font-bold mb-1">New Deposit</div>
                                <div className="text-xs opacity-70">External Transfer</div>
                                {method === 'external' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                            </button>
                        </div>
                    </div>

                    {/* {method === 'wallet' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                            <div className="flex justify-between items-center text-xs px-1">
                                <label className="font-bold text-gray-500 uppercase tracking-widest">Investment Amount</label>
                                <span className={clsx("font-mono font-bold", balance < parseFloat(amount || 0) ? "text-red-400" : "text-emerald-400")}>
                                    Available: ${balance.toFixed(2)}
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input 
                                    type="number"
                                    required
                                    min={plan.minDeposit}
                                    max={plan.maxDeposit}
                                    placeholder={`${plan.minDeposit} - ${plan.maxDeposit}`}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-crypto-accent outline-none transition-all font-mono font-bold"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 px-1 font-medium">
                                <span>Min: ${plan.minDeposit}</span>
                                <span>Max: ${plan.maxDeposit}</span>
                            </div>
                        </div>
                    )} */}
                    
                    {method === 'external' && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm animate-in slide-in-from-top-2 fade-in">
                            You will be redirected to the deposit page to complete your payment via crypto transfer.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-bold animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <Button type="submit" isLoading={loading} className="w-full py-6 font-black text-sm uppercase tracking-widest gap-2 shadow-lg shadow-crypto-accent/20">
                        {method === 'wallet' ? 'Confirm Investment' : 'Proceed to Deposit'} <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default PaymentModal;
