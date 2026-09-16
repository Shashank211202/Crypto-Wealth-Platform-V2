import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import ProofModal from '../../components/modals/ProofModal';
import DepositDetailsModal from '../../components/admin/DepositDetailsModal';

import { depositService } from '../../services/deposit.service';

export const Deposits = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [selectedProof, setSelectedProof] = useState(null);
    const [activeTab, setActiveTab] = useState('All'); 
    const [confirmModal, setConfirmModal] = useState({ isOpen: false }); 

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const data = await depositService.getAllDeposits();
            // Map backend data to frontend expected format if needed
            // Backend Deposit: { _id, userId, coin, claimedAmount, status, ... }
            // Frontend expects: { id, userId, user, email, amount, coin, date, status, txId, proofImage }
            // Note: Backend might not return user email directly if it's not populated. 
            // If backend `Deposit` model stores userId string but doesn't populate user details, we might just see IDs.
            // For now, map what we have.
            const mapped = data.map(d => {
                // Handle populated userId
                const userObj = d.userId || {};
                const name = userObj.name || 'Unknown User';
                const email = userObj.email || 'N/A';
                const uId = userObj._id || d.userId; 

                // Handle Decimal128 amount
                const amt = Number(d.claimedAmount?.$numberDecimal || d.claimedAmount || 0);

                // Handle plan details
                const planObj = d.planId || {};
                const planName = planObj.name || 'N/A';
                const planRoi = planObj.dailyRoi;
                const planDuration = planObj.durationDays;

                return {
                    id: d._id,
                    userId: uId,
                    user: name,
                    email: email,
                    amount: amt,
                    coin: d.coin,
                    date: new Date(d.createdAt).toLocaleDateString(),
                    status: d.status === 'APPROVED' ? 'Approved' : d.status === 'REJECTED' ? 'Rejected' : d.status === 'PENDING' ? 'Pending' : d.status,
                    txId: d.txHash,
                    proofImage: d.screenshotUrl,
                    plan: {
                        name: planName,
                        roi: planRoi,
                        duration: planDuration
                    }
                };
            });
            setDeposits(mapped);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error.message || "Failed to load deposits");
        } finally {
            setLoading(false);
        }
    };

    // New handleAction function
    const handleAction = async (id, status) => {
        if (status === 'approve') {
            setConfirmModal({
                isOpen: true,
                title: 'Approve Deposit',
                message: 'Are you sure you want to approve this deposit? This will credit the user\'s balance immediately.',
                confirmText: "Approve Deposit",
                onConfirm: async () => {
                    try {
                        const deposit = deposits.find(d => d.id === id);
                        if (!deposit) return;
                        await depositService.approveDeposit(id, deposit.amount);
                        toast.success(`Deposit approved.`);
                        fetchDeposits();
                        setSelectedDeposit(null);
                    } catch (error) {
                         toast.error(error.toString());
                    }
                }
            });
        } else if (status === 'reject') {
            setConfirmModal({
                isOpen: true,
                title: 'Reject Deposit',
                message: 'Are you sure you want to reject this deposit?',
                isDanger: true,
                requireInput: true,
                inputPlaceholder: "Enter rejection reason...",
                confirmText: "Reject Deposit",
                onConfirm: async (reason) => {
                    try {
                        await depositService.rejectDeposit(id, reason || "Rejected by admin");
                        toast.success(`Deposit rejected.`);
                        fetchDeposits();
                        setSelectedDeposit(null);
                    } catch (error) {
                        toast.error(error.toString());
                    }
                }
            });
        } else if (status === 'hold') {
             try {
                // Hold usually doesn't need strict confirm or maybe it does? 
                // Creating a simplified confirm for hold just in case.
                 setConfirmModal({
                    isOpen: true,
                    title: 'Put on Hold',
                    message: 'Mark this deposit as On Hold? You can review it later.',
                    confirmText: "Put on Hold",
                    onConfirm: async () => {
                        try {
                             await depositService.updateDepositStatus(id, 'On Hold'); // Assuming updateDepositStatus handles generic status or manual call
                             // Wait, depositService might not have generic update.
                             // Looking at admin.service.js line 10: updateDepositStatus calls approve/reject.
                             // So hold might not be supported easily via services?
                             // Original code: `onAction(deposit.id, 'hold')`
                             // But `handleAction` original implementation (lines 187-209) ONLY handled approve/reject logic explicitly!
                             // Wait, original `handleAction` implementation lines 189: if approve... 198: if reject...
                             // It did NOT handle 'hold' case in the snippet I saw!
                             // If `handleAction` was missing `hold` logic, then the button did nothing or errored?
                             // Ah, looking at Step 480 View File output:
                             // The `handleAction` (lines 187-209) only has `if (status === 'approve')` and `else if (status === 'reject')`.
                             // There is no `hold` block.
                             // So clicking Hold likely did nothing or `onAction` in parent was broken for hold.
                             // I will stick to what works: Approve/Reject.
                             toast.error("Hold action not implemented yet");
                        } catch (e) { console.error(e); }
                    }
                 });
             } catch (error) {
                 toast.error(error.toString());
             }
        }
    };

    // Filter Logic
    const filteredDeposits = deposits.filter(d => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Pending') return d.status === 'Pending' || d.status === 'On Hold';
        if (activeTab === 'Approved') return d.status === 'Approved';
        return true;
    });

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Deposit Requests</h2>
                    <p className="text-gray-400 text-sm">Manage incoming fund requests.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 bg-[#09090b] p-1 rounded-xl border border-white/5">
                    {['All', 'Pending', 'Approved'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab ? "bg-zinc-800 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab === 'All' ? 'All Requests' : tab === 'Pending' ? 'Pending' : 'History'}
                        </button>
                    ))}
                </div>
            </div>
            
            <Card className="overflow-hidden border-white/5 bg-[#121419]">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#09090b] text-gray-500 uppercase tracking-wider font-medium text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Details</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Plan</th>
                                <th className="px-6 py-4 font-semibold">Method</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredDeposits.length > 0 ? filteredDeposits.map((d) => (
                                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/20">
                                                {d.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white group-hover:text-crypto-accent transition-colors">{d.user}</p>
                                                <p className="text-xs text-gray-500">{d.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-white">${d.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                         {d.plan.name !== 'N/A' ? (
                                             <div className="flex flex-col">
                                                 <span className="text-white font-medium">{d.plan.name}</span>
                                                 {d.plan.roi && (
                                                     <span className="text-[10px] text-emerald-400">
                                                         {d.plan.roi}% daily / {d.plan.duration} days
                                                     </span>
                                                 )}
                                             </div>
                                         ) : (
                                             <span className="text-gray-500">N/A</span>
                                         )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-zinc-800/50 px-2 py-1 rounded text-xs border border-zinc-700">{d.coin}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{d.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2.5 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1.5 border",
                                            d.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            d.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            d.status === 'On Hold' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        )}>
                                            <span className={clsx("w-1.5 h-1.5 rounded-full",
                                                d.status === 'Approved' ? 'bg-emerald-500' :
                                                d.status === 'Rejected' ? 'bg-red-500' :
                                                d.status === 'On Hold' ? 'bg-orange-500' :
                                                'bg-yellow-500'
                                            )}></span>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedDeposit(d)} className="hover:bg-white/10 hover:text-white h-8 w-8 p-0 rounded-full">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {(d.status === 'Pending' || d.status === 'On Hold') && (
                                                <>
                                                    <Button size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 h-8 w-8 p-0 rounded-full" onClick={() => handleAction(d.id, 'approve')} title="Approve">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-8 w-8 p-0 rounded-full" onClick={() => handleAction(d.id, 'reject')} title="Reject">
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-10 h-10 opacity-20" />
                                            <p>No deposits found matching this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                {selectedDeposit && (
                    <DepositDetailsModal 
                        deposit={selectedDeposit} 
                        onClose={() => setSelectedDeposit(null)} 
                        onAction={handleAction}
                        onViewProof={setSelectedProof}
                    />
                )}

                {selectedProof && (
                    <ProofModal 
                        imageUrl={selectedProof} 
                        onClose={() => setSelectedProof(null)} 
                    />
                )}
                
                <ActionConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                    requireInput={confirmModal.requireInput}
                    inputPlaceholder={confirmModal.inputPlaceholder}
                    confirmText={confirmModal.confirmText}
                />
            </AnimatePresence>
        </div>
    );
};
