import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Wallet, ArrowRight, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth.service';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request Email, 2: Enter OTP & New Password
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Reset code sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err || "Failed to send reset code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success("Password reset successful! Please login with your new password.");
      navigate('/auth/login');
    } catch (err) {
      toast.error(err || "Failed to reset password. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full flex items-center justify-center p-6 lg:p-12 z-10">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md space-y-8"
         >
             <div className="text-center space-y-2">
                 <Link to="/" className="inline-block mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20">
                     <Lock className="h-8 w-8 text-white" />
                 </Link>
                 <h2 className="text-3xl font-bold text-white tracking-tight">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                 </h2>
                 <p className="text-gray-400">
                    {step === 1 
                        ? "No worries, we'll send you reset instructions." 
                        : "Enter the 6-digit code we sent to your email."}
                 </p>
             </div>

             <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.form 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleRequestOtp} 
                        className="space-y-6"
                    >
                        <div className="group space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 text-base font-bold shadow-xl shadow-crypto-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                            isLoading={loading}
                        >
                            Send Reset Code <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
                        </Link>
                    </motion.form>
                ) : (
                    <motion.form 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleResetPassword} 
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="group space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Verification Code</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-4 text-white tracking-[0.2em] font-mono placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <p className="text-xs text-gray-400 text-center pt-1">
                                        Didn’t receive the OTP? Please check your Mail Spam or Junk folder — the OTP email may be there.
                                    </p>
                                </div>
                            </div>

                            <div className="group space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                        placeholder="Min. 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 text-base font-bold shadow-xl shadow-crypto-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                            isLoading={loading}
                            disabled={otp.length !== 6 || newPassword.length < 8}
                        >
                            Reset Password <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        <button 
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                        >
                           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Try different email
                        </button>
                    </motion.form>
                )}
             </AnimatePresence>
         </motion.div>
      </div>
    </div>
  );
};
