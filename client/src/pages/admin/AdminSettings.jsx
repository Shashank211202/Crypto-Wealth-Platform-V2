import { useState, useEffect } from 'react';
import { 
  Save, Bell, Shield, Wallet, 
  ExternalLink, MessageSquare, 
  Settings as SettingsIcon, ShieldCheck, 
  DollarSign, Activity, Globe,
  Layout, Headphones, Lock, Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { CryptoLoader } from '../../components/ui/CryptoLoader';

const SettingsSection = ({ icon: Icon, title, description, children, onSave, isLoading, color = "bg-crypto-accent" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#121419] border border-white/5 rounded-2xl flex flex-col overflow-hidden transition-all hover:border-white/10 group"
  >
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={clsx("p-2 rounded-lg", color.replace('bg-', 'bg-').replace('text-', '').concat('/10'))}>
              <Icon className={clsx("w-5 h-5", color.replace('bg-', 'text-'))} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white mb-0.5">{title}</h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-5">
        {children}
      </div>
    </div>
    
    <div className="mt-auto p-4 bg-white/5 border-t border-white/5 flex justify-end">
       <Button 
         size="sm" 
         onClick={onSave} 
         isLoading={isLoading}
         className="gap-2 min-w-[140px] shadow-lg shadow-black/20"
       >
         <Save className="w-3.5 h-3.5" />
         Save Changes
       </Button>
    </div>
  </motion.div>
);

const ToggleInput = ({ label, description, name, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-black/30 transition-colors">
    <div>
      <p className="font-semibold text-white text-sm">{label}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 font-medium">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer" 
      />
      <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crypto-accent after:shadow-sm"></div>
    </label>
  </div>
);

const TextInput = ({ label, name, value, onChange, placeholder, type = "text", icon: Icon, hint }) => (
  <div className="space-y-2">
      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative group/input">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-crypto-accent transition-colors">
               <Icon className="w-4 h-4" />
            </div>
          )}
          <input 
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={clsx(
                "w-full bg-black/40 border border-white/5 rounded-xl py-3 text-sm text-white focus:outline-none focus:border-crypto-accent transition-all font-medium",
                Icon ? "pl-11 pr-4" : "px-4"
              )}
          />
      </div>
      {hint && <p className="text-[10px] text-gray-600 mt-1 ml-1 tracking-wider uppercase font-medium">{hint}</p>}
  </div>
);

export const AdminSettings = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [loadingSection, setLoadingSection] = useState(null);
  
  const defaultSettings = {
    platformName: '',
    maintenanceMode: false,
    enable2FA: false,
    enableTicketSystem: true,
    showPaymentLink: false,
    minWithdrawal: 10,
    withdrawalFee: 0,
    supportLinkPersonal: '',
    supportLinkChannel: '',
    telegramBotToken: '',
    telegramChannelId: '',
    requireWithdrawVerification: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    kycRequired: false,
    autoDepositApproval: false,
    minDeposit: 10,
    enableTelegramNotifications: false,
    enableTelegramNotifications: false,
    telegramAdminIds: '',
    requireTxHash: true
  };

  const [localSettings, setLocalSettings] = useState({ ...defaultSettings, ...settings });

  useEffect(() => {
    setLocalSettings(prev => ({ ...defaultSettings, ...settings }));
  }, [settings]);

  if (loading) return <CryptoLoader />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (section) => {
    setLoadingSection(section);
    try {
        await updateSettings(localSettings);
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated!`);
    } catch (error) {
        toast.error('Failed to save settings');
    } finally {
        setLoadingSection(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Configuration</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global platform behaviors and integration keys.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Live System</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* General Platform */}
        <SettingsSection 
          icon={Globe} 
          title="General" 
          description="Platform Identity"
          color="bg-blue-500"
          onSave={() => handleSave('general')}
          isLoading={loadingSection === 'general'}
        >
          <TextInput 
            label="Platform Name" 
            name="platformName" 
            value={localSettings.platformName} 
            onChange={handleChange}
            placeholder="e.g. Project Crypto"
            icon={Layout}
          />
          <ToggleInput 
            label="Maintenance Mode" 
            description="Disable user access" 
            name="maintenanceMode" 
            checked={localSettings.maintenanceMode} 
            onChange={handleChange} 
          />
        </SettingsSection>

        {/* Security & Features */}
        <SettingsSection 
          icon={ShieldCheck} 
          title="Security" 
          description="Access Controls"
          color="bg-crypto-accent"
          onSave={() => handleSave('security')}
          isLoading={loadingSection === 'security'}
        >
          <ToggleInput 
            label="Mandatory 2FA (System-Wide)" 
            description="Force OTP for every login (excluding Admin)" 
            name="emailVerificationRequired" 
            checked={localSettings.emailVerificationRequired} 
            onChange={handleChange} 
          />
          <ToggleInput 
            label="Allow User-Controlled 2FA" 
            description="Let users enable/disable 2FA themselves" 
            name="enable2FA" 
            checked={localSettings.enable2FA} 
            onChange={handleChange} 
          />
          <ToggleInput 
            label="Ticket System" 
            description="Enable support tickets" 
            name="enableTicketSystem" 
            checked={localSettings.enableTicketSystem} 
            onChange={handleChange} 
          />
          <ToggleInput 
            label="Withdrawal Verification" 
            description="Require Email OTP for all withdrawals" 
            name="requireWithdrawVerification" 
            checked={localSettings.requireWithdrawVerification} 
            onChange={handleChange} 
          />
          <ToggleInput 
            label="Require Transaction Hash" 
            description="Must provide Tx Hash for deposits" 
            name="requireTxHash" 
            checked={localSettings.requireTxHash} 
            onChange={handleChange} 
          />
          {/* <ToggleInput 
            label="Deposit Privacy" 
            description="Show Link instead of Hash" 
            name="showPaymentLink" 
            checked={localSettings.showPaymentLink} 
            onChange={handleChange} 
          /> */}
        </SettingsSection>

        {/* Financial Policy */}
        <SettingsSection 
          icon={DollarSign} 
          title="Finance" 
          description="Limits & Fees"
          color="bg-emerald-500"
          onSave={() => handleSave('finance')}
          isLoading={loadingSection === 'finance'}
        >
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              label="Min Withdrawal" 
              name="minWithdrawal" 
              type="number"
              value={localSettings.minWithdrawal} 
              onChange={handleChange}
              placeholder="10"
              hint="USD Amount"
            />
            <TextInput 
              label="Service Fee" 
              name="withdrawalFee" 
              type="number"
              value={localSettings.withdrawalFee} 
              onChange={handleChange}
              placeholder="5"
              hint="Percentage"
            />
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
             <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-white uppercase">Profit Engine</span>
             </div>
             <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                Global profit distribution is managed via automated cron jobs based on selected plans.
             </p>
             <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-7 hover:bg-emerald-500/10 hover:text-emerald-400"
                    onClick={async () => {
                        try {
                            setLoadingSection('finance');
                            const res = await adminService.triggerProfitDistribution();
                            toast.success(res.message);
                        } catch (err) {
                            toast.error(err);
                        } finally {
                            setLoadingSection(null);
                        }
                    }}
                >
                    <Activity className="w-3 h-3 mr-1.5" />
                    Process Profits Now
                </Button>
             </div>
          </div>
        </SettingsSection>

        {/* Support & socials */}
        <SettingsSection 
          icon={Headphones} 
          title="Support" 
          description="Social Integration"
          color="bg-indigo-500"
          onSave={() => handleSave('support')}
          isLoading={loadingSection === 'support'}
        >
          <TextInput 
            label="Support (Telegram)" 
            name="supportLinkPersonal" 
            value={localSettings.supportLinkPersonal} 
            onChange={handleChange}
            placeholder="https://t.me/username"
            icon={MessageSquare}
          />
          <TextInput 
            label="Channel (Telegram)" 
            name="supportLinkChannel" 
            value={localSettings.supportLinkChannel} 
            onChange={handleChange}
            placeholder="https://t.me/channel"
            icon={Globe}
          />
        </SettingsSection>

        {/* Telegram Automation */}
        <SettingsSection 
          icon={Bell} 
          title="Automation" 
          description="Telegram Bot"
          color="bg-yellow-500"
          onSave={() => handleSave('telegram')}
          isLoading={loadingSection === 'telegram'}
        >
          <TextInput 
            label="Bot Token" 
            name="telegramBotToken" 
            type="password"
            value={localSettings.telegramBotToken} 
            onChange={handleChange}
            placeholder="BotFather Token"
            icon={Lock}
            hint="Provided by @BotFather"
          />
          <TextInput 
            label="Channel ID" 
            name="telegramChannelId" 
            value={localSettings.telegramChannelId} 
            onChange={handleChange}
            placeholder="-100..."
            icon={Layout}
            hint="Bot must be admin in channel"
          />
        </SettingsSection>
        
        {/* Danger Zone */}
        <SettingsSection 
          icon={Trash2} 
          title="Danger Zone" 
          description="Dangerous Actions"
          color="bg-red-500"
          onSave={() => toast.error("Action not implemented yet")}
        >
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-4">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Destroy Data</p>
            <Button 
                variant="outline" 
                className="w-full border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
                onClick={() => {
                   if(window.confirm("ARE YOU ABSOLUTELY SURE? This will delete the entire website data!")) {
                      toast.error("Permission Denied: System Core Locked");
                   }
                }}
            >
                Delete Website
            </Button>
          </div>
        </SettingsSection>

      </div>
    </div>
  );
};
