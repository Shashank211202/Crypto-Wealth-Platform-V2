import { NavLink, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { NAV_ITEMS } from '../../constants/nav';
import { X, LogOut, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        "bg-[#0B0E14]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out z-50",
        // Mobile styles
        "fixed inset-y-0 left-0 w-72", 
        !isOpen && "-translate-x-full",
        // Desktop styles (fixed sidebar while content scrolls)
        "md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-64"
      )}>
        {/* Mobile Header with Close Button */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5">
             <span className="font-bold text-lg text-white tracking-wide">Menu</span>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                 <X className="w-5 h-5" />
             </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-gradient-to-r from-crypto-accent/10 to-transparent text-crypto-accent shadow-[inset_2px_0_0_0_rgba(var(--crypto-accent),1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx("w-5 h-5 transition-colors", ({isActive}) => isActive ? "text-crypto-accent" : "text-gray-500 group-hover:text-white")} />
                {item.label}
              </div>
              {/* Optional: Add chevron for active or hover state if desired, kept simple for now */}
            </NavLink>
          ))}
        </div>

        {/* User Footer - Visible on BOTH Mobile and Desktop now */}
        <div className="p-4 border-t border-white/5 bg-black/20 m-2 rounded-2xl">
            {user ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crypto-accent to-purple-600 flex items-center justify-center text-white shadow-lg shadow-crypto-accent/20">
                            <span className="font-bold text-lg">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                     <Link to="/auth/login" onClick={onClose}>
                        <Button variant="ghost" className="w-full justify-center">Login</Button>
                     </Link>
                     <Link to="/auth/register" onClick={onClose}>
                        <Button variant="primary" className="w-full justify-center shadow-lg shadow-crypto-accent/20">Get Started</Button>
                     </Link>
                </div>
            )}
        </div>
      </aside>
    </>
  );
};
