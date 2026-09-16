import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { X, Wallet, CheckCircle2 } from 'lucide-react';

const NETWORKS = [
    { id: 'TRC20', name: 'Tron (TRC20)' },
    { id: 'ERC20', name: 'Ethereum (ERC20)' },
    { id: 'BEP20', name: 'BNB Smart Chain (BEP20)' },
    { id: 'SOL', name: 'Solana' },
    { id: 'POLYGON', name: 'Polygon' },
    { id: 'BITCOIN', name: 'Bitcoin Network' }
];

const ASSETS = [
    { symbol: 'USDT', name: 'Tether USD', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'BTC', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'BNB', name: 'BNB', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { symbol: 'SOL', name: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' }
];

const AddWalletModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [coin, setCoin] = useState('USDT');
    const [network, setNetwork] = useState('TRC20');
    const [address, setAddress] = useState('');
    const [label, setLabel] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await userService.addSavedWallet({
                coin,
                network,
                address, 
                label: label || `${coin} - ${network}`
            });
            toast.success("Wallet added successfully!");
            onSuccess(result.savedWallets);
            onClose();
            // Reset form
            setAddress('');
            setLabel('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to add wallet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="bg-[#121419] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-crypto-accent" />
                    Add Withdrawal Wallet
                </h2>
                <p className="text-sm text-zinc-500 mb-6">Save your wallet address for faster withdrawals.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Asset Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Asset</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {ASSETS.map(asset => (
                                <button
                                    key={asset.symbol}
                                    type="button"
                                    onClick={() => {
                                        setCoin(asset.symbol);
                                        // Default network logic
                                        if(asset.symbol === 'BTC') setNetwork('BITCOIN');
                                        else if(asset.symbol === 'USDT') setNetwork('TRC20');
                                    }}
                                    className={clsx(
                                        "flex-shrink-0 px-3 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all",
                                        coin === asset.symbol 
                                            ? "bg-crypto-accent/20 border-crypto-accent text-crypto-accent shadow-[0_0_10px_rgba(139,92,246,0.2)]" 
                                            : "bg-[#0B0E14] border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                                    )}
                                >
                                    {asset.logo && <img src={asset.logo} className="w-4 h-4 rounded-full" alt="" />}
                                    {asset.symbol}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Network Selection - Dynamic based on Coin */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Network</label>
                         <div className="grid grid-cols-2 gap-2">
                            {NETWORKS.filter(n => {
                                if(coin === 'BTC') return n.id === 'BITCOIN';
                                if(coin === 'ETH') return n.id === 'ERC20';
                                if(coin === 'SOL') return n.id === 'SOL';
                                return n.id !== 'BITCOIN'; // Others show general networks
                            }).map(net => (
                                <button
                                    key={net.id}
                                    type="button"
                                    onClick={() => setNetwork(net.id)}
                                    className={clsx(
                                        "px-3 py-2.5 rounded-lg border text-xs font-bold transition-all text-center uppercase tracking-wide",
                                        network === net.id 
                                            ? "bg-white/10 border-white text-white" 
                                            : "bg-[#0B0E14] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                                    )}
                                >
                                    {net.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Address Input */}
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Wallet Address</label>
                         <input 
                            type="text" 
                            required
                            placeholder={`Enter ${coin} (${network}) Address`}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-[#0B0E14] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-crypto-accent focus:border-crypto-accent outline-none font-mono placeholder:text-zinc-700"
                         />
                    </div>

                    {/* Label Input */}
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Label (Optional)</label>
                         <input 
                            type="text" 
                            placeholder="e.g. My Trust Wallet"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full bg-[#0B0E14] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-crypto-accent focus:border-crypto-accent outline-none"
                         />
                    </div>

                    <Button type="submit" isLoading={loading} className="w-full h-12 text-sm font-bold mt-2">
                        Save Wallet
                    </Button>
                </form>
             </div>
        </div>
    );
};

export default AddWalletModal;
