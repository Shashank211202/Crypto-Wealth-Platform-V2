import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Lock, Mail, ArrowRight, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const user = await login(email, password);
      // Enforce admin role check
      if (user.role !== 'ADMIN') {
         toast.error('Access Denied: You are not an administrator.');
         return;
      }
      toast.success("Admin access granted.");
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] text-white relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none"></div>

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
         className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
            <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 mb-6 shadow-2xl relative group"
            >
               <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <Server className="h-10 w-10 text-indigo-400 relative z-10" />
            </motion.div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h2>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Administrative Access
            </p>
        </div>
        
        <div className="bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             
             <form className="space-y-6" onSubmit={handleSubmit}>
                 <div className="space-y-4">
                     <div className="group space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admin Email</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                                 <Mail className="w-5 h-5" />
                             </div>
                             <input
                                 type="email"
                                 required
                                 className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                 placeholder="admin@system.com"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                             />
                         </div>
                     </div>

                     <div className="group space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Security Key</label>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
                                 <Lock className="w-5 h-5" />
                             </div>
                             <input
                                 type="password"
                                 required
                                 className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                 placeholder="••••••••••••"
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                             />
                         </div>
                     </div>
                 </div>

                 <Button 
                    type="submit" 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20" 
                    isLoading={loading}
                 >
                     Authenticate <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
             </form>
        </div>

        <div className="text-center mt-8 text-sm">
           <Link to="/auth/login" className="text-gray-600 hover:text-white transition-colors">
              ← Return to User Portal
           </Link>
        </div>
      </motion.div>
    </div>
  );
};
