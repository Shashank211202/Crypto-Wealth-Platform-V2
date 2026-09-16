import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, ArrowUpRight, DollarSign, Wallet, Hash, PlusCircle, Search, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { withdrawalService } from '../../services/withdrawal.service';
import { adminService } from '../../services/admin.service';

const ManualWithdrawalModal = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        userId: user?.id || '',
        userEmail: user?.email || '',
        amount: '',
        asset: 'USDT',
        network: 'TRC20',
        destinationAddress: '',
        txHash: '',
        status: 'COMPLETED'
    });
    const [loading, setLoading] = useState(false);
    
    // User Search State
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsLoadingUsers(true);
            adminService.getUsers()
                .then(setUsers)
                .catch(() => toast.error("Failed to load users list"))
                .finally(() => setIsLoadingUsers(false));
        }
    }, [user]);

    const filteredUsers = users.filter(item => 
        (item.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.user?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const handleSelectUser = (selectedUser) => {
        setFormData(prev => ({
            ...prev, 
            userId: selectedUser._id, // Ensure we use _id
            userEmail: selectedUser.email
        }));
        setSearchQuery(selectedUser.email); // Show email as selected value
        setShowUserDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userId) return toast.error("Please select a user");
        
        try {
            setLoading(true);
            await withdrawalService.createManualWithdrawal(formData);
            toast.success("Manual withdrawal created successfully");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
// ... existing catch ...
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in" onClick={onClose}>
            <Card className="w-full max-w-lg space-y-6 relative border-crypto-accent/50 shadow-2xl bg-[#09090b]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-crypto-accent/10 flex items-center justify-center text-crypto-accent">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Manual Withdrawal</h3>
                            <p className="text-xs text-gray-400">Process funds for {formData.userEmail || 'selected user'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Selection (Only if user not provided) */}
                    {!user && (
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Select User</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-9 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowUserDropdown(true);
                                        // If cleared, clear selection
                                        if (!e.target.value) setFormData(prev => ({...prev, userId: '', userEmail: ''}));
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                />
                            </div>
                            
                            {/* Dropdown Results */}
                            {showUserDropdown && searchQuery && !formData.userId && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121419] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
                                    {isLoadingUsers ? (
                                        <div className="p-3 text-center text-xs text-gray-500">Loading...</div>
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map(item => (
                                            <div
                                                key={item.user?._id}
                                                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                                                onClick={() => handleSelectUser(item.user)}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-xs text-gray-500">No users found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Amount (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-9 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Asset</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                                value={formData.asset}
                                onChange={e => setFormData({...formData, asset: e.target.value})}
                            >
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Network</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                            value={formData.network}
                            onChange={e => setFormData({...formData, network: e.target.value})}
                        >
                            <option value="TRC20">TRON (TRC20)</option>
                            <option value="ERC20">Ethereum (ERC20)</option>
                            <option value="BEP20">BSC (BEP20)</option>
                            <option value="BTC">Bitcoin Network</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Destination Address</label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                required
                                placeholder="Paste user's wallet address"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-9 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                                value={formData.destinationAddress}
                                onChange={e => setFormData({...formData, destinationAddress: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Transaction Hash (Optional)</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                placeholder="e.g. 0xabcdef..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-9 py-3 text-sm text-white focus:border-crypto-accent outline-none transition-all"
                                value={formData.txHash}
                                onChange={e => setFormData({...formData, txHash: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-crypto-accent text-white font-black uppercase tracking-widest shadow-lg shadow-crypto-accent/20">
                            {loading ? 'Processing...' : 'Complete Withdrawal'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ManualWithdrawalModal;
