import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Edit, ArrowUpRight, Ban, CheckCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';
import clsx from 'clsx';

const EditAdminModal = ({ admin, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...admin,
        password: '' // For resetting
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="w-full max-w-lg space-y-6 relative border-purple-500/50 flex flex-col">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-400" />
                        Edit Administrator
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Full Name</label>
                        <input 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Email Address</label>
                        <input 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-purple-500 outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    
                    <div className="pt-2 border-t border-zinc-800">
                        <label className="text-sm text-red-400 font-bold">New Password</label>
                        <input 
                            type="text"
                            placeholder="Leave empty to keep"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-red-500 outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers();
            const mapped = data
                .filter(item => item.user.role === 'ADMIN')
                .map(item => ({
                    id: item.user._id,
                    name: item.user.name || 'N/A',
                    email: item.user.email,
                    isActive: item.user.isActive,
                    role: item.user.role
                }));
            setAdmins(mapped);
        } catch (error) {
            toast.error("Failed to load administrators");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const filteredAdmins = admins.filter(admin => 
        admin.name.toLowerCase().includes(search.toLowerCase()) || 
        admin.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveAdmin = async (updatedAdmin) => {
        try {
            await adminService.updateUser(updatedAdmin);
            toast.success('Admin updated successfully');
            setEditingAdmin(null);
            fetchAdmins();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const toggleStatus = (admin) => {
        setConfirmModal({
            isOpen: true,
            title: admin.isActive ? 'Deactivate Admin' : 'Activate Admin',
            message: `Are you sure you want to ${admin.isActive ? 'deactivate' : 'activate'} this administrator?`,
            isDanger: admin.isActive,
            confirmText: admin.isActive ? 'Deactivate' : 'Activate',
            onConfirm: async () => {
                try {
                    await adminService.updateUser({ ...admin, isActive: !admin.isActive });
                    toast.success('Admin status updated');
                    fetchAdmins();
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    const deleteAdmin = (admin) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Administrator',
            message: `Are you sure you want to permanently delete admin ${admin.name}? This action cannot be undone.`,
            isDanger: true,
            confirmText: 'Delete Permanently',
            onConfirm: async () => {
                try {
                    await adminService.deleteUser(admin.id);
                    toast.success('Administrator deleted successfully');
                    fetchAdmins();
                } catch (error) {
                    toast.error('Failed to delete administrator');
                }
            }
        });
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-purple-500" />
                        Admin Management
                    </h2>
                    <p className="text-sm text-gray-400">View and manage platform administrators</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        placeholder="Search admins..." 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:border-purple-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-purple-500/20">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-400">
                        <thead className="bg-purple-500/5 text-gray-500 uppercase tracking-wider font-medium">
                            <tr>
                                <th className="px-6 py-3 text-purple-400/70">Name</th>
                                <th className="px-6 py-3 text-purple-400/70">Email</th>
                                <th className="px-6 py-3 text-purple-400/70">Role</th>
                                <th className="px-6 py-3 text-purple-400/70">Status</th>
                                <th className="px-6 py-3 text-right text-purple-400/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredAdmins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-purple-500/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{admin.name}</td>
                                    <td className="px-6 py-4">{admin.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase">
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1",
                                            admin.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        )}>
                                            {admin.isActive ? <CheckCircle className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className={clsx("h-8 w-8 p-0", admin.isActive ? 'text-orange-400 hover:bg-orange-500/10' : 'text-emerald-500 hover:bg-emerald-500/10')}
                                            onClick={() => toggleStatus(admin)}
                                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <Ban className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10" 
                                            onClick={() => setEditingAdmin(admin)}
                                            title="Edit Admin"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10" 
                                            onClick={() => deleteAdmin(admin)}
                                            title="Delete Admin"
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

            {editingAdmin && (
                <EditAdminModal 
                    admin={editingAdmin}
                    onClose={() => setEditingAdmin(null)}
                    onSave={handleSaveAdmin}
                />
            )}

            <ActionConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};
