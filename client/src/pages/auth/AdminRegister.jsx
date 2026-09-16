import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Shield, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../services/auth.service';
import RequirementItem from '../../components/auth/RequirementItem';
import { notify } from '../../utils/notifications';
import { validatePassword } from '../../utils/validators';

export const AdminRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerAdmin({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password
      });

      notify.success(response.message || 'Admin registered successfully');
      navigate('/auth/admin/login', { 
        state: { message: 'Admin account created successfully. Please login.' } 
      });
    } catch (err) {
      notify.apiError(err, 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordStrength = validatePassword(formData.password);

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-zinc-800';
    if (score <= 2) return 'bg-rose-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-purple-500';
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
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]"></div>
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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-400"
                 >
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                     Admin Access Portal
                 </motion.div>
                 
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl font-black tracking-tight leading-none"
                 >
                     Platform <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                         Administration
                     </span>
                 </motion.h1>
                 
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg text-gray-400 leading-relaxed max-w-lg"
                 >
                     Create your admin account to manage users, monitor transactions, and configure platform settings with full control.
                 </motion.p>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap gap-4 pt-4"
                 >
                    {['User Management', 'Transaction Control', 'Analytics', 'System Config'].map((feature, i) => (
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
                     <Link to="/" className="inline-block lg:hidden mb-6 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-xl shadow-purple-500/20">
                         <Shield className="h-6 w-6 text-white" />
                     </Link>
                     <h2 className="text-3xl font-bold text-white tracking-tight">Create Admin Account</h2>
                     <p className="text-gray-400">Register as a platform administrator.</p>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="group space-y-2">
                         <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                 <User className="w-5 h-5" />
                             </div>
                             <input
                                 name="name"
                                 type="text"
                                 required
                                 className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
                                 placeholder="Enter your full name"
                                 value={formData.name}
                                 onChange={handleChange}
                             />
                         </div>
                     </div>

                     <div className="group space-y-2">
                         <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                 <Mail className="w-5 h-5" />
                             </div>
                             <input
                                 name="email"
                                 type="email"
                                 required
                                 className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
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
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full bg-[#121419] border border-zinc-800 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all duration-300"
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
                                    passwordStrength.score === 5 ? 'text-purple-400' :
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
                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#121419] text-purple-500 focus:ring-offset-0 focus:ring-purple-500" />
                        <p className="text-sm text-gray-400">
                            I confirm that I have the authority to create an admin account and will use it responsibly.
                        </p>
                     </div>

                     <Button 
                        type="submit" 
                        className="w-full h-14 text-base font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300" 
                        isLoading={loading}
                     >
                         Create Admin Account <ArrowRight className="w-5 h-5 ml-2" />
                     </Button>

                     <p className="text-center text-sm text-gray-400">
                         Already have an account? 
                         <Link to="/auth/admin/login" className="ml-1 text-white font-bold hover:text-purple-400 transition-colors">
                             Sign in
                         </Link>
                     </p>
                 </form>

             </motion.div>
          </div>
      </div>
    </div>
  );
};
