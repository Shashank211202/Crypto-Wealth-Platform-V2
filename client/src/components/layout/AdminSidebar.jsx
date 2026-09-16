import { NavLink, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { ADMIN_ITEMS } from '../../constants/nav';
import { X, LogOut, ShieldCheck, User, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/auth/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
       {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        "bg-[#0B0E14]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out z-50",
         // Mobile styles
         "fixed inset-y-0 left-0 w-72", 
         !isOpen && "-translate-x-full",
         // Desktop styles (stationary sidebar)
         "md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-64" 
      )}>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
             <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <span className="font-black text-lg text-white tracking-tight uppercase">Admin Console</span>
             </div>
             <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all">
                 <X className="w-5 h-5" />
             </button>
      </div>

      {/* Desktop Admin Tag */}
      <div className="hidden md:flex flex-col gap-1 p-6 pb-2">
          <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Management</span>
              <Settings className="w-3 h-3 text-gray-700" />
          </div>
      </div>

      <div className="px-4 py-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {ADMIN_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent',
              isActive 
                ? 'bg-gradient-to-r from-red-500/10 to-transparent text-red-500 border-l-2 border-l-red-500 border-r-transparent border-y-transparent' 
                : 'text-gray-500 hover:bg-white/5 hover:text-white hover:translate-x-1'
            )}
          >
            <item.icon className={clsx("w-5 h-5 transition-transform duration-300", "group-hover:scale-110")} />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className={clsx("w-3 h-3 opacity-0 -translate-x-2 transition-all", "group-hover:opacity-10 group-hover:translate-x-0")} />
          </NavLink>
        ))}
      </div>

      {/* Unified Admin Profile Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
          {user ? (
              <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                      <div className="relative group/avatar">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                              <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121419]" />
                      </div>
                      <div className="overflow-hidden">
                          <p className="text-sm font-black text-white truncate leading-tight">{user.name || 'Administrator'}</p>
                          <p className="text-[10px] text-gray-500 truncate font-bold uppercase tracking-tighter">Main Console Access</p>
                      </div>
                  </div>
                  <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all text-xs active:scale-95"
                  >
                      <LogOut className="w-4 h-4" />
                      Terminate Session
                  </button>
              </div>
          ) : (
              <Link to="/auth/admin/login" onClick={onClose} className="block">
                  <button className="w-full p-3 rounded-xl bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition-all">
                      Admin Portal
                  </button>
              </Link>
          )}
      </div>
    </aside>
    </>
  );
};
