/**
 * Centralized validation utilities
 * Provides consistent validation logic across the application
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with checks and score
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
      score: 0,
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isValid = score >= 4; // At least 4 out of 5 checks must pass

  return {
    isValid,
    checks,
    score,
  };
};

/**
 * Validate amount within range
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {object} Validation result
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Please enter a valid amount',
    };
  }

  if (numAmount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than 0',
    };
  }

  if (numAmount < min) {
    return {
      isValid: false,
      error: `Minimum amount is ${min}`,
    };
  }

  if (numAmount > max) {
    return {
      isValid: false,
      error: `Maximum amount is ${max}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate cryptocurrency address
 * @param {string} address - Address to validate
 * @param {string} network - Network type (optional)
 * @returns {boolean} True if valid format
 */
export const validateCryptoAddress = (address, network = null) => {
  if (!address) return false;

  // Basic validation - just check it's not empty and has reasonable length
  // More specific validation would require crypto-specific libraries
  if (address.length < 20 || address.length > 120) {
    return false;
  }

  // BTC addresses typically start with 1, 3, or bc1
  if (network === 'BTC' || network === 'Bitcoin') {
    return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
  }

  // ETH addresses start with 0x and are 42 characters
  if (network === 'ETH' || network === 'Ethereum' || network === 'ERC20') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // TRC20 (Tron) addresses start with T
  if (network === 'TRC20' || network === 'Tron') {
    return /^T[a-zA-Z0-9]{33}$/.test(address);
  }

  // Generic validation for other networks
  return /^[a-zA-Z0-9]{20,120}$/.test(address);
};

/**
 * Validate transaction hash
 * @param {string} txHash - Transaction hash to validate
 * @returns {boolean} True if valid format
 */
export const validateTxHash = (txHash) => {
  if (!txHash) return false;

  // Most blockchain tx hashes are 64-66 hex characters
  return /^(0x)?[a-fA-F0-9]{64,66}$/.test(txHash);
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  const isEmpty = value === null || value === undefined || value === '' || 
                  (typeof value === 'string' && value.trim() === '');

  return {
    isValid: !isEmpty,
    error: isEmpty ? `${fieldName} is required` : null,
  };
};

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Basic phone validation - supports various formats
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};
