import { Hexagon } from 'lucide-react';

export const CryptoLoader = ({ fullScreen = true, className }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14] backdrop-blur-md"
    : "flex items-center justify-center py-10";

  return (
    <div className={containerClasses}>
      <div className={`relative flex flex-col items-center ${!fullScreen ? 'scale-75' : ''}`}>
        
        {/* Holographic Container */}
        <div className="relative w-40 h-40 flex items-center justify-center">
            
            {/* Outer Rotating Hexagon Ring */}
            <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                    <path 
                        d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 Z" 
                        fill="none" 
                        stroke="url(#grad1)" 
                        strokeWidth="1" 
                        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Middle Counter-Rotating Dashed Hexagon */}
            <div className="absolute inset-4 animate-[spin_6s_linear_infinite_reverse]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                     <path 
                        d="M50 10 L84.6 30 V70 L50 90 L15.4 70 V30 Z" 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        strokeDasharray="10 15"
                        strokeLinecap="round"
                        className="opacity-80"
                    />
                </svg>
            </div>

            {/* Inner Pulsing Core */}
            <div className="absolute w-16 h-16 bg-crypto-accent/10 rounded-full flex items-center justify-center animate-pulse border border-crypto-accent/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                 <div className="w-8 h-8 relative">
                     <div className="absolute inset-0 bg-crypto-accent rotate-45 animate-ping opacity-20 rounded-md"></div>
                     <Hexagon className="w-full h-full text-crypto-accent relative z-10 drop-shadow-[0_0_10px_rgba(16,185,129,1)]" strokeWidth={2.5} />
                 </div>
            </div>

            {/* Scanner Beam Effect */}
            <div className="absolute inset-0 w-full h-full animate-[pulse_2s_ease-in-out_infinite] opacity-30 pointer-events-none overflow-hidden rounded-full">
                 <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-crypto-accent/20 translate-y-[-100%] animate-[slideDown_2s_linear_infinite]"></div>
            </div>
        </div>

        {/* Text Glitch Effect */}
        <div className="mt-8 flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-crypto-accent via-white to-blue-500 animate-[pulse_3s_ease-in-out_infinite]">
                Loading
            </h2>
            <div className="flex gap-1.5 h-1">
                <div className="w-8 h-full bg-crypto-accent/50 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
            <p className="text-[10px] text-crypto-muted tracking-widest opacity-70 animate-pulse">
                INITIALIZING SECURE CONNECTION
            </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};
