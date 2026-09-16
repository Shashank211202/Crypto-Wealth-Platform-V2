import { MessageSquare, Send, ExternalLink, Clock, CheckCircle, Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { dashboardService } from '../../services/dashboard.service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CryptoLoader } from '../../components/ui/CryptoLoader';

export const Support = () => {
    const { settings } = useSettings();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);

    useEffect(() => {
        loadUserTickets();
    }, []);

    const loadUserTickets = async () => {
        try {
            const data = await dashboardService.getUserTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your tickets.");
        } finally {
            setLoadingTickets(false);
        }
    };

    const [submittingReply, setSubmittingReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newTicket = await dashboardService.createTicket({ subject, message });
            setSubject('');
            setMessage('');
            setTickets([newTicket, ...tickets]);
            toast.success("Ticket created successfully!", {
                icon: '🎫',
                style: {
                    borderRadius: '10px',
                    background: '#1e2025',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (ticketId) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        try {
            await dashboardService.replyTicket(ticketId, replyText);
            
            // Optimistic Update
            const updatedTickets = tickets.map(t => {
                if (t.id === ticketId) {
                    return {
                        ...t,
                        messages: [...(t.messages || []), {
                            senderRole: 'USER',
                            message: replyText,
                            sentAt: new Date()
                        }]
                    };
                }
                return t;
            });
            
            setTickets(updatedTickets);
            setReplyText('');
            setReplyingTo(null);
            toast.success("Reply sent!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send reply");
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Support Center</h2>
                <p className="text-gray-500 text-sm mt-1">Get help with your account, transactions, or technical issues.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side - Tools (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Telegram Card */}
                    <Card className="p-0 overflow-hidden border-blue-500/20 bg-blue-500/5 group relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Send className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="p-6 relative z-10">
                            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                                <Send className="w-6 h-6 text-white ml-1" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Live Support</h3>
                            <p className="text-blue-200/70 text-sm mb-6 leading-relaxed">
                                Avoid wait times! Join our official Telegram channel for instant updates or chat directly with an admin for urgent matters.
                            </p>
                            <div className="space-y-3">
                                <a 
                                    href={settings.supportLinkChannel || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 h-12">
                                        <Send className="w-4 h-4 mr-2" /> Join Official Channel
                                    </Button>
                                </a>
                                <a 
                                    href={settings.supportLinkPersonal || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block transition-transform hover:translate-x-1"
                                >
                                    <span className="flex items-center justify-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 py-2">
                                        Contact Admin Directly <ExternalLink className="w-3 h-3" />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </Card>

                    {/* New Ticket Form */}
                    {settings.enableTicketSystem ? (
                        <Card className="p-6 bg-[#121419] border-white/5 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Plus className="w-5 h-5 text-crypto-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Open New Ticket</h3>
                                    <p className="text-xs text-gray-500">Typical response time: &lt; 24h</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmitTicket} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Topic / Subject</label>
                                    <input 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-crypto-accent transition-all placeholder:text-gray-700" 
                                        placeholder="e.g. Deposit not showing up..."
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Problem Description</label>
                                    <textarea 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-crypto-accent h-40 resize-none transition-all placeholder:text-gray-700 leading-relaxed" 
                                        placeholder="Please provide as much detail as possible so we can help you faster..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <Button type="submit" disabled={submitting} className="w-full h-12 shadow-xl shadow-crypto-accent/10">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                                    {submitting ? 'Submitting Request...' : 'Submit Support Request'}
                                </Button>
                            </form>
                        </Card>
                    ) : (
                        <div className="p-8 rounded-2xl bg-[#121419] border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-3">
                            <AlertCircle className="w-10 h-10 text-gray-600" />
                            <h3 className="text-base font-bold text-gray-400">Ticket System Paused</h3>
                            <p className="text-xs text-gray-600 max-w-[200px]">We are currently conducting maintenance. Please use Telegram for urgent inquiries.</p>
                        </div>
                    )}
                </div>

                {/* Right Side - Ticket List (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between pl-1">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-5 h-5 text-crypto-accent" />
                            Ticket History
                            <span className="text-xs font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">{tickets.length}</span>
                        </h3>
                    </div>
                    
                    {loadingTickets ? (
                        <CryptoLoader />
                    ) : tickets.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {tickets.map((ticket, index) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="p-0 border-white/5 overflow-hidden hover:border-white/10 transition-colors group">
                                            <div className="p-6 space-y-4 relative">
                                                {/* Status Stripe */}
                                                <div className={clsx(
                                                    "absolute left-0 top-0 bottom-0 w-1",
                                                    ticket.status === 'Open' ? "bg-emerald-500" : "bg-gray-700"
                                                )} />

                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-4">
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg flex items-center gap-3">
                                                            {ticket.subject}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                                            <span className="font-mono text-gray-600">#{ticket.id.slice(-6).toUpperCase()}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(ticket.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={clsx(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                        ticket.status === 'Open' 
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                                                            : 'bg-zinc-800 text-gray-500 border-white/5'
                                                    )}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                
                                            <div className="p-4 space-y-4">
                                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                    {(ticket.messages || []).map((msg, mIdx) => (
                                                        <div key={mIdx} className={clsx(
                                                            "flex", 
                                                            msg.senderRole === 'ADMIN' ? "justify-start" : "justify-end"
                                                        )}>
                                                            <div className={clsx(
                                                                "max-w-[85%] rounded-xl p-3 text-sm leading-relaxed",
                                                                msg.senderRole === 'ADMIN' 
                                                                    ? "bg-crypto-accent/10 border border-crypto-accent/10 text-white rounded-tl-none" 
                                                                    : "bg-white/5 border border-white/5 text-gray-300 rounded-tr-none"
                                                            )}>
                                                                <div className="text-[10px] font-bold mb-1 opacity-50 uppercase tracking-wider">
                                                                    {msg.senderRole === 'ADMIN' ? 'Support Team' : 'You'}
                                                                </div>
                                                                {msg.message}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                                                    <div className="pt-3 border-t border-white/5 flex gap-2">
                                                        <input 
                                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-crypto-accent transition-all placeholder:text-gray-600"
                                                            placeholder="Type a reply..."
                                                            value={replyingTo === ticket.id ? replyText : ''}
                                                            onChange={(e) => {
                                                                setReplyingTo(ticket.id);
                                                                setReplyText(e.target.value);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleReply(ticket.id);
                                                                }
                                                            }}
                                                        />
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleReply(ticket.id)}
                                                            disabled={replyingTo === ticket.id && submittingReply}
                                                            className={clsx("h-auto", replyingTo === ticket.id && replyText ? "opacity-100" : "opacity-50")}
                                                        >
                                                            {replyingTo === ticket.id && submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                {(ticket.status === 'Closed' || ticket.status === 'Resolved') && (
                                                     <div className="pt-2 text-center">
                                                         <span className="text-[10px] uppercase font-bold text-gray-600 flex items-center justify-center gap-1">
                                                             <CheckCircle className="w-3 h-3" /> Ticket {ticket.status}
                                                         </span>
                                                     </div>
                                                )}
                                            </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No Tickets Yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm mt-2">
                                You haven't started any support conversations. If you need help, use the form on the left to reach out.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
