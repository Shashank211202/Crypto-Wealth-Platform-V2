import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle, X, HelpCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const ActionConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    isDanger = false, 
    requireInput = false,
    inputPlaceholder = "Please provide a reason...",
    confirmText = "Confirm"
}) => {
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (requireInput && !inputValue.trim()) {
            toast.error("Please provide a reason");
            return;
        }

        try {
            setLoading(true);
            await onConfirm(inputValue);
            onClose();
        } catch (error) {
            console.error(error);
            // Error handling usually done in parent, but safety verify here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <Card className={clsx(
                "w-full max-w-md space-y-6 relative shadow-2xl bg-[#09090b]",
                isDanger ? "border-red-500/20 shadow-red-500/10" : "border-crypto-accent/20 shadow-crypto-accent/10"
            )} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isDanger ? "bg-red-500/10 text-red-500" : "bg-crypto-accent/10 text-crypto-accent"
                        )}>
                            {isDanger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Message Body */}
                    <div className="space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {message}
                        </p>
                        
                        {isDanger && (
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-xs text-red-200/70">
                                    Warning: This action cannot be undone. Please proceed with caution.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Optional Input */}
                    {requireInput && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Reason / Note</label>
                            <textarea 
                                autoFocus
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 focus:outline-none transition-all resize-none"
                                rows="3"
                                placeholder={inputPlaceholder}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                         <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                         <Button 
                            type="submit" 
                            isLoading={loading} 
                            className={clsx(
                                "flex-1 font-black uppercase tracking-widest shadow-lg",
                                isDanger 
                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                                    : "bg-crypto-accent text-white shadow-crypto-accent/20"
                            )}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ActionConfirmModal;
