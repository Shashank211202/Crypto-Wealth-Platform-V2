/**
 * Centralized formatting utilities
 * Provides consistent formatting for currency, numbers, and dates across the application
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '$0.00' : '0.00';
  }

  const formatted = Number(amount).toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `$${formatted}` : formatted;
};

/**
 * Format a number with locale string
 * @param {number} number - The number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return Number(number).toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

/**
 * Format a crypto amount with appropriate precision
 * @param {number} amount - The crypto amount
 * @param {string} coin - The cryptocurrency (BTC, ETH, etc.)
 * @returns {string} Formatted crypto amount
 */
export const formatCrypto = (amount, coin = 'BTC') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00000000';
  }

  // BTC typically uses 8 decimal places
  const decimals = coin === 'BTC' ? 8 : 4;
  
  return Number(amount).toFixed(decimals);
};

/**
 * Format a date for display
 * @param {Date|string|number} date - The date to format
 * @param {string} format - Format type ('locale', 'short', 'time', 'full')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'locale') => {
  if (!date) return 'N/A';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    
    case 'time':
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    case 'full':
      return dateObj.toLocaleString();
    
    case 'locale':
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Truncate a long string (useful for addresses, hashes)
 * @param {string} str - String to truncate
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Truncated string
 */
export const truncateString = (str, startChars = 6, endChars = 4) => {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {object} options - Formatting options
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, options = {}) => {
  const {
    decimals = 2,
    showSign = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const formatted = Number(value).toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  
  return `${sign}${formatted}%`;
};
