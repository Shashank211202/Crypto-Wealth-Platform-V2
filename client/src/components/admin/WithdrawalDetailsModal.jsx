import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowUpRight, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const WithdrawalDetailsModal = ({ withdrawal, onClose, onAction }) => {
    if (!withdrawal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <Card className="w-full max-w-2xl space-y-6 relative border-crypto-accent/20 shadow-2xl bg-[#09090b]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <ArrowUpRight className="w-5 h-5 text-crypto-accent" />
                             Withdrawal Request
                        </h3>
                        <p className="text-sm text-gray-400">Request ID: #{withdrawal.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Withdrawal Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            Transaction Details
                        </h4>
                        <div className="bg-zinc-900/50 p-5 rounded-xl space-y-4 border border-zinc-800">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Amount Requested</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-bold text-white tracking-tight">${withdrawal.amount.toLocaleString()}</p>
                                    <span className="text-sm text-zinc-500 font-medium">{withdrawal.currency}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1.5">Destination Address ({withdrawal.network})</p>
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {navigator.clipboard.writeText(withdrawal.address); toast.success('Address copied');}}>
                                    <p className="text-white font-mono text-xs break-all bg-black/30 p-3 rounded-lg w-full border border-zinc-700/50 group-hover:border-crypto-accent/30 transition-colors">
                                        {withdrawal.address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-zinc-500">Date: <span className="text-zinc-300">{withdrawal.date}</span></span>
                                <span className="text-zinc-500">Fee: <span className="text-zinc-300">$0.00</span></span>
                            </div>
                        </div>
                    </div>
                    
                    {/* User Info / Proof Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            {withdrawal.status === 'Completed' ? 'Payment Proof' : 'User Profile'}
                        </h4>
                        {withdrawal.status === 'Completed' && withdrawal.proofScreenshot ? (
                            <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                                <img src={withdrawal.proofScreenshot} alt="Proof" className="w-full h-32 object-cover rounded-lg mb-2" />
                                <div className="p-2 space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">TxHash</p>
                                    <p className="text-[11px] text-zinc-300 font-mono break-all line-clamp-2">{withdrawal.txHash}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 p-5 rounded-xl space-y-4 border border-zinc-800">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold ring-1 ring-indigo-500/20">
                                        {withdrawal.user?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{withdrawal.user}</p>
                                        <p className="text-xs text-gray-500">{withdrawal.email}</p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-zinc-800 text-gray-400 border border-zinc-700/50`}>
                                        Status: {withdrawal.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-500 mb-0.5">Verification Required</p>
                        <p className="text-xs text-yellow-200/60 leading-relaxed">
                            Ensure the destination address is valid. Once approved, funds are locked and pending manual transfer confirmation.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    {withdrawal.status === 'Funds locked' || withdrawal.status === 'Pending' ? (
                        <>
                            <Button variant="danger" onClick={() => onAction(withdrawal.id, 'reject')} className="flex items-center gap-2 px-6">
                                <XCircle className="w-4 h-4" /> Reject Request
                            </Button>
                            <Button onClick={() => onAction(withdrawal.id, 'approve')} className="flex items-center gap-2 px-6 shadow-lg shadow-crypto-accent/20 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest">
                                <CheckCircle className="w-4 h-4" /> Approve & Complete
                            </Button>
                        </>
                    ) : withdrawal.status === 'Admin processing' ? (
                        <>
                            <Button onClick={() => onAction(withdrawal.id, 'confirm')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                                <CheckCircle className="w-4 h-4 mr-2" /> Complete & Send Proof
                            </Button>
                        </>
                    ) : (
                        <div className={clsx(
                            "px-4 py-2 rounded-lg font-medium flex items-center gap-2",
                            withdrawal.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {withdrawal.status === 'Completed' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            Request {withdrawal.status}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WithdrawalDetailsModal;
