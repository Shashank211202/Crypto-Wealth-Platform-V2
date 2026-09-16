import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Hexagon } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-crypto-dark disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-crypto-accent text-white hover:bg-emerald-600 focus:ring-crypto-accent',
    secondary: 'bg-crypto-card text-crypto-text hover:bg-zinc-800 focus:ring-zinc-700 border border-crypto-border',
    danger: 'bg-crypto-danger text-white hover:bg-red-600 focus:ring-crypto-danger',
    ghost: 'text-crypto-muted hover:text-crypto-text hover:bg-zinc-800/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 animate-spin">
           <Hexagon className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}
      {children}
    </button>
  );
};
