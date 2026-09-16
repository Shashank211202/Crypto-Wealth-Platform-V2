
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownLeft, TrendingUp, Calendar, Hash, ExternalLink, Activity } from 'lucide-react';
import { Button } from '../ui/Button';

const TransactionModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isDeposit = transaction.type === 'DEPOSIT';
    const isWithdrawal = transaction.type === 'WITHDRAWAL';
    const amount = parseFloat(transaction.amount?.$numberDecimal || transaction.amount || 0);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Transaction Details
                        </h3>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Status Badge & Amount */}
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                                isDeposit ? 'bg-emerald-500/20 text-emerald-500' : 
                                isWithdrawal ? 'bg-red-500/20 text-red-500' : 'bg-crypto-accent/20 text-crypto-accent'
                            }`}>
                                {isDeposit ? <ArrowDownLeft className="w-8 h-8" /> : 
                                 isWithdrawal ? <ArrowUpRight className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">
                                {isWithdrawal ? '-' : '+'}{amount.toFixed(4)} <span className="text-lg text-zinc-500">{transaction.coin}</span>
                            </h2>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                transaction.balanceAfter ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                                {transaction.type.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4 bg-black/20 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                <div className="flex items-center gap-3 text-zinc-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Date</span>
                                </div>
                                <span className="text-white text-sm font-medium">
                                    {new Date(transaction.createdAt).toLocaleString()}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                <div className="flex items-center gap-3 text-zinc-400">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-sm">Network</span>
                                </div>
                                <span className="text-white text-sm font-medium uppercase">{transaction.network}</span>
                            </div>

                            {transaction.referenceId && (
                                <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                    <div className="flex items-center gap-3 text-zinc-400">
                                        <Hash className="w-4 h-4" />
                                        <span className="text-sm">Ref ID</span>
                                    </div>
                                    <span className="text-white text-xs font-mono truncate max-w-[150px]" title={transaction.referenceId}>
                                        {transaction.referenceId}
                                    </span>
                                </div>
                            )}
                            
                            {transaction.remark && (
                                 <div className="flex flex-col gap-1 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Remark</span>
                                    <p className="text-white text-sm italic">"{transaction.remark}"</p>
                                </div>
                            )}

                        </div>

                         {/* Action Buttons */}
                        <div className="grid grid-cols-1 gap-3">
                             {/* If we had a TX Hash, we could link to explorer */}
                             <Button onClick={onClose} variant="secondary" className="w-full">
                                 Close
                             </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TransactionModal;
