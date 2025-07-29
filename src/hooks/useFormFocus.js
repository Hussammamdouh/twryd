import { useRef, useCallback } from 'react';

/**
 * Custom hook to manage form input focus and prevent focus loss during re-renders
 * @param {string} initialFocusId - The ID of the input to focus initially
 * @returns {Object} - Object containing focus management functions
 */
export const useFormFocus = (initialFocusId = null) => {
  const focusedInputRef = useRef(null);
  const initialFocusRef = useRef(initialFocusId);

  // Function to set the currently focused input
  const setFocusedInput = useCallback((inputRef) => {
    focusedInputRef.current = inputRef;
  }, []);

  // Function to restore focus to the last focused input
  const restoreFocus = useCallback(() => {
    if (focusedInputRef.current) {
      focusedInputRef.current.focus();
    } else if (initialFocusRef.current) {
      const element = document.getElementById(initialFocusRef.current);
      if (element) {
        element.focus();
      }
    }
  }, []);

  // Function to focus the first input in a form
  const focusFirstInput = useCallback((formRef) => {
    if (formRef?.current) {
      const firstInput = formRef.current.querySelector(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
      );
      if (firstInput) {
        firstInput.focus();
        setFocusedInput(firstInput);
      }
    }
  }, [setFocusedInput]);

  // Function to handle input focus events
  const handleInputFocus = useCallback((event) => {
    setFocusedInput(event.target);
  }, [setFocusedInput]);

  // Function to handle input blur events
  const handleInputBlur = useCallback(() => {
    // Don't clear the ref immediately on blur to allow for validation
    // The ref will be cleared when the component unmounts or form is reset
  }, []);

  return {
    setFocusedInput,
    restoreFocus,
    focusFirstInput,
    handleInputFocus,
    handleInputBlur,
    focusedInputRef
  };
}; 