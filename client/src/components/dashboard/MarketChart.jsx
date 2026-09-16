import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '../ui/Card';
import { CryptoLoader } from '../ui/CryptoLoader';
import { Activity, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export const COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#f59e0b', binanceSymbol: 'BTCUSDT' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#6366f1', binanceSymbol: 'ETHUSDT' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#14f195', binanceSymbol: 'SOLUSDT' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', color: '#facc15', binanceSymbol: 'BNBUSDT' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#3b82f6', binanceSymbol: 'ADAUSDT' },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple', color: '#ffffff', binanceSymbol: 'XRPUSDT' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#fbbf24', binanceSymbol: 'DOGEUSDT' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#e11d48', binanceSymbol: 'DOTUSDT' },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon', color: '#8b5cf6', binanceSymbol: 'MATICUSDT' },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', color: '#94a3b8', binanceSymbol: 'LTCUSDT' }
];

const TIMEFRAMES = [
    { label: '1M', value: '1m', limit: 100 },
    { label: '5M', value: '5m', limit: 100 },
    { label: '15M', value: '15m', limit: 100 },
    { label: '1H', value: '1h', limit: 100 },
    { label: '1D', value: '1d', limit: 30 } // For longer view
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#18181b] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-gray-400 text-[10px] font-medium mb-1">
                    {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-400 text-xs font-medium mb-2">
                    {new Date(data.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-crypto-accent"></span>
                    ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>
        );
    }
    return null;
};

export const MarketChart = ({ coin = COINS[0] }) => {
    // coin is now controlled by parent
    const [timeframe, setTimeframe] = useState(TIMEFRAMES[1]); // Default 5M
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);

    // Cache key helper
    const getCacheKey = (coinId, days) => `market_chart_${coinId}_${days}`;

    // Live WebSocket Updates
    useEffect(() => {
        const symbol = coin.binanceSymbol.toLowerCase();
        if (!symbol) return;

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
        
        // ws.onopen = () => console.log('WS Connected to', symbol);
        ws.onerror = (e) => console.error('WS Error', e);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            // console.log('WS Price:', price); // Uncomment to spam console
            
            setCurrentPrice(price);
            
            // Live Chart Update
            setChartData(prev => {
                if (!prev || prev.length === 0) return prev;
                
                const lastPoint = prev[prev.length - 1];
                // Throttle based on timeframe to keep chart readable
                // 1m: update every 1s
                // 5m: update every 5s
                // 15m: update every 10s
                // 1h: update every 30s
                let throttle = 1000; // Default for 1m
                if (timeframe.value === '5m') throttle = 5000;
                if (timeframe.value === '15m') throttle = 10000;
                if (timeframe.value === '1h') throttle = 30000;
                if (timeframe.value === '1d') throttle = 60000; // 1 minute for daily

                if (lastPoint && Date.now() - lastPoint.date > throttle) {
                     const newPoint = {
                        date: Date.now(),
                        price: price,
                        formattedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    // Keep roughly 'limit' number of points
                    const maxPoints = timeframe.limit + 20; 
                    if (prev.length > maxPoints) {
                        return [...prev.slice(1), newPoint];
                    }
                    return [...prev, newPoint]; 
                }
                return prev;
            });
        };

        return () => {
             ws.close();
        };
    }, [coin, timeframe]);

    useEffect(() => {
        const fetchMarketData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch K-Lines from Binance
                const res = await axios.get('https://api.binance.com/api/v3/klines', {
                    params: {
                        symbol: coin.binanceSymbol,
                        interval: timeframe.value,
                        limit: timeframe.limit
                    }
                });

                // Binance format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
                const formattedData = res.data.map(d => ({
                    date: d[0],
                    price: parseFloat(d[4]), // Close price
                    formattedDate: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));

                const latestPrice = formattedData[formattedData.length - 1].price;
                const startPrice = formattedData[0].price;
                const changePct = ((latestPrice - startPrice) / startPrice) * 100;

                setChartData(formattedData);
                setCurrentPrice(latestPrice);
                setPriceChange(changePct);

            } catch (err) {
                console.error("Failed to fetch market chart", err);
                setError("Failed to load market data (Binance API).");
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [coin, timeframe]);

    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                   <div className="flex items-center gap-3">
                       <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Activity className="w-5 h-5 text-crypto-accent" /> 
                           Market Overview
                       </h3>
                       {loading && <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />}
                   </div>
                   <div className="flex items-baseline gap-2 mt-1">
                       <h2 className="text-3xl font-black text-white px-2">
                           ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </h2>
                       <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full", priceChange >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                           {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                       </span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2">
                     <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5 flex gap-1">
                        {TIMEFRAMES.map(tf => (
                            <button 
                                key={tf.value}
                                onClick={() => setTimeframe(tf)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    timeframe.value === tf.value
                                        ? "bg-crypto-accent text-white shadow-lg shadow-crypto-accent/20"
                                        : "text-gray-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-[400px] relative">
                {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-2 bg-red-500/5 rounded-xl border border-red-500/10">
                        <AlertCircle className="w-8 h-8" />
                        <p className="text-sm font-bold">{error}</p>
                        <button onClick={() => window.location.reload()} className="text-xs underline hover:text-red-300">Retry</button>
                    </div>
                ) : loading && chartData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <CryptoLoader />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={coin.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={coin.color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                                dataKey="formattedDate" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                minTickGap={30}
                            />
                            <YAxis 
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke={coin.color} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
            
        </div>
    );
};
