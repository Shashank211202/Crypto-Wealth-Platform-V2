/**
 * Custom hook for making API calls with standardized error handling
 * Wraps API calls with loading states and automatic error notification
 */

import { useState } from 'react';
import { notify } from '../utils/notifications';

/**
 * Hook for API calls with automatic error handling
 * @returns {object} { execute, loading, error }
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute an API call with automatic error handling
   * @param {Function} apiFunction - The API function to call
   * @param {object} options - Configuration options
   * @returns {Promise} The API response
   */
  const execute = async (apiFunction, options = {}) => {
    const {
      onSuccess = null,
      onError = null,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      errorMessage = null,
      finally: finallyCallback = null,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();

      if (showSuccessToast) {
        notify.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      setError(err);

      if (showErrorToast) {
        notify.apiError(err, errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err; // Re-throw for caller to handle if needed
    } finally {
      setLoading(false);
      
      if (finallyCallback) {
        finallyCallback();
      }
    }
  };

  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null);
  };

  return {
    execute,
    loading,
    error,
    resetError,
  };
};

export default useApiCall;
