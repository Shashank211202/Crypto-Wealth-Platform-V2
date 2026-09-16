import { Shield, AlertCircle, Headphones } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useSettings } from "../context/SettingsContext";

export const Maintenance = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-crypto-accent/20 blur-3xl rounded-full" />
          <div className="relative bg-[#121419] border border-white/5 p-8 rounded-3xl shadow-2xl">
            <Shield className="w-20 h-20 text-crypto-accent mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Systems Updating
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {settings.platformName || "Our platform"} is currently undergoing
              scheduled maintenance to improve your trading experience.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 text-left">
            <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Estimated Downtime</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Ongoing Performance Optimization
              </p>
            </div>
          </div>

          <a
            href={settings.supportLinkChannel || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="secondary"
              className="w-full gap-2 py-6 border-white/5 bg-white/5 hover:bg-white/10"
            >
              <Headphones className="w-5 h-5" />
              Check Telegram for Updates
            </Button>
          </a>
        </div>
        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()}{" "}
          {settings.platformName || "Project Crypto"} &bull; Core Infrastructure
        </p>
        ``
      </div>
    </div>
  );
};
