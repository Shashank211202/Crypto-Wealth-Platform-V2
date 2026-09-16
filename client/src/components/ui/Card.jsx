import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        'bg-crypto-card/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl shadow-black/20',
        'hover:bg-crypto-card/80 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
