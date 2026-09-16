import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, ArrowUpRight, ArrowDownLeft, AlertCircle, 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ExternalLink, ChevronRight, PieChart, Activity,
  X, Send, Megaphone, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { notificationService } from '../../services/notification.service';
import { adminService } from '../../services/admin.service';
import { withdrawalService } from '../../services/withdrawal.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { CryptoLoader } from '../../components/ui/CryptoLoader';

const BroadcastModal = ({ isOpen, onClose, onBroadcast }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onBroadcast(title, message);
        setLoading(false);
        setTitle('');
        setMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-lg p-0 border-white/5 bg-[#121419] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-crypto-accent/10 text-crypto-accent">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Create Broadcast</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Announcement Title</label>
                        <input 
                            required
                            placeholder="e.g., New Deposit Bonus Available!"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-crypto-accent outline-none transition-all font-medium"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Message Content</label>
                        <textarea 
                            required
                            rows="4"
                            placeholder="Type your global message here..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-crypto-accent outline-none transition-all font-medium resize-none"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                        <p className="text-[10px] text-gray-500 pl-1 italic">This will be visible to all users instantly.</p>
                    </div>

                    <Button type="submit" isLoading={loading} className="w-full py-6 font-black text-sm uppercase tracking-widest gap-2 shadow-lg shadow-crypto-accent/20">
                        <Send className="w-4 h-4 mr-2" /> Dispatch Announcement
                    </Button>
                </form>
            </Card>
        </div>
    );
};

const mockChartData = [
  { name: 'Mon', revenue: 4000, users: 240 },
  { name: 'Tue', revenue: 3000, users: 139 },
  { name: 'Wed', revenue: 2000, users: 980 },
  { name: 'Thu', revenue: 2780, users: 390 },
  { name: 'Fri', revenue: 1890, users: 480 },
  { name: 'Sat', revenue: 2390, users: 380 },
  { name: 'Sun', revenue: 3490, users: 430 },
];

const ActivityHistoryModal = ({ isOpen, onClose, activities }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl p-0 border-white/5 bg-[#121419] overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-crypto-accent/10 text-crypto-accent">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Global Activity History</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {activities.length > 0 ? activities.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-lg",
                                item.type === 'deposit' ? "bg-emerald-500/20 text-emerald-500" :
                                item.type === 'withdrawal' ? "bg-orange-500/20 text-orange-500" :
                                "bg-blue-500/20 text-blue-500"
                            )}>
                                {item.user[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-white font-medium">
                                        <span className="font-bold text-crypto-accent">{item.user}</span> {item.action}
                                    </p>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap ml-4">
                                        {item.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-600" />
                                    <p className="text-[10px] text-gray-500 font-bold">
                                        {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-bold tracking-tight">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Showing latest {activities.length} internal events</p>
                </div>
            </Card>
        </div>
    );
};

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [allActivity, setAllActivity] = useState([]);
    const [chartData, setChartData] = useState(mockChartData);
    const [loading, setLoading] = useState(true);
    
    // Initial stats (loading state)
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '...', change: '', icon: Users, color: 'blue', isPositive: true },
        { label: 'Total Revenue', value: '...', change: '', icon: DollarSign, color: 'emerald', isPositive: true },
        { label: 'Total Payouts', value: '...', change: '', icon: ArrowDownLeft, color: 'orange', isPositive: false },
        { label: 'Active Tickets', value: '...', change: '', icon: AlertCircle, color: 'red', isPositive: false },
    ]);

    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-500 bg-blue-500/30',
        emerald: 'bg-emerald-500/10 text-emerald-500 bg-emerald-500/30',
        orange: 'bg-orange-500/10 text-orange-500 bg-orange-500/30',
        red: 'bg-red-500/10 text-red-500 bg-red-500/30',
    };

    useEffect(() => {
        const loadDashboardData = async () => {
             try {
                 const [dashboardData, activity] = await Promise.all([
                     adminService.getDashboardStats(),
                     notificationService.getRecentActivity(8)
                 ]);
                 
                 const { stats: backendStats, chartData } = dashboardData;

                 setStats([
                    { label: 'TOTAL USERS', value: backendStats.totalUsers.toLocaleString(), change: 'Live', icon: Users, color: 'blue', isPositive: true },
                    { label: 'TOTAL INVESTMENTS', value: `$${backendStats.totalRevenue.toLocaleString()}`, change: 'Live', icon: DollarSign, color: 'emerald', isPositive: true },
                    { label: 'TOTAL PROFIT', value: `$${backendStats.totalProfit?.toLocaleString() || '0'}`, change: 'Distributed', icon: TrendingUp, color: 'emerald', isPositive: true },
                    { label: 'TOTAL PAYOUTS', value: `$${backendStats.totalPayouts.toLocaleString()}`, change: 'Withdrawals', icon: ArrowDownLeft, color: 'orange', isPositive: false },
                 ]);

                 // Use real chart data if available
                 if (chartData && chartData.length > 0) {
                     setChartData(chartData);
                 }

                 setRecentActivity(activity);

             } catch (error) {
                 console.error("Failed to load dashboard stats", error);
                 toast.error("Failed to load real-time stats");
             } finally {
                 setLoading(false);
             }
        };
        loadDashboardData();
    }, []);

    const handleOpenHistory = async () => {
        const fullHistory = await notificationService.getRecentActivity(50);
        setAllActivity(fullHistory);
        setIsHistoryModalOpen(true);
    };

    const handleBroadcast = async (title, message) => {
        try {
            await notificationService.createBroadcast(title, message);
            toast.success('Broadcast sent successfully!');
            // Refresh activity too since broadcast might show up
            const activity = await notificationService.getRecentActivity(8);
            setRecentActivity(activity);
        } catch (error) {
            toast.error('Failed to send broadcast.');
        }
    };

    const handleActivityClick = (type) => {
        if (type === 'deposit') navigate('/admin/deposits');
        else if (type === 'withdrawal') navigate('/admin/withdrawals');
        else if (type === 'ticket') navigate('/admin/tickets');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Platform Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor your platform's health and performance in real-time.</p>
                </div>
                {/* <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => toast.success('Report generation started...')}
                        className="text-xs bg-zinc-900/50 border-white/5"
                    >
                        Download Report
                    </Button>
                    <Button 
                        onClick={() => toast.loading('Calculating target segments...', { duration: 2000 })}
                        className="text-xs shadow-lg shadow-crypto-accent/20"
                    >
                        Launch Campaign
                    </Button>
                </div> */}
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-0 border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${colorMap[stat.color].split(' ')[0]} ${colorMap[stat.color].split(' ')[1]}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-orange-500'}`}>
                                    {stat.isPositive ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                                    {stat.change}
                                </div>
                            </div>
                            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h4>
                            <p className="text-3xl font-black text-white mt-1 group-hover:text-crypto-accent transition-colors">
                                {stat.value}
                            </p>
                        </div>
                        <div className="h-1 w-full bg-black/20">
                            <div className={`h-full ${colorMap[stat.color].split(' ')[2]} w-1/2 group-hover:w-full transition-all duration-1000`} />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="xl:col-span-2 p-6 border-white/5 bg-[#121419]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Revenue Performance</h3>
                            <p className="text-gray-500 text-xs mt-1">Weekly deposit and profit trends</p>
                        </div>
                        <div className="flex bg-black/40 p-1 rounded-lg">
                            {['1W', '1M', '1Y'].map(t => (
                                <button key={t} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${t === '1W' ? 'bg-crypto-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full min-h-[300px] relative">
                        <ResponsiveContainer width="99%" height={290} minWidth={100} minHeight={100}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Right: Quick Actions & Recent */}
                <div className="space-y-6">
                    {/* <Card className="bg-crypto-accent border-none text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Activity className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 p-6">
                            <h3 className="text-lg font-bold mb-2">Need to announce?</h3>
                            <p className="text-white/80 text-xs mb-6">Send global notifications to all users instantly via Telegram and Push.</p>
                            <Button 
                                onClick={() => setIsBroadcastModalOpen(true)}
                                className="w-full bg-white text-crypto-accent hover:bg-white/90 font-bold border-none"
                            >
                                Create Broadcast
                            </Button>
                        </div>
                    </Card> */}

                    <Card className="bg-[#121419] border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 flex items-center gap-2">
                             <Activity className="w-4 h-4 text-crypto-accent" /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleActivityClick(item.type)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
                                >                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                        item.type === 'deposit' ? "bg-emerald-500/20 text-emerald-500" :
                                        item.type === 'withdrawal' ? "bg-orange-500/20 text-orange-500" :
                                        "bg-blue-500/20 text-blue-500"
                                    )}>
                                        {item.user[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white truncate font-medium"><span className="font-bold">{item.user}</span> {item.action}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-tight">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        <ChevronRight className="w-4 h-4 text-gray-700" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500 text-xs">No recent activity detected.</div>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            onClick={handleOpenHistory}
                            className="w-full text-xs text-crypto-accent hover:bg-crypto-accent/10 border border-crypto-accent/10 font-bold"
                        >
                            View Global History
                        </Button>
                    </Card>
                </div>
            </div>

            <BroadcastModal 
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                onBroadcast={handleBroadcast}
            />

            <ActivityHistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                activities={allActivity}
            />
        </div>
    );
};
