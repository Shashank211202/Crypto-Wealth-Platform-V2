import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div 
      className={twMerge('animate-pulse bg-zinc-800/50 rounded', className)}
      {...props}
    />
  );
};
