export const MOCK_USER = {
  id: 'usr_123456',
  name: 'Alex Crypto',
  email: 'alex@crypto.com',
  balance: {
    total_usd: 12450.80,
    withdrawable: 12450.80,
    profit_daily: 125.50,
    profit_total: 3450.00
  },
  wallets: [
    { coin: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    { coin: 'ETH', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
  ],
  active_plan: {
    id: 'plan_premium',
    name: 'Premium Compound',
    start_date: '2025-11-01T10:00:00Z',
    amount: 5000
  },
  isAdmin: false
};

export const MOCK_ADMIN = {
  ...MOCK_USER,
  id: 'adm_999',
  name: 'Admin User',
  email: 'admin@crypto.com',
  isAdmin: true
};
