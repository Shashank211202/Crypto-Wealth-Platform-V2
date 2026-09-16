import { walletService } from './wallet.service';
import { depositService } from './deposit.service';
import { withdrawalService } from './withdrawal.service';
import { authService } from './auth.service';
import api from './api';
import axios from 'axios';

export const dashboardService = {
  async getOverview() {
    try {
      // 1. Fetch Wallet
      const wallet = await walletService.getMyWallet(); 
      // Wallet response: { _id, userId, balance, investmentBalanceUSD, isFrozen, ... }
      // balances is a Map/Object. Assuming USDT_TRC20 is the main liquid balance logic from previous code?
      // Wait, wallet.model.js says `balances` is a Map.
      // previous code used `wallet.balance` or `wallet.balances?.USDT_TRC20`.
      // Let's inspect `getMyWallet` in `wallet.service.js` again? 
      // It returns `response.data`.
      // In `wallet.controller.js`, `getOrCreateWallet` is used.
      // I'll assume `balances` object exists.
      
      const normalizeBalance = (val) => {
          if (!val) return 0;
          if (val.$numberDecimal) return parseFloat(val.$numberDecimal);
          if (typeof val === 'object') {
             // Handle case where Mongoose might return other object structures
             return parseFloat(val.toString()); // or 0 if unsafe
          }
          return parseFloat(val);
      };

      // 2. Fetch Live BTC Price
      let btcPrice = 95000;
      try {
          const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          if (priceRes.data && priceRes.data.price) {
              btcPrice = parseFloat(priceRes.data.price);
          }
      } catch (e) {
          console.warn('Failed to fetch live BTC price, using default');
      }

      let balanceUSDT = 0;
      let cryptoHoldingsUSD = 0;

      if (wallet.balances) {
           Object.entries(wallet.balances).forEach(([key, val]) => {
               const amount = normalizeBalance(val);
               // Stablecoins (1:1 with USD)
               if (key === 'USDT' || key === 'USDC' || key.includes('USDT') || key.includes('USDC')) {
                   balanceUSDT += amount;
               } 
               // Bitcoin (multiply by price)
               else if (key.includes('BTC')) {
                   cryptoHoldingsUSD += (amount * btcPrice);
               }
               // Other coins (fallback: treat as 0 or need price feed. safely ignore for now to prevent massive inflation)
               // else { 
               //    console.warn(`Unknown asset ${key} with balance ${amount}, ignored in total USD calc`);
               // }
           });
      }
      
      const investBalance = parseFloat(wallet.investmentBalanceUSD || 0);



      // Total USD = Liquid Balance + Investment Balance
      const totalUSD = balanceUSDT + cryptoHoldingsUSD + investBalance;

      return {
          total_usd: totalUSD,
          total_btc: btcPrice > 0 ? (totalUSD / btcPrice) : 0, 
          withdrawable: balanceUSDT + cryptoHoldingsUSD, // ONLY Liquid funds
          active_deposit: investBalance, 
          profit_total: wallet.totalProfit || 0, 
          profit_last_month: 0,
          btcPrice,
          balances: wallet.balances 
      };
    } catch (error) {
       console.error("Dashboard overview error", error);
       // Return zeroed data instead of mock
       return {
          total_usd: 0,
          total_btc: 0,
          withdrawable: 0,
          active_deposit: 0,
          profit_total: 0,
          profit_last_month: 0
       };
    }
  },

  async getPlans() {
    try {
        const response = await api.get('/admin/public/plans');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch public plans', error);
        return [];
    }
  },

  async createDeposit(planId, amount, proofFile, adminWalletId, txHash) {
    const formData = new FormData();
    formData.append('claimedAmount', amount);
    if (proofFile) {
        formData.append('screenshot', proofFile);
    }
    if (adminWalletId) {
        formData.append('adminWalletId', adminWalletId);
    }
    if (txHash) {
        formData.append('txHash', txHash);
    }
    if (planId) {
        formData.append('planId', planId);
    }
    // planId is now sent. Backend needs to be updated to handle it in a future task if not already supported.

    return await depositService.createDeposit(formData);
  },

  async withdraw(amount, address) {
      // Deprecated in favor of withdrawalService.createWithdrawal
      // Keeping this wrapper for backward compatibility if needed
      return await withdrawalService.createWithdrawal(amount, 'USDT', 'TRC20', address);
  },
  
  async getUserDeposits() {
      return await depositService.getMyDeposits();
  },

  async saveWallet(walletData) {
      try {
          const response = await api.post('/users/wallets', walletData);
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to save wallet';
      }
  },

  async investFromWallet(planId, amount) {
      try {
          const response = await api.post('/investments/purchase', { planId, amount });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to purchase plan';
      }
  },

  async createTicket(ticketData) {
      try {
          const payload = { category: 'GENERAL', ...ticketData };
          const response = await api.post('/tickets', payload); 
          const t = response.data.ticket;
          return {
              id: t._id,
              subject: t.subject,
              messages: t.messages, // Return full messages
              status: t.status.charAt(0) + t.status.slice(1).toLowerCase(),
              date: t.createdAt,
          };
      } catch (error) {
          if (error.response && error.response.status === 404) {
              throw "Support ticket system is currently disabled by the server.";
          }
          throw error.response?.data?.message || 'Failed to create ticket';
      }
  },

  async replyTicket(ticketId, message) {
      try {
          const response = await api.post(`/tickets/${ticketId}/reply`, { message });
          return response.data;
      } catch (error) {
          throw error.response?.data?.message || 'Failed to reply to ticket';
      }
  },

  async getUserTickets() {
      try {
          const response = await api.get('/tickets');
          return response.data.map(t => ({
              id: t._id,
              subject: t.subject,
              messages: t.messages, // Return full messages
              status: t.status.charAt(0) + t.status.slice(1).toLowerCase(),
              date: t.createdAt,
          }));
      } catch (error) {
          throw error.response?.data?.message || 'Failed to fetch tickets';
      }
  },

  async getUserWithdrawals() {
      return await withdrawalService.getMyWithdrawals();
  }
};

