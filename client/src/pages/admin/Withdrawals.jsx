import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle, ArrowUpRight, Search, Wallet, Copy, Filter, TrendingUp, DollarSign, PlusCircle } from 'lucide-react';
import ManualWithdrawalModal from '../../components/modals/ManualWithdrawalModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { withdrawalService } from '../../services/withdrawal.service';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import ConfirmWithdrawalModal from '../../components/admin/ConfirmWithdrawalModal';
import WithdrawalDetailsModal from '../../components/admin/WithdrawalDetailsModal';
import StatCard from '../../components/admin/StatCard';

export const Withdrawals = () => {

    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending'); // Default to Pending for better UX
    const [searchQuery, setSearchQuery] = useState('');
    const [showManualWithdrawal, setShowManualWithdrawal] = useState(false);

    const fetchWithdrawals = async () => {
        try {
            const data = await withdrawalService.getAllWithdrawals();
            const formatted = data.map(w => ({
                id: w._id,
                user: w.userId?.name || 'Unknown User',
                email: w.userId?.email || 'N/A',
                amount: w.amount,
                currency: w.asset || 'USD',
                network: w.network || 'Bank',
                address: w.destinationAddress || '',
                status: w.status?.charAt(0).toUpperCase() + w.status?.slice(1).toLowerCase().replace('_', ' ') || 'Unknown',
                date: new Date(w.createdAt).toLocaleDateString(),
                proofScreenshot: w.proofScreenshot,
                txHash: w.txHash
            }));
            setWithdrawals(formatted);
        } catch (error) {
            toast.error("Failed to load withdrawals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    // Memoized Stats
    const stats = useMemo(() => {
        const pending = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Funds locked').length;
        const processing = withdrawals.filter(w => w.status === 'Admin processing').length;
        const totalPaid = withdrawals
            .filter(w => w.status === 'Completed')
            .reduce((sum, w) => sum + Number(w.amount), 0);

        return { pending, processing, totalPaid };
    }, [withdrawals]);

    // Filter & Search Logic
    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter(w => {
            const matchesTab = 
                activeTab === 'All' ? true :
                activeTab === 'Pending' ? (w.status === 'Pending' || w.status === 'Funds locked') :
                activeTab === 'Processing' ? w.status === 'Admin processing' :
                activeTab === 'Completed' ? w.status === 'Completed' :
                activeTab === 'Rejected' ? w.status === 'Rejected' : true;

            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                (w.user?.toLowerCase() || '').includes(q) || 
                (w.email?.toLowerCase() || '').includes(q) || 
                (w.address?.toLowerCase() || '').includes(q);

            return matchesTab && matchesSearch;
        });
    }, [withdrawals, activeTab, searchQuery]);

    const [confirmingWithdrawal, setConfirmingWithdrawal] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                // Now approve triggers the confirmation modal directly
                setConfirmingWithdrawal(withdrawals.find(w => w.id === id));
                return;
            } else if (action === 'reject') {
                setConfirmModal({
                    isOpen: true,
                    title: 'Reject Withdrawal',
                    message: 'Are you sure you want to reject this withdrawal request? Please provide a reason.',
                    isDanger: true,
                    requireInput: true,
                    inputPlaceholder: "Enter rejection reason...",
                    confirmText: "Reject Request",
                    onConfirm: async (reason) => {
                         try {
                            await withdrawalService.rejectWithdrawal(id, reason || "Rejected by admin");
                            toast.success(`Withdrawal rejected!`);
                            fetchWithdrawals();
                            setSelectedWithdrawal(null);
                        } catch (error) {
                            toast.error(typeof error === 'string' ? error : "Action failed");
                        }
                    }
                });
                return;
            } else if (action === 'confirm') {
                setConfirmingWithdrawal(withdrawals.find(w => w.id === id));
                return;
            }
            // Fallback (shouldn't be reached for main actions now)
            fetchWithdrawals();
            setSelectedWithdrawal(null);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Action failed");
        }
    };

    const handleConfirmSubmit = async (id, txHash, proofFile) => {
        try {
            await withdrawalService.confirmWithdrawal(id, txHash, proofFile);
            toast.success("Withdrawal completed and proof uploaded!");
            fetchWithdrawals();
            setSelectedWithdrawal(null);
            setConfirmingWithdrawal(null);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Confirmation failed");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied to clipboard!");
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Manage Payouts</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and fulfill user withdrawal requests.</p>
                </div>
                <Button 
                    onClick={() => setShowManualWithdrawal(true)}
                    className="bg-crypto-accent hover:bg-crypto-accent/80 text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-full shadow-lg shadow-crypto-accent/20 flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" /> Manual Withdrawal
                </Button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Awaiting Approval" 
                    value={stats.pending} 
                    icon={Clock} 
                    color="text-yellow-500" 
                />
                <StatCard 
                    title="In Processing" 
                    value={stats.processing} 
                    icon={TrendingUp} 
                    color="text-blue-500" 
                />
                <StatCard 
                    title="Total Paid Out" 
                    value={`$${stats.totalPaid.toLocaleString()}`} 
                    icon={DollarSign} 
                    color="text-emerald-500" 
                />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-[#09090b] p-1 rounded-xl border border-white/5 w-fit">
                    {['Pending', 'Processing', 'Completed', 'Rejected', 'All'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-tighter",
                                activeTab === tab ? "bg-zinc-800 text-white shadow-sm" : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-crypto-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search user, email or wallet address..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#09090b] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-crypto-accent/50 transition-all font-mono"
                    />
                </div>
            </div>

             <Card className="overflow-hidden border-white/5 bg-[#121419] shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#09090b] text-gray-500 uppercase tracking-wider font-medium text-[10px]">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/20">
                            {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                {w.user.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-crypto-accent transition-colors">{w.user}</div>
                                                <div className="text-[10px] text-gray-600 font-mono">{w.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-bold text-white text-lg">${w.amount.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-600 uppercase tracking-widest">{w.currency} via {w.network}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 group/addr">
                                            <span className="font-mono text-xs text-gray-500 truncate max-w-[120px]">{w.address}</span>
                                            <button 
                                                onClick={() => copyToClipboard(w.address)}
                                                className="p-1.5 rounded bg-white/5 opacity-0 group-hover/addr:opacity-100 hover:bg-white/10 text-gray-400 transition-all"
                                                title="Copy Address"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-600">{w.date}</td>
                                    <td className="px-6 py-4">
                                           <span className={clsx(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex w-fit items-center gap-1.5 border whitespace-nowrap",
                                            w.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            w.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            w.status === 'Admin processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        )}>
                                            <span className={clsx("w-1 h-1 rounded-full",
                                                w.status === 'Completed' ? 'bg-emerald-500' :
                                                w.status === 'Rejected' ? 'bg-red-500' :
                                                w.status === 'Admin processing' ? 'bg-blue-500 animate-pulse' :
                                                'bg-yellow-500'
                                            )}></span>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedWithdrawal(w)} className="hover:bg-white/5 hover:text-white h-8 w-8 p-0 rounded-full border border-white/5">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {(w.status === 'Pending' || w.status === 'Funds locked') && (
                                                <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/5">
                                                    <Button size="sm" className="bg-emerald-500 text-black hover:bg-emerald-600 px-3 h-8 rounded-full text-[10px] font-black" onClick={() => handleAction(w.id, 'approve')}>
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="danger" className="h-8 w-8 p-0 rounded-full" onClick={() => handleAction(w.id, 'reject')}>
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {w.status === 'Admin processing' && (
                                                 <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600 px-4 h-8 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20" onClick={() => handleAction(w.id, 'confirm')}>
                                                    Confirm
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Filter className="w-10 h-10 opacity-10" />
                                            <p className="text-sm font-medium">No payouts matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AnimatePresence>
                {selectedWithdrawal && (
                    <WithdrawalDetailsModal 
                        withdrawal={selectedWithdrawal} 
                        onClose={() => setSelectedWithdrawal(null)} 
                        onAction={handleAction}
                    />
                )}
                {confirmingWithdrawal && (
                    <ConfirmWithdrawalModal 
                        withdrawal={confirmingWithdrawal}
                        onClose={() => setConfirmingWithdrawal(null)}
                        onConfirm={handleConfirmSubmit}
                    />
                )}
                {showManualWithdrawal && (
                    <ManualWithdrawalModal
                        onClose={() => setShowManualWithdrawal(false)}
                        onSuccess={fetchWithdrawals}
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
