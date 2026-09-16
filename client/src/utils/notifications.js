/**
 * Centralized notification utilities
 * Provides consistent toast notifications across the application
 */

import { toast } from 'react-hot-toast';

// Default toast options
const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#18181b',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
};

/**
 * Show success notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export const notifySuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    style: {
      ...defaultOptions.style,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    ...options,
  });
};

/**
 * Show error notification
 * @param {string} message - Error message to display
 * @param {object} options - Additional toast options
 */
export const notifyError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    duration: 5000, // Errors stay longer
    style: {
      ...defaultOptions.style,
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    ...options,
  });
};

/**
 * Show info notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export const notifyInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    icon: 'ℹ️',
    style: {
      ...defaultOptions.style,
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    ...options,
  });
};

/**
 * Show loading notification
 * @param {string} message - Loading message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID for dismissal
 */
export const notifyLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Dismiss a specific notification
 * @param {string} toastId - ID of the toast to dismiss
 */
export const dismissNotification = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Handle API error and show appropriate message
 * @param {Error|string|object} error - Error object or message
 * @param {string} defaultMessage - Default message if error parsing fails
 */
export const notifyApiError = (error, defaultMessage = 'An error occurred. Please try again.') => {
  let message = defaultMessage;

  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error) {
    message = error.error;
  }

  return notifyError(message);
};

/**
 * Notification helper object
 */
export const notify = {
  success: notifySuccess,
  error: notifyError,
  info: notifyInfo,
  loading: notifyLoading,
  dismiss: dismissNotification,
  apiError: notifyApiError,
};

export default notify;
