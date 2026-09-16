import api from './api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache to prevent jumpy data on re-renders (Frontend cache layered on top of backend cache)
const CACHE = {};

export const chartService = {
  async getMarketData(coin = 'BTC', timeframe = '1D') {
    const key = `${coin}_${timeframe}`;
    
    // Return cached data if available and fresh-ish (simple in-memory check, could be better)
    if (CACHE[key] && (Date.now() - CACHE[key].timestamp < 60000)) {
        return [...CACHE[key].data];
    }

    try {
        const response = await api.get(`/market/history/${coin}/${timeframe}`);
        
        if (response.data && response.data.success) {
            CACHE[key] = {
                data: response.data.data,
                timestamp: Date.now()
            };
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch market data", error);
        return [];
    }
  }
};
