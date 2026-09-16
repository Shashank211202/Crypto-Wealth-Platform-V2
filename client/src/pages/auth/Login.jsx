import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Wallet, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { authService } from '../../services/auth.service';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Welcome back! Redirecting to dashboard...");
      navigate('/dashboard');
    } catch (err) {
      if (err.requiresOtp) {
          setShowOtp(true);
          toast.success("Please verify your email.");
      } else {
          toast.error(err.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      setVerifying(true);
      try {
          await authService.verifyOtp(email, otp);
          toast.success('Email verified! Logging in...');
          navigate('/dashboard');
      } catch (error) {
          toast.error(error.toString());
      } finally {
          setVerifying(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full flex flex-col lg:flex-row z-10">
          {/* Left Side - Hero */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
             <div className="max-w-xl space-y-8 relative z-10">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-crypto-accent"
                 >
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                     Secure Banking Portal
                 </motion.div>
                 
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
                 >
                     Future of <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                         Digital Assets.
                     </span>
                 </motion.h1>
                 
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg text-gray-400 leading-relaxed"
                 >
                     Experience the next generation of crypto trading and investment. Secure, fast, and built for professionals.
                 </motion.p>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="grid grid-cols-2 gap-6 pt-8"
                 >
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                         <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                         <div className="text-sm text-gray-500">Uptime Guarantee</div>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                         <div className="text-3xl font-bold text-white mb-1">24/7</div>
                         <div className="text-sm text-gray-500">Dedicated Support</div>
                     </div>
                 </motion.div>
             </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-8"
             >
                 <div className="text-center lg:text-left space-y-2">
                     <Link to="/" className="inline-block lg:hidden mb-6 p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20">
                         <Wallet className="h-6 w-6 text-white" />
                     </Link>
                     <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                     <p className="text-gray-400">Please enter your details to sign in.</p>
                 </div>

                 {!showOtp ? (
                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-4">
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
                                     placeholder="Enter your email"
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                 />
                             </div>
                         </div>

                         <div className="group space-y-2">
                             <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                             <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                     <Lock className="w-5 h-5" />
                                 </div>
                                 <input
                                     type="password"
                                     required
                                     className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                     placeholder="Enter your password"
                                     value={password}
                                     onChange={(e) => setPassword(e.target.value)}
                                 />
                             </div>
                         </div>
                     </div>

                     <div className="flex items-center justify-between text-sm">
                         <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                             <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-[#121419] text-crypto-accent focus:ring-offset-0 focus:ring-crypto-accent" />
                             Remember me
                         </label>
                         <Link to="/auth/forgot-password" className="text-crypto-accent hover:text-emerald-400 transition-colors font-medium">
                             Forgot Password?
                         </Link>
                     </div>

                     <Button 
                        type="submit" 
                        className="w-full h-14 text-base font-bold shadow-xl shadow-crypto-accent/20 hover:shadow-crypto-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                        isLoading={loading}
                     >
                         Sign In <ArrowRight className="w-5 h-5 ml-2" />
                     </Button>

                     <p className="text-center text-sm text-gray-400">
                         Don't have an account? 
                         <Link to="/auth/register" className="ml-1 text-white font-bold hover:text-crypto-accent transition-colors">
                             Create free account
                         </Link>
                     </p>
                 </form>
                 ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center space-y-2">
                             <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6" />
                             </div>
                             <h3 className="text-xl font-bold text-white">Check your email</h3>
                             <p className="text-zinc-400 text-sm">
                                 We've sent a 6-digit verification code to <span className="text-white">{email}</span>
                             </p>
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-300 ml-1">Verification Code</label>
                             <input
                                 type="text"
                                 required
                                 className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300 font-mono"
                                 placeholder="000000"
                                 maxLength={6}
                                 value={otp}
                                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                             />
                             <p className="text-xs text-gray-400 text-center pt-1">
                                Didn’t receive the OTP? Please check your Mail Spam or Junk folder — the OTP email may be there.
                             </p>
                        </div>
                        <Button 
                             type="submit" 
                             className="w-full h-14 text-base font-bold shadow-xl shadow-crypto-accent/20 hover:shadow-crypto-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                             isLoading={verifying}
                         >
                             Verify Email
                         </Button>
                         <p className="text-center text-sm text-gray-500">
                             Didn't receive the code? <button type="button" className="text-crypto-accent hover:underline">Resend</button>
                         </p>
                    </form>
                 )}

                 {/* Admin Link */}
                 {/* <div className="pt-8 border-t border-white/5 text-center">
                     <Link to="/auth/admin/login" className="inline-flex items-center text-xs text-gray-600 hover:text-gray-400 transition-colors">
                         Looking for admin portal? Click here
                     </Link>
                 </div> */}
             </motion.div>
          </div>
      </div>
    </div>
  );
};
