import { motion } from 'framer-motion';

const RequirementItem = ({ met, text }) => (
    <motion.li 
      initial={false}
      animate={{ color: met ? '#34d399' : '#71717a' }}
      className="flex items-center gap-2 text-xs font-medium"
    >
      <div className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-300 ${met ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
        {met ? (
          <motion.svg 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-3 h-3 text-emerald-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        )}
      </div>
      {text}
    </motion.li>
);

export default RequirementItem;
