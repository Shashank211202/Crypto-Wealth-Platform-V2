import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, MoreVertical, Edit, Save, X, FileText, ArrowUpRight, PlusCircle, Ban, CheckCircle } from 'lucide-react';
import ManualWithdrawalModal from '../../components/modals/ManualWithdrawalModal';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import clsx from 'clsx';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { CryptoLoader } from '../../components/ui/CryptoLoader';

const EditInvestmentModal = ({ investment, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        status: investment.status,
        profitPercent: investment.profitPercent,
        totalCredited: investment.totalCredited,
        durationDays: investment.durationDays,
        startAt: investment.startAt ? new Date(investment.startAt).toISOString().split('T')[0] : ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(investment._id, formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-md space-y-6 border-crypto-accent/50">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Edit Investment</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <p className="text-sm font-medium text-white">
                        {investment.depositId?.planId?.name || 'Unknown Plan'}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                             {investment.depositId?.coin} ({investment.depositId?.network})
                        </span>
                    </p>
                     <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-crypto-accent">
                            Principal: ${investment.principalUSD?.toFixed(2)}
                        </p>
                         <p className="text-xs text-emerald-400 font-mono">
                            {investment.durationDays} Days
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Status</label>
                        <select 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Daily ROI (%)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                value={formData.profitPercent}
                                onChange={e => setFormData({...formData, profitPercent: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Total Credited ($)</label>
                            <input 
                                type="number" step="0.0001"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                value={formData.totalCredited}
                                onChange={e => setFormData({...formData, totalCredited: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Duration (Days)</label>
                            <input 
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                value={formData.durationDays}
                                onChange={e => setFormData({...formData, durationDays: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Start Date</label>
                            <input 
                                type="date"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                value={formData.startAt}
                                onChange={e => setFormData({...formData, startAt: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const EditUserModal = ({ user, onClose, onSave, onEditPlan }) => {
    const [formData, setFormData] = useState({
        ...user,
        liquid: user.balance.liquid,
        invested: user.balance.invested,
        isActive: user.status === 'Active', // Convert frontend status string to boolean if needed, or rely on user object
       
       
        password: '' // Only for resetting
    });
    const [userPlans, setUserPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchUserPlans = async () => {
             try {
                 const data = await adminService.getAllInvestments(user.id);
                 setUserPlans(data);
             } catch (err) {
                 toast.error("Failed to load plans");
             } finally {
                 setLoadingPlans(false);
             }
        };
        fetchUserPlans();
    }, [user.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-lg space-y-6 relative border-crypto-accent/50 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-white">Edit User</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="overflow-y-auto px-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Full Name</label>
                            <input 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm text-gray-400">Email Address (Editable)</label>
                             <input 
                                 className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
                                 value={formData.email}
                                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                             />
                        </div>
                       

                        {/* Status & Role Section */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                             
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Account Status</label>
                                <select 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                    value={formData.isActive.toString()}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Suspended</option>
                                </select>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm text-red-400 font-bold">New Password</label>
                                <input 
                                    type="text"
                                    placeholder="Leave empty to keep"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-red-500 outline-none placeholder:text-gray-600"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        

                        

                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                        <label className="text-sm text-crypto-accent font-bold">Total Balance ($)</label>
                        <input 
                            type="number" step="0.01"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-crypto-accent outline-none font-mono text-lg"
                            value={(parseFloat(formData.liquid || 0) + parseFloat(formData.invested || 0)).toFixed(2)}
                            onChange={(e) => {
                                // Changing Total affects Liquid (Default behavior: Add/Remove from available funds)
                                const newTotal = parseFloat(e.target.value || 0);
                                const currentInvested = parseFloat(formData.invested || 0);
                                const newLiquid = Math.max(0, newTotal - currentInvested);
                                setFormData({...formData, liquid: newLiquid});
                            }}
                        />
                        <p className="text-xs text-gray-500">Changing Total Balance adjusts Liquid Balance automatically.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                            <label className="text-sm text-emerald-500 font-bold">Liquid Balance ($)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
                                value={formData.liquid}
                                onChange={(e) => setFormData({...formData, liquid: parseFloat(e.target.value || 0)})}
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm text-indigo-500 font-bold">Invested Balance ($)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-indigo-500 outline-none"
                                value={formData.invested}
                                onChange={(e) => setFormData({...formData, invested: parseFloat(e.target.value || 0)})}
                            />
                        </div>
                    </div>

                    {/* Investment Plans Section */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                         <h4 className="text-sm font-bold text-white flex items-center justify-between">
                            Active Investment Plans
                            <span className="text-xs font-normal text-gray-500">
                                {loadingPlans ? 'Loading...' : `${userPlans.length} plans found`}
                            </span>
                        </h4>
                        
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {loadingPlans ? (
                                <div className="text-center py-4"><CryptoLoader size={16} /></div>
                            ) : userPlans.length > 0 ? (
                                userPlans.map(plan => (
                                    <div key={plan._id} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded border border-zinc-800 hover:border-zinc-700 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">
                                                    {plan.depositId?.planId?.name || 'Unknown'}
                                                </span>
                                                <span className={clsx(
                                                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                                    plan.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-gray-500"
                                                )}>
                                                    {plan.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                ${plan.principalUSD?.toFixed(2)} • {plan.depositId?.coin}
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => onEditPlan(plan)}
                                            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 py-2 italic text-center">No active plans found.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                             <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                             <Button type="submit" className="flex items-center gap-2">
                                 <Save className="w-4 h-4" /> Save Changes
                             </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
};

const UserPlansModal = ({ user, onClose, onEditPlan, refreshTrigger }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchPlans = async () => {
        try {
            const data = await adminService.getAllInvestments(user.id);
            setPlans(data);
        } catch (error) {
            toast.error("Failed to load user plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [user.id, refreshTrigger]);

    const filteredPlans = plans.filter(plan => {
        if (filter === 'All') return true;
        return plan.status === filter.toUpperCase();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
             <Card className="w-full max-w-4xl space-y-6 relative border-crypto-accent/50 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">Investment History</h3>
                        <p className="text-sm text-crypto-muted">All plans for {user.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-900 rounded-lg p-1">
                            {['All', 'Active', 'Completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        filter === status 
                                        ? 'bg-crypto-accent text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2">✕</button>
                    </div>
                </div>

                <div className="overflow-auto min-h-[300px]">
                    <div className="flex gap-2 mb-4 px-1">
                        <div className="text-xs text-gray-500">
                            Showing {filteredPlans.length} {filter.toLowerCase()} plans
                        </div>
                    </div>

                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900 text-gray-500 uppercase font-medium sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Plan Name</th>
                                <th className="px-4 py-3">Invested</th>
                                <th className="px-4 py-3">ROI</th>
                                <th className="px-4 py-3">Earnings</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Start Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center"><CryptoLoader size={20} /></td></tr>
                            ) : filteredPlans.length > 0 ? (
                                filteredPlans.map(plan => (
                                    <tr key={plan._id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 text-white font-medium">
                                            {plan.depositId?.planId?.name || 'Unknown Plan'}
                                            {/* <div className="text-[10px] text-gray-500">{plan.depositId?.coin} ({plan.depositId?.network})</div> */}
                                        </td>
                                        <td className="px-4 py-3 text-white font-mono">${plan.principalUSD?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-emerald-400 font-mono">{plan.profitPercent}% / day</td>
                                        <td className="px-4 py-3 text-emerald-400 font-mono font-bold">+${plan.totalCredited?.toFixed(4)}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">{plan.durationDays} days</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(plan.startAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                                plan.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-gray-500"
                                            )}>
                                                {plan.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                             <button 
                                                onClick={() => onEditPlan(plan)}
                                                className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 hover:bg-blue-500/20 rounded"
                                             >
                                                <Edit className="w-3 h-3" />
                                             </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No {filter !== 'All' ? filter.toLowerCase() : ''} investment history found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>       
        </div>
    );
}

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [viewingPlansUser, setViewingPlansUser] = useState(null);
    const [manualWithdrawUser, setManualWithdrawUser] = useState(null);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [plansRefreshTrigger, setPlansRefreshTrigger] = useState(0);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers();
            // Map backend structure { user, wallet, plan } -> frontend table structure
            const mapped = data.map(item => {
                const parseBalance = (val) => parseFloat(val?.$numberDecimal || val || 0);
                
                // Try different common keys for USDT
                const liquidUSDT = parseBalance(item.wallet?.balances?.USDT) || 
                                   parseBalance(item.wallet?.balances?.USDT_TRC20) || 
                                   parseBalance(item.wallet?.balances?.USDT_ERC20) || 
                                   (item.wallet?.balances?.USDT ? parseFloat(item.wallet.balances.USDT.toString()) : 0);
                                   
                const invested = parseFloat(item.wallet?.investmentBalanceUSD || 0);
                
                // Fallback (if no balances map)
                const safeLiquid = liquidUSDT > 0 ? liquidUSDT : parseFloat(item.wallet?.balance || 0);

                return {
                    id: item.user._id,
                    username: item.user.customerId,
                    name: item.user.name || 'N/A',
                    email: item.user.email,
                    balance: { liquid: safeLiquid, invested: invested },
                    status: (!item.user.isActive || item.wallet?.status === 'SUSPENDED') ? 'Suspended' : 'Active',
                    plan: item.plan?.planId?.name || 'None',
                    planObj: item.plan, // Keep ref for modal
                    fullUser: item.user
                };
            });
            const filtered = mapped.filter(u => u.fullUser.role !== 'ADMIN');
            setUsers(filtered);
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'All' || user.status === filter;
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleSaveUser = async (updatedUser) => {
        try {
             // 1. Update basic info
             await adminService.updateUser(updatedUser);

             // 2. Update balances if changed
             if (updatedUser.liquid !== undefined || updatedUser.invested !== undefined) {
                await adminService.updateUserBalance(updatedUser.id, {
                    liquid: updatedUser.liquid,
                    invested: updatedUser.invested
                });
             }

             toast.success('User updated successfully');
             setEditingUser(null);
             fetchUsers(); // Refresh main list
        } catch (err) {
            console.error(err);
            toast.error('Update failed');
        }
    };

    const handleSaveInvestment = async (investmentId, data) => {
        try {
            await adminService.updateInvestment(investmentId, data);
            toast.success('Investment plan updated');
            setEditingInvestment(null);
            setPlansRefreshTrigger(prev => prev + 1); // Trigger refresh in UserPlansModal
        } catch (error) {
            toast.error('Failed to update investment');
        }
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="flex gap-2 w-full md:w-auto items-center">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            placeholder="Search users..." 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:border-crypto-accent outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                   
                    {/* Tabs */}
                    <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
                        {['All', 'Active', 'Suspended'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={clsx(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    filter === status ? "bg-crypto-accent text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {status === 'All' ? 'All Users' : status}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900 text-gray-500 uppercase tracking-wider font-medium">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Balance</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-zinc-800/50 transition-colors`}>
                                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 cursor-pointer group" onClick={() => setEditingUser(user)}>
                                        <div className="flex flex-col">
                                            <span className="text-emerald-400 font-mono font-bold group-hover:text-emerald-300 transition-colors">
                                                ${(user.balance.liquid + user.balance.invested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Total Balance</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => setViewingPlansUser(user)}
                                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <FileText className="w-3 h-3" />
                                            See All
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${
                                            user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {user.status === 'Active' ? <CheckCircle className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" 
                                            title="Manual Withdrawal"
                                            onClick={() => setManualWithdrawUser(user)}
                                        >
                                            <ArrowUpRight className="w-5 h-5" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" 
                                            title="Edit"
                                            onClick={() => setEditingUser(user)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSave={handleSaveUser} 
                    onEditPlan={(plan) => setEditingInvestment(plan)}
                />
            )}
            
            {viewingPlansUser && (
                <UserPlansModal
                    user={viewingPlansUser}
                    refreshTrigger={plansRefreshTrigger} // Pass trigger
                    onClose={() => setViewingPlansUser(null)}
                    onEditPlan={(plan) => setEditingInvestment(plan)}
                />
            )}

            {editingInvestment && (
                <EditInvestmentModal
                    investment={editingInvestment}
                    onClose={() => setEditingInvestment(null)}
                    onSave={handleSaveInvestment}
                />
            )}

            {manualWithdrawUser && (
                <ManualWithdrawalModal
                    user={manualWithdrawUser}
                    onClose={() => setManualWithdrawUser(null)}
                    onSuccess={fetchUsers}
                />
            )}

            <ActionConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};
