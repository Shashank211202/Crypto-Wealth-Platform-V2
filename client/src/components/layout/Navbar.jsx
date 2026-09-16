import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import {
  Menu,
  X,
  Wallet,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Bell,
  Megaphone,
  Check,
  Zap,
  Shield,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { NAV_ITEMS, ADMIN_ITEMS } from "../../constants/nav";
import { notificationService } from "../../services/notification.service";
import { useSettings } from "../../context/SettingsContext";
import { useSocket } from "../../context/SocketContext";

import { toast } from "react-hot-toast";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false); // desktop profile
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const navLinks = user?.role === 'ADMIN' ? ADMIN_ITEMS : NAV_ITEMS;

  const { socket } = useSocket();

  useEffect(() => {
    // Initial fetch
    const loadNotifs = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
      setIsFirstLoad(false);
    };
    loadNotifs();

    // Socket Event Listener
    if (socket) {
        socket.on('notification', (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast(newNotif.message, {
                icon: '🔔',
                style: { background: '#1F2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                duration: 5000
            });
        });
        return () => socket.off('notification');
    } else {
        // Fallback to polling if socket is disabled/not connected (e.g. Vercel)
        const interval = setInterval(loadNotifs, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }
  }, [socket]);

  const handleMarkRead = async (id) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
        await notificationService.markAsRead(id);
    } catch (err) {
        // Revert if failed (optional, but good practice)
        console.error("Failed to mark read", err);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate("/auth/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000]">
      <div className="backdrop-blur-md bg-crypto-dark/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-crypto-accent font-bold text-lg md:text-xl"
            >
              <Wallet className="w-8 h-8" />
              <span>{settings.platformName || 'CryptoInvest'}</span>
            </Link>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition relative group"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#121419] animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotifOpen && (
                          <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-[90vw] sm:w-80 rounded-2xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Notifications</h4>
                                {unreadCount > 0 && <span className="text-[10px] text-crypto-accent font-bold bg-crypto-accent/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await notificationService.markAllAsRead();
                                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                        setUnreadCount(0);
                                    }}
                                    className="text-[10px] text-crypto-accent font-bold hover:text-white transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                          </div>

                          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                              notifications.map((n) => (
                                <div 
                                  key={n._id} 
                                  onClick={() => {
                                      // 1. Open Modal
                                      setSelectedNotification(n);
                                      // 2. Mark read if not already
                                      if (!n.isRead) {
                                          handleMarkRead(n._id);
                                      }
                                  }}
                                  className={clsx(
                                    "p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group cursor-pointer",
                                    !n.isRead ? "bg-crypto-accent/5" : "opacity-70"
                                  )}
                                >
                                  <div className="flex gap-3">
                                    <div className={clsx(
                                      "p-2 rounded-xl shrink-0 h-fit",
                                      {
                                        'broad': "bg-purple-500/10 text-purple-500",
                                        'deposit': "bg-emerald-500/10 text-emerald-500",
                                        'withdrawal': "bg-orange-500/10 text-orange-500",
                                        'success': "bg-emerald-500/10 text-emerald-500",
                                        'error': "bg-red-500/10 text-red-500",
                                        'warning': "bg-yellow-500/10 text-yellow-500",
                                        'info': "bg-blue-500/10 text-blue-500",
                                        'security': "bg-red-500/10 text-red-500",
                                        'profit': "bg-emerald-500/10 text-emerald-500",
                                        'ticket': "bg-indigo-500/10 text-indigo-500",
                                        'system': "bg-gray-500/10 text-gray-500"
                                      }[n.type] || "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                      {(() => {
                                        switch (n.type) {
                                          case 'broad': return <Megaphone className="w-4 h-4" />;
                                          case 'deposit': return <Wallet className="w-4 h-4" />;
                                          case 'withdrawal': return <LogOut className="w-4 h-4" />;
                                          case 'profit': return <Zap className="w-4 h-4" />;
                                          case 'security': return <Shield className="w-4 h-4" />;
                                          case 'warning': return <AlertCircle className="w-4 h-4" />;
                                          case 'error': return <X className="w-4 h-4" />;
                                          case 'ticket': return <User className="w-4 h-4" />;
                                          default: return <Zap className="w-4 h-4" />;
                                        }
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                          <p className={clsx("text-xs font-bold mb-0.5", !n.isRead ? "text-white" : "text-gray-400")}>{n.title}</p>
                                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-crypto-accent animate-pulse"></div>}
                                      </div>
                                      <p className="text-[11px] text-gray-400 leading-relaxed mb-1 line-clamp-2">{n.message}</p>
                                      <span className="text-[10px] text-gray-600 block text-right">{new Date(n.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-10 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-gray-700 mx-auto">
                                  <Bell className="w-6 h-6" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">No notifications yet.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen((v) => !v)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-crypto-accent/20 flex items-center justify-center text-crypto-accent">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {user.name}
                      </span>
                      <ChevronDown
                        className={clsx(
                          "w-4 h-4 text-gray-400 transition-transform",
                          isProfileOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Desktop Profile Dropdown */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-white/5 bg-white/5">
                            <p className="text-sm font-medium text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-2 space-y-1">
                            <Link
                              to={user?.role === 'ADMIN' ? "/admin" : "/dashboard"}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg"
                            >
                              <Wallet className="w-4 h-4" />
                              {user?.role === 'ADMIN' ? "Admin Console" : "Dashboard"}
                            </Link>

                            <Link
                              to={user?.role === 'ADMIN' ? "/admin/settings" : "/dashboard/settings"}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-lg"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>

                            <div className="border-t border-white/5 my-1" />

                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen((v) => !v)}
                className="p-2 rounded-lg border border-white/10 bg-white/5 text-white"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-[#0B0E14] border-b border-white/10 shadow-xl z-40"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition",
                      active
                        ? "bg-crypto-accent/20 text-crypto-accent"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedNotification(null)}
          >
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0B0E14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
             >
                 {/* Header */}
                 <div className={`p-4 border-b border-white/5 flex items-center gap-3 ${
                    {
                        'broad': "bg-purple-500/10",
                        'deposit': "bg-emerald-500/10",
                        'withdrawal': "bg-orange-500/10"
                    }[selectedNotification.type] || "bg-white/5"
                 }`}>
                    <div className={clsx(
                        "p-2 rounded-lg",
                        {
                            'broad': "bg-purple-500/20 text-purple-400",
                            'deposit': "bg-emerald-500/20 text-emerald-400",
                            'withdrawal': "bg-orange-500/20 text-orange-400",
                            'success': "bg-emerald-500/20 text-emerald-400",
                            'error': "bg-red-500/20 text-red-400", 
                            'warning': "bg-yellow-500/20 text-yellow-400",
                            'info': "bg-blue-500/20 text-blue-400",
                            'security': "bg-red-500/20 text-red-500"
                        }[selectedNotification.type] || "bg-crypto-accent/20 text-crypto-accent"
                    )}>
                        {(() => {
                            switch (selectedNotification.type) {
                                case 'broad': return <Megaphone className="w-5 h-5" />;
                                case 'deposit': return <Wallet className="w-5 h-5" />;
                                case 'withdrawal': return <LogOut className="w-5 h-5" />;
                                case 'security': return <Shield className="w-5 h-5" />;
                                case 'warning': return <AlertCircle className="w-5 h-5" />;
                                case 'error': return <X className="w-5 h-5" />;
                                case 'ticket': return <User className="w-5 h-5" />;
                                default: return <Zap className="w-5 h-5" />;
                            }
                        })()}
                    </div>
                    <div className="flex-1">
                         <h3 className="text-lg font-bold text-white leading-tight">{selectedNotification.title}</h3>
                         <span className="text-xs text-gray-500">{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                    </div>
                    <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-white p-2">
                        <X className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Content */}
                 <div className="p-6 space-y-4">
                     <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedNotification.message}
                     </p>
                     
                     <div className="flex justify-end pt-4">
                        <Button onClick={() => setSelectedNotification(null)} variant="secondary" size="sm">
                            Close
                        </Button>
                     </div>
                 </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
