import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  User,
  Shield,
  Bell,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  Mail,
  UserCircle,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import { CryptoLoader } from "../../components/ui/CryptoLoader";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { authService } from "../../services/auth.service";
import { platformSettingsService } from "../../services/platformSettings.service";

export const Settings = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [userPersonal2FA, setUserPersonal2FA] = useState(false);
  const [userWithdrawVerification, setUserWithdrawVerification] =
    useState(false);

  // Form states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [wallet, setWallet] = useState(
    user?.payoutWallet || { address: "", network: "ERC20" },
  );

  // Initialize notification state if needed, or derived from user
  // The current UI hardcodes notification switch states in the render loop.
  // We need state for them if we want to toggle them.
  // For now, let's just make the "Update Push Preferences" button work for a dummy object or better, properly implement state.
  // Given time constraints, I'll implement proper state for notifications.

  const [notifPrefs, setNotifPrefs] = useState(
    user?.notificationPreferences || {
      platform: true,
      deposit: true,
      price: false,
      security: true,
    },
  );

  const sections = [
    { id: "profile", label: "Profile Settings", icon: UserCircle },
    { id: "security", label: "Security Policy", icon: Shield },
    // { id: 'notifications', label: 'Push Alerts', icon: Bell },
    // { id: 'wallet', label: 'Payout Wallet', icon: Wallet },
  ];

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: profileName,
      });
      // Update local user context if needed, authService usually updates localStorage/event
      // We might need to manually trigger a refresh or just rely on the returned user
      await authService.checkAuth();
      toast.success("Profile information updated!");
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match!");
      return;
    }
    setIsSaving(true);
    try {
      await authService.changePassword(passwords.current, passwords.new);
      toast.success("Security settings updated!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifUpdate = async () => {
    setIsSaving(true);
    try {
      const { telegramChatId, ...prefs } = notifPrefs;
      await authService.updateProfile({
        notificationPreferences: prefs,
        telegramChatId,
      });
      await authService.checkAuth();
      toast.success("Notification preferences updated!");
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleWalletSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile({ payoutWallet: wallet });
      await authService.checkAuth();
      toast.success("Withdrawal address updated!");
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setUserPersonal2FA(!!user.is2faEnabled);
      setUserWithdrawVerification(!!user.requireWithdrawVerification);
      setNotifPrefs(
        user.notificationPreferences || {
          platform: true,
          deposit: true,
          price: false,
          security: true,
        },
      );
      if (user.payoutWallet) setWallet(user.payoutWallet);
    }
  }, [user]);

  useEffect(() => {
    const fetchPlatformSettings = async () => {
      try {
        const res = await platformSettingsService.getSettings();
        if (res.success) {
          setPlatformSettings(res.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchPlatformSettings();
  }, []);

  const handle2FAToggle = async (e) => {
    const newVal = e.target.checked;
    setUserPersonal2FA(newVal);
    setIsSaving(true);
    try {
      await authService.updateProfile({ is2faEnabled: newVal });
      await authService.checkAuth();
      toast.success(`2-Step Verification ${newVal ? "Enabled" : "Disabled"}`);
    } catch (error) {
      setUserPersonal2FA(!newVal);
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdrawVerificationToggle = async (e) => {
    const newVal = e.target.checked;
    setUserWithdrawVerification(newVal);
    setIsSaving(true);
    try {
      await authService.updateProfile({ requireWithdrawVerification: newVal });
      await authService.checkAuth();
      toast.success(
        `Withdrawal Verification ${newVal ? "Enabled" : "Disabled"}`,
      );
    } catch (error) {
      setUserWithdrawVerification(!newVal);
      toast.error(error.toString());
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !platformSettings) return <CryptoLoader />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 text-crypto-accent" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Institutional Security Portal
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Control Center
          </h1>
          <p className="text-gray-500 font-medium max-w-md">
            Manage your digital identity, security protocols, and platform
            preferences.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-2xl bg-[#121419] border border-white/5 flex items-center gap-4 shadow-xl">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
                Protocol Status
              </p>
              <p className="text-sm font-black text-emerald-500 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </p>
            </div>
            {/* <div className="w-px h-8 bg-white/5" />
                 <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Security Tier</p>
                    <p className="text-sm font-black text-white uppercase">{user.level || 'Standard'}</p>
                 </div> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="p-4 bg-[#121419]/50 backdrop-blur-xl border-white/5 rounded-[32px] shadow-2xl">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={clsx(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative group overflow-hidden",
                    activeSection === section.id
                      ? "bg-crypto-accent text-white shadow-lg shadow-crypto-accent/20"
                      : "text-gray-500 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <section.icon
                    className={clsx(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      activeSection === section.id
                        ? "text-white"
                        : "text-gray-600",
                    )}
                  />
                  {section.label}
                  {activeSection === section.id && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === "profile" && (
              <Card className="p-10 space-y-10 bg-[#121419] border-white/5 relative overflow-hidden rounded-[40px] shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <UserCircle className="w-80 h-80 text-crypto-accent transform rotate-12 transition-transform duration-1000" />
                </div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-crypto-accent/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-8 relative z-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[40px] bg-crypto-accent/20 flex items-center justify-center text-crypto-accent border border-crypto-accent/20 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <UserCircle className="w-16 h-16" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">
                          Modify
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-[#121419] shadow-xl">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black text-white">
                        {profileName}
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/10">
                        Verified Identity
                      </span>
                    </div>
                    <p className="text-gray-500 font-mono text-sm tracking-tight">
                      {user.email}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        ID: {user.customerId?.split("-")[0]}...
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Role: {user.role}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                      Legal Designation
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 transition-colors group-focus-within/input:text-crypto-accent" />
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-14 py-5 text-sm text-white font-bold focus:border-crypto-accent/50 focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                      Primary Endpoint
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                      <input
                        type="text"
                        readOnly
                        value={user.email}
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-14 py-5 text-sm text-gray-600 cursor-not-allowed font-mono shadow-inner"
                      />
                    </div>
                  </div>
                </div>
                {/* 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-center gap-6 group hover:border-blue-500/30 transition-all cursor-default">
                            <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 shadow-lg shadow-blue-500/5">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-2">Institutional Tier</p>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{user.level || 'Standard'} Protocol</h4>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Full Operational Access</p>
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center gap-6 group hover:border-emerald-500/30 transition-all cursor-default">
                            <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/5">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2">KYC Verification</p>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">Status: Level 3</h4>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Identity Confirmed</p>
                            </div>
                        </div>
                    </div> */}

                {/*  <div className="p-8 bg-crypto-accent/5 border border-crypto-accent/10 rounded-[32px] relative z-10 space-y-6 group/ref">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-crypto-accent/20 text-crypto-accent shadow-lg shadow-crypto-accent/10">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Affiliate Revenue Stream</h4>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Global Referral Program</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-crypto-accent font-black bg-crypto-accent/10 px-4 py-2 rounded-full border border-crypto-accent/20 shadow-xl">10% COMMISSION ACTIVE</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">Expand the Project Crypto network. Invite institutional partners and receive <span className="text-white font-bold">10% of their initial capital injection</span> instantaneously into your liquid reserves.</p>
                        <div className="flex gap-4">
                            <div className="relative flex-1 group">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={`${window.location.origin}/auth/register?ref=${user.referralCode}`} 
                                    className="w-full bg-black/60 border border-white/10 rounded-[20px] px-6 py-5 text-[11px] text-crypto-accent font-mono focus:outline-none shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 py-1 px-3 bg-crypto-accent/10 rounded-lg text-[8px] font-black text-crypto-accent uppercase tracking-widest border border-crypto-accent/20 opacity-0 group-hover:opacity-100 transition-opacity">Copying Enabled</div>
                            </div>
                            <Button 
                                className="h-full px-8 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl shadow-crypto-accent/20" 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/auth/register?ref=${user.referralCode}`);
                                    toast.success("Affiliate link secured to clipboard!");
                                }}
                            >
                               Secure Link
                            </Button>
                        </div>
                    </div>*/}

                <div className="flex flex-col md:flex-row gap-6 pt-6 relative z-10">
                  <div className="flex-1 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[28px] flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-widest leading-none mb-1.5">
                        Compliance Active
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Your profile is synchronized with global compliance
                        standards. All withdrawal channels remain open and
                        secure.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    isLoading={isSaving}
                    className="px-12 h-[72px] shadow-2xl shadow-crypto-accent/30 font-black uppercase tracking-widest text-xs min-w-[220px] rounded-[28px]"
                  >
                    <Save className="w-4 h-4 mr-3" />
                    Sync Profile
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="p-10 space-y-12 bg-[#121419] border-white/5 relative overflow-hidden rounded-[40px] shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Shield className="w-96 h-96 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                      Access Control
                    </h3>
                    <p className="text-gray-500 font-medium max-w-md">
                      Rotate cryptographic keys and manage multi-factor
                      authentication protocols.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-crypto-accent" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      End-to-End Encrypted
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handlePasswordUpdate}
                  className="space-y-8 relative z-10"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                      Current Password{" "}
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 transition-colors group-focus-within/input:text-crypto-accent" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            current: e.target.value,
                          })
                        }
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-14 py-5 text-sm text-white font-bold focus:outline-none focus:border-crypto-accent/50 transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                        New Password
                      </label>
                      <input
                        required
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-5 text-sm text-white font-bold focus:outline-none focus:border-crypto-accent/50 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                        Confirm New Password
                      </label>
                      <input
                        required
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirm: e.target.value,
                          })
                        }
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-5 text-sm text-white font-bold focus:outline-none focus:border-crypto-accent/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSaving}
                    className="w-full md:w-auto px-12 h-[72px] shadow-2xl shadow-crypto-accent/30 font-black uppercase tracking-widest text-xs rounded-[28px]"
                  >
                    <Lock className="w-4 h-4 mr-3" />
                    Update Password
                  </Button>
                </form>

                <div className="pt-12 border-t border-white/5 space-y-10 relative z-10">
                  <div className="flex items-center justify-between p-8 rounded-[32px] bg-black/20 border border-white/5 relative group hover:border-crypto-accent/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-crypto-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none" />
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        Multi-Factor Integration (OTP)
                        {userPersonal2FA && (
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                            Active Protection
                          </span>
                        )}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-medium max-w-xl leading-relaxed">
                        Establish a dual-layer authentication barrier. Every
                        access attempt will trigger a 6-digit cryptographic
                        token delivered via verified email endpoint.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group z-10">
                      <input
                        type="checkbox"
                        disabled={
                          isSaving || platformSettings?.enable2FA === false
                        }
                        checked={userPersonal2FA}
                        onChange={handle2FAToggle}
                        className="sr-only peer"
                      />
                      <div
                        className={clsx(
                          "w-16 h-8 bg-zinc-800 rounded-full peer transition-all duration-500",
                          "after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-500 after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-500 after:shadow-lg",
                          "peer-checked:after:translate-x-8 peer-checked:after:bg-crypto-accent peer-checked:bg-crypto-accent/10 border border-white/5",
                          (platformSettings.enable2FA === false ||
                            platformSettings.emailVerificationRequired ===
                              true) &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      ></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-8 rounded-[32px] bg-black/20 border border-white/5 relative group hover:border-crypto-accent/20 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-crypto-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none" />
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        Extra Security (Withdrawal OTP)
                        {userWithdrawVerification && (
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                            Vault Protocol Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-medium max-w-xl leading-relaxed">
                        Reinforce your fund out-flow security. Enabling this
                        mandates a 6-digit confirmation code for every bridge
                        attempt, safeguarding your assets even if your keys are
                        compromised.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group z-10">
                      <input
                        type="checkbox"
                        disabled={
                          isSaving ||
                          platformSettings?.requireWithdrawVerification === true
                        }
                        checked={
                          userWithdrawVerification ||
                          platformSettings?.requireWithdrawVerification
                        }
                        onChange={handleWithdrawVerificationToggle}
                        className="sr-only peer"
                      />
                      <div
                        className={clsx(
                          "w-16 h-8 bg-zinc-800 rounded-full peer transition-all duration-500",
                          "after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-500 after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-500 after:shadow-lg",
                          "peer-checked:after:translate-x-8 peer-checked:after:bg-crypto-accent peer-checked:bg-crypto-accent/10 border border-white/5",
                          platformSettings?.requireWithdrawVerification ===
                            true && "opacity-50 cursor-not-allowed",
                        )}
                      ></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platformSettings?.requireWithdrawVerification && (
                      <div className="p-6 rounded-[28px] bg-crypto-accent/5 border border-crypto-accent/20 flex items-center gap-6 shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-crypto-accent/10 flex items-center justify-center text-crypto-accent shrink-0">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-crypto-accent uppercase tracking-widest leading-none mb-1.5">
                            Mandatory Protocol
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            Withdrawal Verification is globally mandated by
                            administrator for all platform users.
                          </p>
                        </div>
                      </div>
                    )}

                    {platformSettings &&
                      platformSettings.enable2FA === false &&
                      !platformSettings.emailVerificationRequired && (
                        <div className="p-6 rounded-[28px] bg-amber-500/5 border border-amber-500/20 flex items-center gap-6 shadow-xl">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                            <AlertCircle className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1.5">
                              System Constraint
                            </p>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                              Personal 2FA control has been restricted by the
                              global administrator for maintenance.
                            </p>
                          </div>
                        </div>
                      )}

                    {platformSettings?.emailVerificationRequired && (
                      <div className="p-6 rounded-[28px] bg-crypto-accent/5 border border-crypto-accent/20 flex items-center gap-6 shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-crypto-accent/10 flex items-center justify-center text-crypto-accent shrink-0">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-crypto-accent uppercase tracking-widest leading-none mb-1.5">
                            Mandatory Protocol
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            2-Step Verification is globally enforced across the
                            entire platform ecosystem.
                          </p>
                        </div>
                      </div>
                    )}

                    {userPersonal2FA && (
                      <div className="p-6 rounded-[28px] bg-crypto-accent/5 border border-crypto-accent/20 flex items-center gap-6 shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-crypto-accent/10 flex items-center justify-center text-crypto-accent shrink-0">
                          <Lock className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-crypto-accent uppercase tracking-widest leading-none mb-1.5">
                            Guarded Session
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            Your account is fortified. All attempts to bridge
                            into your dashboard require multi-factor proof.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Withdrawal Verification Card */}
                    {platformSettings?.requireWithdrawVerification && (
                      <div className="p-6 rounded-[28px] bg-blue-500/5 border border-blue-500/20 flex items-center gap-6 shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <Shield className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1.5">
                            Vault Protection
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            Email Verification is mandatory for all withdrawal
                            operations to ensure fund integrity.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* <div className="p-10 rounded-[32px] bg-black/40 border border-white/5 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-crypto-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-crypto-accent/10 border border-crypto-accent/20">
                                            <Shield className="w-5 h-5 text-crypto-accent" />
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">System Forensics</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
                                        Monitor institutional access points and session integrity. All logins are cryptographically logged for your protection.
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex-1 md:w-48">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Last Observed Exposure</p>
                                        <p className="text-xs font-black text-white uppercase tracking-tighter">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-US', { 
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
                                            }) : 'Initial Protocol'}
                                        </p>
                                    </div>
                                    <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex-1 md:w-48">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5">Active Session Crypt</p>
                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            AES-256 Verified
                                        </p>
                                    </div>
                                </div>
                           </div>
                        </div> */}
                </div>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card className="bg-[#121419] border-white/5 overflow-hidden flex flex-col rounded-[40px] shadow-2xl animate-in slide-in-from-right duration-500">
                <div className="p-8 border-b border-white/5 bg-black/20">
                  <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">
                    System Notifications
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    Fine-tune how you receive platform updates and security
                    alerts.
                  </p>
                </div>

                <div className="p-10 border-b border-white/5 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#24A1DE]/10 flex items-center justify-center text-[#24A1DE] border border-[#24A1DE]/20 shadow-lg shadow-[#24A1DE]/5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-7 h-7"
                      >
                        <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.509 1.793.997 3.592 1.48 5.388.16.36.506.494.864.498l-.002.018s.281.028.555-.038a2.1 2.1 0 0 0 .933-.517c.345-.324 1.28-1.244 1.811-1.764l3.999 2.952.032.018s.442.311 1.09.355c.324.022.75-.04 1.116-.308.37-.27.613-.702.728-1.196.349-1.492 2.618-12.238 2.987-13.93.04-.179.045-.521-.144-.745a.934.934 0 0 0-.718-.266" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">
                        Telegram Infrastructure
                      </h4>
                      <p className="text-sm text-gray-500 font-medium">
                        Real-time cryptographic alerts via Telegram.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                        Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789"
                        value={
                          notifPrefs.telegramChatId || user.telegramChatId || ""
                        }
                        onChange={(e) =>
                          setNotifPrefs({
                            ...notifPrefs,
                            telegramChatId: e.target.value,
                          })
                        }
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-5 text-sm text-white font-mono focus:outline-none focus:border-crypto-accent/50 transition-all shadow-inner"
                      />
                      <p className="text-[10px] text-gray-500 font-medium px-1 uppercase tracking-wider leading-relaxed">
                        Secure your ID via{" "}
                        <a
                          href="https://t.me/userinfobot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-crypto-accent hover:underline"
                        >
                          @userinfobot
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {[
                    {
                      key: "platform",
                      label: "Platform Broadcasts",
                      desc: "Secure institutional announcements and system updates",
                    },
                    {
                      key: "deposit",
                      label: "Financial Confirmations",
                      desc: "Alerts for capital injections and fund bridges",
                    },
                    {
                      key: "price",
                      label: "Market Volatility Alerts",
                      desc: "High-precision notification for significant market shifts",
                    },
                    {
                      key: "security",
                      label: "Threat Intelligence",
                      desc: "Critical alerts regarding access attempts and sessions",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="space-y-1">
                        <h5 className="text-[13px] font-black text-white uppercase tracking-widest group-hover:text-crypto-accent transition-colors">
                          {item.label}
                        </h5>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                          {item.desc}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer group-hover:scale-105 transition-transform">
                        <input
                          type="checkbox"
                          checked={notifPrefs[item.key] || false}
                          onChange={(e) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-gray-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crypto-accent border border-white/5 shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/10 flex justify-end">
                  <Button
                    onClick={handleNotifUpdate}
                    isLoading={isSaving}
                    className="px-12 h-[60px] shadow-2xl shadow-crypto-accent/20 font-black uppercase tracking-widest text-xs rounded-2xl"
                  >
                    <Save className="w-4 h-4 mr-3" />
                    Sync Preferences
                  </Button>
                </div>
              </Card>
            )}

            {activeSection === "wallet" && (
              <Card className="p-10 space-y-10 bg-[#121419] border-white/5 relative overflow-hidden rounded-[40px] shadow-2xl animate-in slide-in-from-right duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Wallet className="w-96 h-96 text-white" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-5 bg-purple-500/10 rounded-3xl border border-purple-500/20 shadow-xl shadow-purple-500/5">
                    <Wallet className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                      Withdrawal Port
                    </h3>
                    <p className="text-gray-500 font-medium">
                      Designate your primary destination for automated fund
                      settlement.
                    </p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                        Wallet Address (Mainnet)
                      </label>
                      <input
                        type="text"
                        placeholder="0x... or T..."
                        value={wallet.address}
                        onChange={(e) =>
                          setWallet({ ...wallet, address: e.target.value })
                        }
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-5 text-sm text-crypto-accent font-mono focus:outline-none focus:border-crypto-accent/50 shadow-inner transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] pl-1">
                        Network Layer
                      </label>
                      <div className="relative group">
                        <select
                          value={wallet.network}
                          onChange={(e) =>
                            setWallet({ ...wallet, network: e.target.value })
                          }
                          className="w-full h-[62px] bg-black/40 border border-white/5 rounded-[20px] px-6 text-sm text-white font-black uppercase tracking-widest focus:outline-none focus:border-crypto-accent/50 appearance-none transition-all shadow-inner cursor-pointer"
                        >
                          <option value="ERC20">Ethereum (ERC20)</option>
                          <option value="TRC20">Tron (TRC20)</option>
                          <option value="BEP20">Binance (BEP20)</option>
                          <option value="POLYGON">Polygon (MATIC)</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-crypto-accent transition-colors">
                          <CheckCircle2 className="w-4 h-4 opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-[32px] flex gap-6 items-center">
                    <Shield className="w-8 h-8 text-purple-500 shrink-0 opacity-80" />
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-tighter">
                      <span className="text-purple-500 font-black">
                        Strict Enforcement Protocol:
                      </span>{" "}
                      Verification across decentralized layers is mandatory.
                      Ensure the destination network matches your address
                      precisely to prevent irreversible settlement loss.
                    </p>
                  </div>

                  <Button
                    onClick={handleWalletSave}
                    isLoading={isSaving}
                    className="px-12 h-[72px] shadow-2xl shadow-purple-500/20 font-black uppercase tracking-widest text-xs rounded-[28px]"
                  >
                    <Save className="w-4 h-4 mr-3" />
                    Finalize Settlement Policy
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
