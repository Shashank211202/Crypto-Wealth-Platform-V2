import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Eye } from 'lucide-react';

const ConfirmWithdrawalModal = ({ withdrawal, onClose, onConfirm }) => {
    const [txHash, setTxHash] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!withdrawal) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(withdrawal.id, txHash, proofFile);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <Card className="w-full max-w-lg space-y-6 relative border-emerald-500/20 shadow-2xl bg-[#09090b]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <CheckCircle className="w-5 h-5 text-emerald-500" />
                             Complete Withdrawal
                        </h3>
                        <p className="text-sm text-gray-400">Add payment proof for ${withdrawal.amount.toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Transaction Hash (TxID) <span className="text-zinc-600 font-normal normal-case">(Optional)</span></label>
                        <input 
                            type="text"
                            placeholder="e.g. 0x123...abc"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-crypto-accent focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Payment Screenshot <span className="text-zinc-600 font-normal normal-case">(Optional)</span></label>
                        <div className="relative group/file">
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="screenshot-upload"
                            />
                            <label 
                                htmlFor="screenshot-upload"
                                className="flex flex-col items-center justify-center w-full min-h-[140px] bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                            >
                                {preview ? (
                                    <div className="relative w-full h-full p-2">
                                        <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                                            <p className="text-white text-xs font-bold">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-6">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                            <Eye className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400 font-medium font-mono group-hover:text-white">Click to upload screenshot</p>
                                            <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">PNG, JPG, JPEG up to 2MB</p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                         <Button type="button" variant="outline" onClick={onClose} className="flex-1 opacity-50 hover:opacity-100">Cancel</Button>
                         <Button type="submit" isLoading={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                            Confirm & Notify User
                         </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ConfirmWithdrawalModal;
