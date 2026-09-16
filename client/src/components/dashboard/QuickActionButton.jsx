import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickActionButton = ({ to, icon: Icon, label, color, bg, desc }) => (
    <Link to={to} className="group relative block h-full">
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-center p-8 rounded-[32px] bg-[#121419]/95 border border-white/5 hover:border-white/20 transition-all shadow-2xl h-full relative overflow-hidden"
        >
            <div className={`absolute inset-0 ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10`} />
            <div className={`p-5 rounded-3xl mb-5 ${bg} ${color} shadow-2xl group-hover:scale-110 transition-all duration500 ring-4 ring-white/5 group-hover:ring-white/10`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
                <span className="text-xs font-black text-white uppercase tracking-[0.2em] block">{label}</span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0">{desc}</span>
            </div>
        </motion.div>
    </Link>
);

export default QuickActionButton;
