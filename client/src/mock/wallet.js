export const MOCK_WALLET = {
    total_usd: 45250.75,
    withdrawable: 42100.25,
    profit_daily: 450.80,
    profit_total: 12840.50,
    crypto_assets: [
        { symbol: 'BTC', amount: 0.45, value_usd: 28500.00, change_24h: 3.2 },
        { symbol: 'ETH', amount: 4.2, value_usd: 12600.00, change_24h: -1.5 },
        { symbol: 'USDT', amount: 2500.25, value_usd: 2500.25, change_24h: 0.0 },
        { symbol: 'SOL', amount: 150.0, value_usd: 14500.00, change_24h: 8.4 },
        { symbol: 'BNB', amount: 10.5, value_usd: 3500.00, change_24h: 1.1 },
        { symbol: 'XRP', amount: 5000.0, value_usd: 3000.00, change_24h: -0.5 },
        { symbol: 'ADA', amount: 2500.0, value_usd: 1250.00, change_24h: 2.1 },
        { symbol: 'DOGE', amount: 10000.0, value_usd: 850.00, change_24h: -4.3 }
    ],
    recent_transactions: [
        { id: 'tx_101', type: 'deposit', amount: 5000, asset: 'USDT', status: 'completed', date: '2025-01-11T14:30:00Z' },
        { id: 'tx_102', type: 'profit', amount: 150.50, asset: 'USDT', status: 'completed', date: '2025-01-11T00:00:00Z' },
        { id: 'tx_103', type: 'profit', amount: 148.20, asset: 'USDT', status: 'completed', date: '2025-01-10T00:00:00Z' },
        { id: 'tx_104', type: 'deposit', amount: 2500, asset: 'BTC', status: 'completed', date: '2025-01-08T09:15:00Z' },
        { id: 'tx_105', type: 'withdrawal', amount: 1000, asset: 'ETH', status: 'pending', date: '2025-01-07T18:45:00Z' },
        { id: 'tx_106', type: 'profit', amount: 142.10, asset: 'USDT', status: 'completed', date: '2025-01-09T00:00:00Z' },
        { id: 'tx_107', type: 'referral_bonus', amount: 50.00, asset: 'USDT', status: 'completed', date: '2025-01-06T12:00:00Z' },
        { id: 'tx_108', type: 'withdrawal', amount: 2500, asset: 'USDT', status: 'completed', date: '2025-01-05T10:20:00Z' },
        { id: 'tx_109', type: 'deposit', amount: 10000, asset: 'USDT', status: 'completed', date: '2025-01-01T15:00:00Z' },
        { id: 'tx_110', type: 'profit', amount: 135.00, asset: 'USDT', status: 'completed', date: '2025-01-08T00:00:00Z' },
        { id: 'tx_111', type: 'subscription', amount: 99.00, asset: 'USDT', status: 'completed', date: '2025-01-08T10:00:00Z' },
        { id: 'tx_112', type: 'deposit', amount: 500, asset: 'SOL', status: 'failed', date: '2024-12-28T11:20:00Z' },
        { id: 'tx_113', type: 'withdrawal', amount: 200, asset: 'USDT', status: 'cancelled', date: '2024-12-25T16:30:00Z' }
    ]
};
