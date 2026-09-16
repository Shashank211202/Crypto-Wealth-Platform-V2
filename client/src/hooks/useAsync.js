/**
 * Custom hook for handling async operations
 * Manages loading, error, and success states automatically
 */

import { useState, useCallback } from 'react';
import { notify } from '../utils/notifications';

/**
 * Hook for managing async operations with loading and error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Execute immediately on mount (default: true)
 * @param {object} options - Configuration options
 * @returns {object} { execute, loading, error, data, reset }
 */
export const useAsync = (asyncFunction, immediate = false, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
  } = options;

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Execute the async function
   * @param  {...any} params - Parameters to pass to the async function
   * @returns {Promise} The result of the async function
   */
  const execute = useCallback(async (...params) => {
    setStatus('loading');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...params);
      setData(response);
      setStatus('success');

      if (showSuccessToast) {
        notify.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      setError(err);
      setStatus('error');

      if (showErrorToast) {
        notify.apiError(err, errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err; // Re-throw so caller can handle if needed
    }
  }, [asyncFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  // Computed states for convenience
  const isIdle = status === 'idle';
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return {
    execute,
    reset,
    status,
    data,
    error,
    isIdle,
    isLoading,
    isSuccess,
    isError,
    loading: isLoading, // Alias for backward compatibility
  };
};

export default useAsync;
