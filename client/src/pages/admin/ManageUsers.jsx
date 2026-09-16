import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, X, Trash2, Ban, CheckCircle } from 'lucide-react';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import clsx from 'clsx';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { CryptoLoader } from '../../components/ui/CryptoLoader';

export const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers();
            const mapped = data.map(item => ({
                id: item.user._id,
                username: item.user.customerId,
                name: item.user.name || 'N/A',
                email: item.user.email,
                role: item.user.role,
                status: (!item.user.isActive || item.wallet?.status === 'SUSPENDED') ? 'Suspended' : 'Active',
            }));
            const filtered = mapped.filter(item => item.role !== 'ADMIN');
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

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectUser = (id) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkDelete = () => {
         const selectedIds = Array.from(selectedUsers);
         setConfirmModal({
            isOpen: true,
            title: `Delete ${selectedUsers.size} Users?`,
            message: `Are you sure you want to delete ${selectedUsers.size} selected users? This action cannot be undone.`,
            isDanger: true,
            confirmText: `Delete ${selectedUsers.size} Users`,
            onConfirm: async () => {
                try {
                    await adminService.bulkDeleteUsers(selectedIds);
                    toast.success(`${selectedIds.length} users deleted successfully`);
                    setSelectedUsers(new Set());
                    fetchUsers();
                } catch (err) {
                    toast.error(err.toString());
                }
            }
        });
    };

    const toggleStatus = (user) => {
        setConfirmModal({
            isOpen: true,
            title: user.status === 'Active' ? 'Suspend User' : 'Activate User',
            message: `Are you sure you want to ${user.status === 'Active' ? 'suspend' : 'activate'} this user?`,
            isDanger: user.status === 'Active',
            confirmText: user.status === 'Active' ? 'Suspend' : 'Activate',
            onConfirm: async () => {
                try {
                    if (user.status === 'Active') {
                        await adminService.freezeWallet(user.id);
                        toast.success('User Suspended');
                    } else {
                        await adminService.unfreezeWallet(user.id);
                        toast.success('User Activated');
                    }
                    fetchUsers();
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };
    
    const handleDeleteUser = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            isDanger: true,
            confirmText: 'Delete User',
            onConfirm: async () => {
                try {
                    await adminService.deleteUser(id);
                    toast.success('User deleted');
                    fetchUsers();
                } catch (err) {
                    toast.error('Delete failed');
                }
            }
        });
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Manage Users</h2>
                    <p className="text-sm text-gray-400">Suspend or delete user accounts</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto items-center">
                    {!isSelectionMode ? (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-white border border-dashed border-zinc-700"
                            onClick={() => setIsSelectionMode(true)}
                        >
                            Select Multiple
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedUsers(new Set()); }}>
                                Cancel
                            </Button>
                            {selectedUsers.size > 0 && (
                                <Button variant="primary" size="sm" className="bg-red-500 hover:bg-red-600" onClick={handleBulkDelete}>
                                    Delete ({selectedUsers.size})
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            placeholder="Search users..." 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:border-crypto-accent outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                   
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
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900 text-gray-500 uppercase font-medium">
                            <tr>
                                {isSelectionMode && <th className="px-6 py-3 w-10"><input type="checkbox" checked={selectedUsers.size === filteredUsers.length} onChange={toggleSelectAll} /></th>}
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={clsx("hover:bg-zinc-800/50 transition-colors", selectedUsers.has(user.id) && "bg-zinc-800/30")}>
                                    {isSelectionMode && <td className="px-6 py-4"><input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelectUser(user.id)} /></td>}
                                    <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1",
                                            user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        )}>
                                            {user.status === 'Active' ? <CheckCircle className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className={clsx("h-8 w-8 p-0", user.status === 'Active' ? 'text-orange-400 hover:bg-orange-500/10' : 'text-emerald-500 hover:bg-emerald-500/10')}
                                            onClick={() => toggleStatus(user)}
                                            title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                                        >
                                            <Ban className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" 
                                            onClick={() => handleDeleteUser(user.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ActionConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};
