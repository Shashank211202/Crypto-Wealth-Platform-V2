import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, MessageSquare, CheckCircle, XCircle, Clock, ChevronRight, Send, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { adminService } from '../../services/admin.service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoLoader } from '../../components/ui/CryptoLoader';
import ActionConfirmModal from '../../components/modals/ActionConfirmModal';

export const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filter, setFilter] = useState('All');
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    const filteredTickets = tickets.filter(t => {
        if (filter === 'All') return true;
        return t.status === filter;
    });

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseTicket = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Resolve Ticket',
            message: 'Are you sure you want to resolve and close this ticket? If the user replies later, it will reopen automatically.',
            confirmText: 'Resolve & Close',
            onConfirm: async () => {
                try {
                    await adminService.closeTicket(id);
                    const updatedTickets = tickets.map(t => t.id === id ? { ...t, status: 'Closed' } : t);
                    setTickets(updatedTickets);
                    
                    if (selectedTicket?.id === id) {
                        setSelectedTicket(prev => ({ ...prev, status: 'Closed' }));
                    }
                    toast.success("Ticket closed successfully");
                } catch (error) {
                    toast.error("Failed to close ticket");
                }
            }
        });
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        setReplying(true);
        try {
            await adminService.replyTicket(selectedTicket.id, replyText);
            
            const newMessage = {
                senderRole: "ADMIN",
                message: replyText,
                sentAt: new Date()
            };

            const updatedTickets = tickets.map(t => 
                t.id === selectedTicket.id 
                ? { 
                    ...t, 
                    messages: [...(t.messages || []), newMessage],
                    status: 'Open' // Ensure it stays open
                  } 
                : t
            );
            setTickets(updatedTickets);
            
            setSelectedTicket(prev => ({ 
                ...prev, 
                messages: [...(prev.messages || []), newMessage],
                status: 'Open'
            }));
            
            setReplyText('');
            toast.success("Reply sent!");
        } catch (error) {
            console.error(error);
            toast.error('Failed to send reply.');
        } finally {
            setReplying(false);
        }
    };

    if (loading) return <CryptoLoader />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Support Tickets</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage user inquiries and issues.</p>
                </div>
                <div className="bg-[#121419] p-1 rounded-xl border border-white/5 flex gap-1 shadow-lg shadow-black/20">
                    {['All', 'Open', 'Closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative",
                                filter === status 
                                    ? "text-white shadow-lg" 
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            )}
                        >
                            {filter === status && (
                                <motion.div 
                                    layoutId="activeFilter"
                                    className="absolute inset-0 bg-zinc-800 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{status === 'All' ? 'All Tickets' : status}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Ticket List */}
                <div className={clsx(
                    "lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar",
                    // Mobile: Hide list if a ticket is selected
                    selectedTicket ? "hidden lg:flex" : "flex"
                )}>
                    {filteredTickets.map((ticket, i) => (
                        <div 
                            key={ticket.id || i}
                            onClick={() => setSelectedTicket(ticket)}
                            className={clsx(
                                "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group",
                                selectedTicket?.id === ticket.id 
                                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-crypto-accent shadow-lg shadow-crypto-accent/10' 
                                : 'bg-[#121419] border-white/5 hover:border-white/10'
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={clsx(
                                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                    ticket.status === 'Open' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                        : 'bg-zinc-800 text-gray-500 border-white/5'
                                )}>
                                    {ticket.status}
                                </span>
                                <span className="text-[10px] font-mono text-gray-500">{new Date(ticket.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className={clsx(
                                "font-bold text-base mb-1 truncate transition-colors",
                                selectedTicket?.id === ticket.id ? "text-white" : "text-gray-200 group-hover:text-white"
                            )}>{ticket.subject}</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-crypto-accent/50"></div>
                                <p className="text-xs text-gray-500 truncate">{ticket.email}</p>
                            </div>
                        </div>
                    ))}
                    
                    {filteredTickets.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No tickets found</p>
                        </div>
                    )}
                </div>

                {/* Ticket Details */}
                <div className={clsx(
                    "lg:col-span-8 h-full",
                    // Mobile: Hide details if NO ticket selected
                    !selectedTicket ? "hidden lg:block" : "block"
                )}>
                    {selectedTicket ? (
                        <Card className="h-full border-white/5 bg-[#121419] flex flex-col p-0 overflow-hidden relative">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-start backdrop-blur-sm sticky top-0 z-10">
                                <div>
                                    {/* Mobile Back Button */}
                                    <button 
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Back to List</span>
                                    </button>

                                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 flex-wrap">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-crypto-accent animate-pulse"></span>
                                            <span className="text-white">{selectedTicket.user}</span>
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="font-mono">{selectedTicket.email}</span>
                                    </div>
                                </div>
                                {selectedTicket.status === 'Open' && (
                                    <Button 
                                        onClick={() => handleCloseTicket(selectedTicket.id)} 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500 whitespace-nowrap"
                                    >
                                        <CheckCircle className="w-4 h-4 md:mr-2" />
                                        <span className="hidden md:inline">Resolve</span>
                                    </Button>
                                )}
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dots-pattern">
                                {/* Messages History */}
                                {selectedTicket.messages && selectedTicket.messages.map((msg, idx) => (
                                    <div key={idx} className={clsx(
                                        "flex gap-4 animate-in slide-in-from-bottom-2 duration-300", 
                                        msg.senderRole === 'ADMIN' ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg font-bold text-sm",
                                            msg.senderRole === 'ADMIN' 
                                                ? "bg-crypto-accent shadow-crypto-accent/20" 
                                                : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20 text-white"
                                        )}>
                                            {msg.senderRole === 'ADMIN' ? <CheckCircle className="w-5 h-5 text-black" /> : selectedTicket.user.charAt(0).toUpperCase()}
                                        </div>
                                        
                                        <div className={clsx("flex-1 max-w-[90%] md:max-w-[80%]", msg.senderRole === 'ADMIN' ? "items-end flex flex-col" : "")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={clsx("text-sm font-bold", msg.senderRole === 'ADMIN' ? "text-crypto-accent" : "text-white")}>
                                                    {msg.senderRole === 'ADMIN' ? 'Support Team' : selectedTicket.user}
                                                </span>
                                                <span className="text-[10px] text-gray-500">{new Date(msg.sentAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div className={clsx(
                                                "p-4 text-sm leading-relaxed shadow-sm border",
                                                msg.senderRole === 'ADMIN'
                                                    ? "bg-crypto-accent/10 border-crypto-accent/20 text-white rounded-2xl rounded-tr-none"
                                                    : "bg-white/5 border-white/5 text-gray-200 rounded-2xl rounded-tl-none"
                                            )}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            {/* Reply Input */}
                            {!['Closed', 'Resolved'].includes(selectedTicket.status) && (
                                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                    <div className="relative">
                                        <textarea 
                                            className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-4 pr-16 text-sm text-white focus:outline-none focus:border-crypto-accent/50 focus:ring-1 focus:ring-crypto-accent/50 transition-all resize-none shadow-inner"
                                            placeholder="Type your reply here..."
                                            rows="3"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleReply();
                                                }
                                            }}
                                        />
                                        <div className="absolute right-3 bottom-3">
                                            <Button 
                                                onClick={handleReply} 
                                                isLoading={replying}
                                                disabled={!replyText.trim()}
                                                size="sm"
                                                className="shadow-lg shadow-crypto-accent/20"
                                            >
                                                <Send className="w-4 h-4 md:mr-2" />
                                                <span className="hidden md:inline">Send Reply</span>
                                                <span className="md:hidden">Send</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1.5 ml-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span>User will be notified immediately. Ticket remains <strong>Open</strong> until you click Resolve.</span>
                                    </p>
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60 bg-[#121419] border-dashed border-2 border-white/5 space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                <MessageSquare className="w-10 h-10 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Select a Ticket</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">Choose a conversation from the left to view details and respond to users.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <ActionConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};
