import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '../ui/Button';

const WithdrawalOtpModal = ({ isOpen, onClose, user, otpValue, setOtpValue, onVerify, loading, onResend }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
    >
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#121419] border border-white/5 rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="w-40 h-40 text-crypto-accent" />
            </div>

            <div className="relative z-10 space-y-8 text-center">
                <div className="w-20 h-20 bg-crypto-accent/20 rounded-3xl flex items-center justify-center text-crypto-accent mx-auto border border-crypto-accent/20 shadow-xl shadow-crypto-accent/10">
                    <Shield className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Security Verification</h3>
                    <p className="text-gray-500 text-sm font-medium">To protect your funds, we've sent a 6-digit verification code to <span className="text-white">{user?.email}</span>.</p>
                </div>

                <div className="space-y-4">
                    <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000 000"
                        autoFocus
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && otpValue.length === 6) {
                                onVerify();
                            }
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-center text-3xl font-black tracking-[0.5em] text-crypto-accent focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent/20 outline-none transition-all placeholder:opacity-20"
                    />
                    <p className="text-xs text-gray-400 text-center pt-1">
                        Didn't receive the OTP? Please check your Mail Spam or Junk folder — the OTP email may be there.
                    </p>
                    <div className="flex justify-between items-center px-1">
                        <button 
                            onClick={onResend}
                            type="button"
                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            Resend Code
                        </button>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Verification Required</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl h-14 border-white/5 font-black uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={onVerify}
                        isLoading={loading}
                        disabled={otpValue.length !== 6}
                        className="flex-1 rounded-2xl h-14 shadow-xl shadow-crypto-accent/20 font-black uppercase tracking-widest text-xs"
                    >
                        Verify Transfer
                    </Button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

export default WithdrawalOtpModal;
