import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import clsx from 'clsx';

const DepositDetailsModal = ({ deposit, onClose, onAction, onViewProof }) => {
    if (!deposit) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <Card 
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[min(90vh,800px)] overflow-y-auto space-y-6 relative border-crypto-accent/20 shadow-2xl bg-[#09090b] scrollbar-hide"
            >
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Deposit Details</h3>
                        <p className="text-sm text-gray-400">Reviewing transaction #{deposit.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-zinc-900/50 rounded-xl space-y-3 border border-zinc-800">
                             <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">User Profile</p>
                                <span className="text-[10px] font-mono text-crypto-accent bg-crypto-accent/10 px-2 py-0.5 rounded border border-crypto-accent/20">ID: {deposit.userId}</span>
                             </div>
                             <div>
                                <p className="text-white font-medium text-lg">{deposit.user}</p>
                                <p className="text-xs text-crypto-muted">{deposit.email}</p>
                             </div>
                            </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl space-y-1 border border-zinc-800">
                             <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">Plan</p>
                                <span className="text-xs font-mono text-emerald-400 font-bold">{deposit.plan.roi}% / {deposit.plan.duration} days</span>
                             </div>
                             <p className="text-white font-medium text-lg">{deposit.plan.name}</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl space-y-1 border border-zinc-800">
                            <p className="text-sm text-gray-400">Deposit Amount</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">${deposit.amount.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 font-medium">USD</span>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl space-y-2 border border-zinc-800">
                            <p className="text-sm text-gray-400">Transaction Details</p>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 block">Transaction ID:</span>
                                <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded border border-white/5">{deposit.txId || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-xs text-gray-500">Method: <span className="text-white">{deposit.coin}</span></span>
                                <span className="text-xs text-gray-500">Date: <span className="text-white">{deposit.date}</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 font-medium">Payment Proof</p>
                        <div className="aspect-video bg-black/40 rounded-xl flex items-center justify-center border border-zinc-800 overflow-hidden relative group">
                            {deposit.proofImage ? (
                                <>
                                    <img src={deposit.proofImage} alt="Proof" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => onViewProof(deposit.proofImage)}
                                            className="border-white text-white hover:bg-white hover:text-black font-black uppercase text-[10px] tracking-widest"
                                        >
                                            View Full Size
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-2">
                                    <AlertCircle className="w-8 h-8 text-gray-600 mx-auto" />
                                    <span className="text-gray-500 text-sm">No proof uploaded</span>
                                </div>
                            )}
                        </div>
                        {(deposit.status === 'Pending' || deposit.status === 'On Hold') && (
                            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                                <p className="text-xs text-yellow-200/70">
                                    Please verify the transaction ID on the blockchain explorer before approving.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    {(deposit.status === 'Pending' || deposit.status === 'On Hold') && (
                        <>
                            <Button variant="danger" onClick={() => onAction(deposit.id, 'reject')} className="flex items-center gap-2 px-6">
                                <XCircle className="w-4 h-4" /> Reject
                            </Button>
                            {deposit.status !== 'On Hold' && (
                                <Button variant="ghost" onClick={() => onAction(deposit.id, 'hold')} className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Hold
                                </Button>
                            )}
                            <Button onClick={() => onAction(deposit.id, 'approve')} className="flex items-center gap-2 px-6 shadow-lg shadow-crypto-accent/20">
                                <CheckCircle className="w-4 h-4" /> Approve
                            </Button>
                        </>
                    )}
                     {(deposit.status === 'Approved' || deposit.status === 'Rejected') && (
                        <div className={clsx(
                            "px-4 py-2 rounded-lg font-medium flex items-center gap-2",
                            deposit.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {deposit.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            Request {deposit.status}
                        </div>
                     )}
                </div>
            </Card>
        </div>
    );
};

export default DepositDetailsModal;
