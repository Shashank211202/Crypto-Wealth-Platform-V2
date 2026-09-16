import { createContext, useContext, useState, useEffect } from 'react';

const MarketContext = createContext();

export const useMarket = () => {
  return useContext(MarketContext);
};

export const MarketProvider = ({ children }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data or initial fetch could go here
  useEffect(() => {
    // Placeholder fetching logic
    setMarketData([
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45000, price_change_percentage_24h: 2.5 },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2400, price_change_percentage_24h: 1.2 },
        { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01 },
    ]);
  }, []);

  const value = {
    marketData,
    loading
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};
