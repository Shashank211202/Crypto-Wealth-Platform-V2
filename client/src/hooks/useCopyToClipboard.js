/**
 * Custom hook for handling clipboard copy operations
 * Provides copy functionality with automatic feedback and timeout
 */

import { useState } from 'react';
import { notify } from '../utils/notifications';
import { SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Hook for copying text to clipboard with feedback
 * @param {number} resetDelay - Time in ms before resetting copied state (default: 2000)
 * @param {string} successMessage - Custom success message (optional)
 * @returns {object} { copy, copied, reset }
 */
export const useCopyToClipboard = (resetDelay = 2000, successMessage = null) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @param {string} label - Optional label for the success message
   */
  const copy = async (text, label = '') => {
    if (!text) {
      notify.error('Nothing to copy');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopiedText(text);

      const message = successMessage || 
                     (label ? `${label} ${SUCCESS_MESSAGES.ADDRESS_COPIED}` : SUCCESS_MESSAGES.ADDRESS_COPIED);
      
      notify.success(message);

      // Auto-reset after delay
      if (resetDelay > 0) {
        setTimeout(() => {
          setCopied(false);
          setCopiedText('');
        }, resetDelay);
      }

      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      notify.error('Failed to copy to clipboard');
      return false;
    }
  };

  /**
   * Manually reset the copied state
   */
  const reset = () => {
    setCopied(false);
    setCopiedText('');
  };

  return {
    copy,
    copied,
    copiedText,
    reset,
  };
};

export default useCopyToClipboard;
