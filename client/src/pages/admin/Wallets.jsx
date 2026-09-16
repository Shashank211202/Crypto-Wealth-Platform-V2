import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Copy, Wallet as WalletIcon, Check, QrCode, Share2, ShieldCheck, X, Upload } from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';

export const Wallets = () => {
    const [wallets, setWallets] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);
    const [viewingQr, setViewingQr] = useState(null);
    const [formData, setFormData] = useState({ coin: '', network: '', address: '' });
    const [copiedId, setCopiedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        setLoading(true);
        try {
            const data = await walletService.getAdminWallets();
            setWallets(data.map(w => ({
                id: w._id,
                coin: w.coin,
                network: w.network,
                address: w.address,
                active: w.isActive,
                logoUrl: w.logoUrl
            })));
        } catch (error) {
            toast.error("Failed to load wallets");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Wallet',
            message: 'Are you sure you want to delete this wallet? Users will no longer be able to see this address for deposits.',
            isDanger: true,
            confirmText: 'Delete Wallet',
            onConfirm: async () => {
                try {
                    await walletService.deleteAdminWallet(id);
                    setWallets(prev => prev.filter(w => w.id !== id));
                    toast.success('Wallet deleted');
                } catch (error) {
                    toast.error('Failed to delete wallet');
                }
            }
        });
    };

    const handleCopy = (address, id) => {
        navigator.clipboard.writeText(address);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Prepare FormData
        const data = new FormData();
        data.append('coin', formData.coin);
        data.append('network', formData.network);
        data.append('address', formData.address);
        if (formData.logoFile) {
            data.append('logo', formData.logoFile);
        }

        try {
            if (editingWallet) {
                // Update existing
                // Reuse isActive since it's not in the form explicitly yet but preserved
                data.append('isActive', editingWallet.active); 
                
                const updated = await walletService.updateAdminWallet(editingWallet.id, data);
                
                setWallets(wallets.map(w => w.id === editingWallet.id ? { 
                    ...w, 
                    address: updated.address, 
                    active: updated.isActive,
                    logoUrl: updated.logoUrl 
                } : w));
                
                toast.success('Wallet updated');
            } else {
                // Create new
                const newWallet = await walletService.createAdminWallet(data);
                setWallets([...wallets, { 
                    id: newWallet._id, 
                    coin: newWallet.coin, 
                    network: newWallet.network, 
                    address: newWallet.address, 
                    active: newWallet.isActive,
                    logoUrl: newWallet.logoUrl 
                }]);
                toast.success('Wallet created');
            }
            closeModal();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Operation failed');
        }
    };

    const openEdit = (wallet) => {
        setEditingWallet(wallet);
        setFormData({ coin: wallet.coin, network: wallet.network, address: wallet.address });
        setIsAdding(true);
    };

    const closeModal = () => {
        setIsAdding(false);
        setEditingWallet(null);
        setFormData({ coin: '', network: '', address: '' });
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Deposit Wallets</h2>
                   <p className="text-gray-500 text-sm mt-1">Manage public addresses for receiving user deposits.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 shadow-lg shadow-crypto-accent/20">
                    <Plus className="w-4 h-4" /> Add New Asset
                </Button>
            </div>

            {/* EDIT / ADD MODAL */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border-white/10 bg-[#121419] p-8 relative shadow-2xl">
                                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-lg bg-crypto-accent/10 text-crypto-accent">
                                        {editingWallet ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {editingWallet ? `Edit ${editingWallet.coin}` : 'Add New Asset'}
                                    </h3>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="flex gap-4">
                                        <div onClick={() => document.getElementById('wallet-logo-upload').click()} className="shrink-0 w-24 h-24 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center cursor-pointer hover:border-crypto-accent/50 transition-all overflow-hidden relative group/upload">
                                            <input 
                                                id="wallet-logo-upload"
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if(e.target.files?.[0]) {
                                                        setFormData(prev => ({...prev, logoFile: e.target.files[0]}));
                                                    }
                                                }}
                                            />
                                            {formData.logoFile ? (
                                                <img src={URL.createObjectURL(formData.logoFile)} className="w-full h-full object-cover" />
                                            ) : editingWallet?.logoUrl ? (
                                                <img src={editingWallet.logoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-6 h-6 text-gray-500 group-hover/upload:text-crypto-accent transition-colors" />
                                                    <span className="text-[10px] text-gray-500 mt-1">Logo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Asset</label>
                                                    <input 
                                                        disabled={!!editingWallet}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white focus:border-crypto-accent outline-none disabled:opacity-50" 
                                                        placeholder="e.g. USDT"
                                                        value={formData.coin}
                                                        onChange={e => setFormData({...formData, coin: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Network</label>
                                                    <input 
                                                        disabled={!!editingWallet}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white focus:border-crypto-accent outline-none disabled:opacity-50" 
                                                        placeholder="e.g. TRC20"
                                                        value={formData.network}
                                                        onChange={e => setFormData({...formData, network: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Deposit Address</label>
                                                <input 
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white focus:border-crypto-accent outline-none font-mono text-sm" 
                                                    placeholder="0x..."
                                                    value={formData.address}
                                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                        <Button variant="ghost" type="button" onClick={closeModal} className="text-gray-500 rounded-xl">Cancel</Button>
                                        <Button type="submit" className="px-8 rounded-xl">
                                            {editingWallet ? 'Save Changes' : 'Deploy Wallet'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* QR CODE MODAL */}
            <AnimatePresence>
                {viewingQr && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setViewingQr(null)}
                    >
                         <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-black font-bold text-xl mb-1">{viewingQr.coin} <span className="text-gray-400 text-sm">({viewingQr.network})</span></h3>
                            <p className="text-gray-500 text-xs mb-6 break-all font-mono">{viewingQr.address}</p>
                            
                            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner inline-block mx-auto mb-6">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${viewingQr.address}`} 
                                    className="w-60 h-60 object-contain rounded-lg" 
                                    alt="Wallet QR"
                                />
                            </div>
                            
                            <Button 
                                onClick={() => setViewingQr(null)} 
                                className="w-full bg-black text-white hover:bg-gray-800 rounded-xl"
                            >
                                Close
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wallets.map(wallet => (
                    <Card key={wallet.id} className="relative group p-0 overflow-hidden border-white/5 bg-[#121419] hover:border-white/10 transition-all hover:translate-y-[-4px] duration-300">
                        {/* Status Bar */}
                        <div className={`h-1 w-full ${wallet.active ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                        
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white relative overflow-hidden">
                                        {wallet.logoUrl ? (
                                            <img src={wallet.logoUrl} alt={wallet.coin} className="w-full h-full object-cover" />
                                        ) : (
                                            <WalletIcon className="w-7 h-7" />
                                        )}
                                        {wallet.active && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121419]" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl">{wallet.coin}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{wallet.network}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(wallet)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(wallet.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="relative group/addr bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:bg-black/60 overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-crypto-accent/20" />
                                     <div className="flex items-center justify-between gap-3">
                                         <span className="text-xs font-mono text-gray-400 truncate">{wallet.address}</span>
                                         <button 
                                            onClick={() => handleCopy(wallet.address, wallet.id)}
                                            className="shrink-0 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all active:scale-90"
                                         >
                                            {copiedId === wallet.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                         </button>
                                     </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => setViewingQr(wallet)} variant="outline" className="flex-1 text-[10px] py-1.5 h-auto rounded-xl border-white/5 bg-white/5 hover:bg-white/10 gap-2 font-bold uppercase tracking-wider">
                                        <QrCode className="w-3 h-3" /> View QR
                                    </Button>
                                    <Button variant="outline" className="text-[10px] py-1.5 h-auto rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-wider">
                                        <Share2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {!isAdding && (
                    <div 
                        onClick={() => setIsAdding(true)}
                        className="border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-crypto-accent/30 hover:bg-crypto-accent/5 transition-all duration-300 min-h-[250px]"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-crypto-accent group-hover:bg-crypto-accent/10 transition-all mb-4">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h4 className="text-gray-500 font-bold group-hover:text-white transition-colors">Add New Asset</h4>
                        <p className="text-gray-600 text-xs mt-1 text-center">Support more cryptocurrencies for your users.</p>
                    </div>
                )}
            </div>

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
