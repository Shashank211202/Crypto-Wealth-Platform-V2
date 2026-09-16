/**
 * Application-wide constants
 * Centralized location for all constant values used across the application
 */

// ===== VALIDATION MESSAGES =====
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password does not meet requirements',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_ADDRESS: 'Please enter a valid wallet address',
  INVALID_NETWORK: 'Please specify the network name',
  MIN_AMOUNT: (min) => `Minimum amount is $${min}`,
  MAX_AMOUNT: (max) => `Maximum amount is $${max}`,
  INSUFFICIENT_BALANCE: (currency, available) => 
    `Insufficient ${currency} balance. Available: ${available}`,
};

// ===== API SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  // Deposits
  DEPOSIT_SUBMITTED: 'Deposit submitted successfully! Awaiting admin approval.',
  DEPOSIT_APPROVED: 'Deposit has been approved!',
  
  // Withdrawals
  WITHDRAWAL_SUBMITTED: 'Withdrawal request submitted successfully!',
  WITHDRAWAL_COMPLETED: 'Withdrawal completed successfully!',
  OTP_SENT: 'OTP sent to your email!',
  OTP_RESENT: 'New OTP sent to your email!',
  
  // Authentication
  REGISTRATION_SUCCESS: 'Registration successful! Please log in.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Profile & Settings
  PROFILE_UPDATED: 'Profile information updated successfully!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  SECURITY_UPDATED: 'Security settings updated!',
  NOTIFICATIONS_UPDATED: 'Notification preferences updated!',
  WALLET_ADDRESS_UPDATED: 'Withdrawal address updated!',
  
  // Wallet
  WALLET_ADDED: 'Wallet added successfully!',
  WALLET_REMOVED: 'Wallet entry terminated',
  ADDRESS_COPIED: 'Address copied to clipboard!',
  
  // Support
  TICKET_CREATED: 'Ticket created successfully!',
  REPLY_SENT: 'Reply sent!',
  
  // Admin
  USER_UPDATED: 'User updated successfully!',
  PLAN_CREATED: 'Plan created successfully!',
  PLAN_UPDATED: 'Plan updated successfully!',
  PLAN_DELETED: 'Plan deleted successfully!',
};

// ===== API ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Specific errors
  LOAD_FAILED: (resource) => `Failed to load ${resource}`,
  SUBMIT_FAILED: (action) => `${action} failed. Please try again.`,
  UPDATE_FAILED: (resource) => `Failed to update ${resource}`,
  DELETE_FAILED: (resource) => `Failed to delete ${resource}`,
};

// ===== TRANSACTION TYPES =====
export const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  PROFIT: 'PROFIT',
  COMMISSION: 'COMMISSION',
  BONUS: 'BONUS',
};

// ===== TRANSACTION STATUSES =====
export const TRANSACTION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  PROCESSING: 'Processing',
  ADMIN_PROCESSING: 'Admin processing',
  FUNDS_LOCKED: 'Funds locked',
};

// ===== INVESTMENT STATUSES =====
export const INVESTMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ===== USER ROLES =====
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// ===== SUPPORTED NETWORKS =====
export const NETWORKS = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ERC20: 'ERC20',
  TRC20: 'TRC20',
  BEP20: 'BEP20',
};

// ===== SUPPORTED COINS =====
export const COINS = {
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
  USDC: 'USDC',
  BNB: 'BNB',
  TRX: 'TRX',
};

// ===== TIME CONSTANTS =====
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

// ===== PAGINATION =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
};

// ===== FILE UPLOAD =====
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// ===== API ENDPOINTS (if needed for reference) =====
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    WALLET: '/user/wallet',
  },
  // Add more as needed
};

export default {
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  INVESTMENT_STATUS,
  USER_ROLES,
  NETWORKS,
  COINS,
  TIME,
  PAGINATION,
  FILE_UPLOAD,
  STORAGE_KEYS,
  API_ENDPOINTS,
};
