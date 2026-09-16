import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Wallet, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import RequirementItem from '../../components/auth/RequirementItem';
import { notify } from '../../utils/notifications';
import { validatePassword } from '../../utils/validators';
import { SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../../utils/constants';

export const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get('ref');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      notify.error(VALIDATION_MESSAGES.PASSWORDS_MISMATCH);
      return;
    }

    try {
      const res = await register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        ref: refCode
      });

      if (res.requiresOtp) {
          setRequiresOtp(true);
          notify.success(res.message);
      } else {
          navigate('/auth/login', { 
            state: { message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS } 
          });
      }
    } catch (err) {
      notify.apiError(err, 'Registration failed');
    }
  };

  const handleVerifyOtp = async (e) => {
      e.preventDefault();
      setVerifying(true);
      try {
          await authService.verifyOtp(formData.email, otp);
          
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');

          navigate('/auth/login', { 
            state: { message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS } 
          });
      } catch (error) {
          notify.apiError(error);
      } finally {
          setVerifying(false);
      }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordStrength = validatePassword(formData.password);

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-zinc-800';
    if (score <= 2) return 'bg-rose-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (score) => {
    if (score === 0) return 'Enter Password';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full flex flex-col lg:flex-row z-10">
          {/* Left Side - Hero */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative order-last lg:order-first">
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
                     Join 50,000+ Investors
                 </motion.div>
                 
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl font-black tracking-tight leading-none"
                 >
                     Start Your <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                         Wealth Journey
                     </span>
                 </motion.h1>
                 
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg text-gray-400 leading-relaxed max-w-lg"
                 >
                     Create specific financial goals and watch your wealth grow with our automated crypto investment tools.
                 </motion.p>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap gap-4 pt-4"
                 >
                    {['Smart Portfolio', 'Auto-Invest', 'Secure Wallet', '24/7 Trading'].map((feature, i) => (
                        <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-gray-300">
                            {feature}
                        </div>
                    ))}
                 </motion.div>
             </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-8"
             >
                 <div className="text-center lg:text-left space-y-2">
                     <Link to="/" className="inline-block lg:hidden mb-6 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/20">
                         <Wallet className="h-6 w-6 text-white" />
                     </Link>
                     <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                     <p className="text-gray-400">Join us today and configure your portfolio.</p>
                 </div>

                 {!requiresOtp ? (
                 <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="group space-y-2">
                         <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                 <User className="w-5 h-5" />
                             </div>
                             <input
                                 name="name"
                                 type="text"
                                 required
                                 className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                 placeholder="Enter your full name"
                                 value={formData.name}
                                 onChange={handleChange}
                             />
                         </div>
                     </div>

                     <div className="group space-y-2">
                         <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                 <Mail className="w-5 h-5" />
                             </div>
                             <input
                                 name="email"
                                 type="email"
                                 required
                                 className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                 placeholder="Enter your email"
                                 value={formData.email}
                                 onChange={handleChange}
                             />
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-crypto-accent transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-crypto-accent focus:ring-1 focus:ring-crypto-accent transition-all duration-300"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                     </div>
                     
                     <div className="bg-[#121419] p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Password Strength</span>
                                <span className={`${
                                    passwordStrength.score === 5 ? 'text-emerald-400' :
                                    passwordStrength.score >= 3 ? 'text-amber-400' :
                                    'text-rose-400'
                                } font-medium transition-colors duration-300`}>
                                    {getStrengthText(passwordStrength.score)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`h-full ${getStrengthColor(passwordStrength.score)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <RequirementItem met={passwordStrength.length} text="8+ Characters" />
                            <RequirementItem met={passwordStrength.uppercase} text="Uppercase Letter" />
                            <RequirementItem met={passwordStrength.lowercase} text="Lowercase Letter" />
                            <RequirementItem met={passwordStrength.number} text="Number" />
                            <RequirementItem met={passwordStrength.special} text="Special Character" />
                        </ul>
                     </div>

                     <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#121419] text-crypto-accent focus:ring-offset-0 focus:ring-crypto-accent" />
                        <p className="text-sm text-gray-400">
                            By creating an account, I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>.
                        </p>
                     </div>

                     <Button 
                        type="submit" 
                        className="w-full h-14 text-base font-bold shadow-xl shadow-crypto-accent/20 hover:shadow-crypto-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                        isLoading={loading}
                     >
                         Create Account <ArrowRight className="w-5 h-5 ml-2" />
                     </Button>

                     <p className="text-center text-sm text-gray-400">
                         Already have an account? 
                         <Link to="/auth/login" className="ml-1 text-white font-bold hover:text-crypto-accent transition-colors">
                             Sign in
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
                                 We've sent a 6-digit verification code to <span className="text-white">{formData.email}</span>
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

             </motion.div>
          </div>
      </div>
    </div>
  );
};
