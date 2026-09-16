
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, User, Search, Filter, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import clsx from 'clsx';

export const Investments = () => {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = async () => {
        try {
            const data = await adminService.getAllInvestments();
            setInvestments(data);
        } catch (error) {
            toast.error("Failed to load investments");
        } finally {
            setLoading(false);
        }
    };

    const filtered = investments.filter(inv => {
        const matchesSearch = 
            inv.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.userId?.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">User Investments</h2>
                   <p className="text-gray-500 text-sm mt-1">Monitor all active and completed investment plans.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        className="w-full bg-[#121419] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white focus:border-crypto-accent outline-none"
                        placeholder="Search by user name, email or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-[#121419] p-1 rounded-xl border border-white/5">
                    {['ALL', 'ACTIVE', 'COMPLETED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                filterStatus === status ? "bg-crypto-accent text-white shadow-lg" : "text-gray-500 hover:text-white"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="border-white/5 bg-[#121419] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900/50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Invested</th>
                                <th className="px-6 py-4">Earnings</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4 text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length > 0 ? filtered.map(inv => {
                                const startDate = new Date(inv.startAt);
                                const now = new Date();
                                const diffTime = Math.abs(now - startDate);
                                const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const totalDuration = inv.durationDays || 1;
                                const progress = Math.min(100, (daysElapsed / totalDuration) * 100);
                                return (
                                    <tr key={inv._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
                                                     {inv.userId?.name?.charAt(0) || 'U'}
                                                 </div>
                                                 <div>
                                                     <div className="font-bold text-white">{inv.userId?.name || 'Unknown'}</div>
                                                     <div className="text-[10px] text-gray-500">{inv.userId?.email}</div>
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{inv.depositId?.planId?.name || 'Custom Plan'}</div>
                                            <div className="text-xs text-emerald-500">{inv.profitPercent}% Daily</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white">
                                            ${inv.principalUSD?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">
                                            +${(inv.totalCredited || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                                inv.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(inv.startAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="w-24 ml-auto h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-crypto-accent rounded-full" 
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1">{daysElapsed} / {inv.durationDays} Days</div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No investments found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
