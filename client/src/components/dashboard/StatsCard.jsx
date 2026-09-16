import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const StatsCard = ({ label, value, icon: Icon, trend, color = "blue", isPositive }) => {
    const colorClasses = {
        blue: "text-blue-500 bg-blue-500/10 shadow-blue-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 shadow-emerald-500/20",
        purple: "text-purple-500 bg-purple-500/10 shadow-purple-500/20",
        orange: "text-orange-500 bg-orange-500/10 shadow-orange-500/20"
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative"
        >
            <Card className="p-8 border-white/5 bg-[#121419]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden group rounded-[32px] border-l-4" style={{ borderColor: `var(--color-${color}-500)` }}>
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 bg-${color}-500`} />
                
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl ${colorClasses[color]} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        {trend && (
                            <div className={clsx(
                                "text-[10px] font-black px-3 py-1.5 rounded-2xl uppercase tracking-[0.1em] border backdrop-blur-md",
                                isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" : "bg-white/5 text-gray-500 border-white/10"
                            )}>
                                {trend}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{label}</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all duration-500">{value}</h3>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default StatsCard;
