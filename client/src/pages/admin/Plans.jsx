import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Edit2, Save, X, Plus, TrendingUp, Clock, DollarSign, Users, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';

const PlanForm = ({ f, setF, onSubmit, onCancel, isCreate = false }) => (
    <form onSubmit={onSubmit} className="space-y-6 animate-in zoom-in-95 duration-200">
         <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Plan Name</label>
                <input 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-crypto-accent outline-none text-sm font-bold placeholder:text-gray-700"
                    placeholder="e.g. VIP Gold"
                    value={f.name}
                    onChange={e => setF({...f, name: e.target.value})}
                    required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Daily ROI (%)</label>
                    <div className="relative">
                        <input type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-white focus:border-crypto-accent outline-none text-sm font-bold" value={f.dailyRoi} onChange={e => setF({...f, dailyRoi: e.target.value})} required />
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Duration (Days)</label>
                    <div className="relative">
                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-white focus:border-crypto-accent outline-none text-sm font-bold" value={f.durationDays} onChange={e => setF({...f, durationDays: e.target.value})} required />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Deposit Limits ($)</label>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="number" placeholder="Min" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-white focus:border-crypto-accent outline-none text-sm font-bold" value={f.minDeposit} onChange={e => setF({...f, minDeposit: e.target.value})} required />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                    <div className="relative">
                        <input type="number" placeholder="Max" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-white focus:border-crypto-accent outline-none text-sm font-bold" value={f.maxDeposit} onChange={e => setF({...f, maxDeposit: e.target.value})} required />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                 </div>
            </div>
            
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Description (Optional)</label>
                <textarea 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-crypto-accent outline-none text-sm font-medium placeholder:text-gray-700 h-20 resize-none"
                    placeholder="Brief description aimed at investors..."
                    value={f.description || ''}
                    onChange={e => setF({...f, description: e.target.value})}
                />
            </div>
           
           <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer" onClick={() => setF({...f, isRecommended: !f.isRecommended})}>
               <div className={clsx("w-5 h-5 rounded border flex items-center justify-center transition-colors", f.isRecommended ? "bg-crypto-accent border-crypto-accent" : "border-gray-500")}>
                    {f.isRecommended && <CheckCircle className="w-3.5 h-3.5 text-black" />}
               </div>
               <span className="text-sm font-bold text-gray-300 pointer-events-none">Mark as Recommended / User Favorite</span>
           </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button type="submit" className="flex-1 rounded-xl py-6 shadow-lg shadow-crypto-accent/10 font-bold">
                <Save className="w-4 h-4 mr-2" /> {isCreate ? 'Create Plan' : 'Save Changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="px-6 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
                Cancel
            </Button>
        </div>
    </form>
);

export const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    
    // Create State
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        dailyRoi: '',
        durationDays: '',
        minDeposit: '',
        maxDeposit: '',
        description: '',
        isRecommended: false
    });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    // --- Create Handlers ---
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...createForm,
                dailyRoi: Number(createForm.dailyRoi),
                durationDays: Number(createForm.durationDays),
                minDeposit: Number(createForm.minDeposit),
                maxDeposit: Number(createForm.maxDeposit)
            };
            const newPlan = await adminService.createPlan(payload);
            setPlans([...plans, newPlan]);
            setIsCreating(false);
            setCreateForm({ name: '', dailyRoi: '', durationDays: '', minDeposit: '', maxDeposit: '', description: '', isRecommended: false });
            toast.success("Plan created successfully!");
        } catch (error) {
            console.error(error);
            toast.error(typeof error === 'string' ? error : "Failed to create plan");
        }
    };

    // --- Edit Handlers ---
    const startEdit = (plan) => {
        setEditingId(plan._id);
        setEditForm(plan);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (e) => {
        if (e) e.preventDefault();
        try {
            const payload = {
                ...editForm,
                dailyRoi: Number(editForm.dailyRoi),
                durationDays: Number(editForm.durationDays),
                minDeposit: Number(editForm.minDeposit),
                maxDeposit: Number(editForm.maxDeposit)
            };
            const updated = await adminService.updatePlan(editingId, payload);
            setPlans(plans.map(p => p._id === editingId ? updated : p));
            setEditingId(null);
            toast.success("Plan updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update plan");
        }
    };

    // --- Delete / Disable Handler ---
    // --- Delete / Disable Handler ---
    const handleDisable = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Disable Plan',
            message: 'Are you sure you want to disable this plan? It will no longer be available for new deposits, but existing investments will continue.',
            isDanger: true,
            confirmText: 'Disable Plan',
            onConfirm: async () => {
                try {
                    await adminService.disablePlan(id);
                    setPlans(plans.map(p => p._id === id ? { ...p, isActive: false } : p));
                    toast.success("Plan disabled.");
                } catch (error) {
                     toast.error("Failed to disable plan");
                }
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Investment Plans</h2>
                   <p className="text-gray-500 text-sm mt-1">Configure global investment options and ROI parameters.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} className="gap-2 shadow-lg shadow-crypto-accent/20">
                        <Plus className="w-4 h-4" /> Create New Plan
                    </Button>
                )}
            </div>

            {/* Create Mode Card */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Card className="border-crypto-accent/30 bg-[#121419] relative overflow-hidden mb-8">
                             <div className="absolute top-0 left-0 w-1 h-full bg-crypto-accent" />
                             <div className="p-8">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-crypto-accent" /> Create New Plan
                                </h3>
                                <PlanForm f={createForm} setF={setCreateForm} onSubmit={handleCreateSubmit} onCancel={() => setIsCreating(false)} isCreate={true} />
                             </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <CryptoLoader />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <Card key={plan._id} className={clsx(
                            "group relative p-0 overflow-hidden border-white/5 bg-[#121419] transition-all hover:border-white/10",
                            !plan.isActive && "opacity-60 grayscale filter",
                            editingId === plan._id && 'ring-2 ring-crypto-accent border-transparent'
                        )}>
                            {/* Header Gradient */}
                            <div className={clsx(
                                "h-1.5 w-full",
                                plan.isRecommended ? "bg-crypto-accent" : "bg-blue-500"
                            )} />

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                                            {plan.isRecommended && (
                                                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    Recommended
                                                </span>
                                            )}
                                             {!plan.isActive && (
                                                <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Plan Configuration</p>
                                    </div>
                                    <div className="flex gap-2">
                                         {editingId !== plan._id && (
                                            <>
                                                <button 
                                                onClick={() => startEdit(plan)} 
                                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                                                title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {plan.isActive && (
                                                    <button 
                                                    onClick={() => handleDisable(plan._id)} 
                                                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all shadow-sm"
                                                    title="Disable"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {editingId === plan._id ? (
                                        <PlanForm f={editForm} setF={setEditForm} onSubmit={saveEdit} onCancel={cancelEdit} />
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profit ROI</p>
                                                    <p className="text-xl font-black text-emerald-500">{plan.dailyRoi}% / day</p>
                                                </div>
                                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Duration</p>
                                                    <p className="text-xl font-black text-white">{plan.durationDays} Days</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-gray-500 flex items-center gap-2">
                                                        <DollarSign className="w-3.5 h-3.5" /> Range
                                                    </span>
                                                    <span className="text-white font-bold">${plan.minDeposit?.toLocaleString()} — ${plan.maxDeposit?.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-2">
                                                <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/10 w-[65%] rounded-full" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
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
