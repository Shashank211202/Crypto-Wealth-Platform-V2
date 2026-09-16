import { Card } from '../ui/Card';
import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="bg-[#121419] border-white/5 p-6 space-y-3 relative overflow-hidden group">
        <div className={clsx("absolute top-0 right-0 p-4 transition-transform group-hover:scale-110", color)}>
            <Icon className="w-12 h-12 opacity-10" />
        </div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-mono font-bold text-white tracking-tight">{value}</p>
    </Card>
);

export default StatCard;
