/**
 * Utility functions for form handling that prevent unnecessary re-renders
 */

/**
 * Creates a memoized change handler that updates form state without causing re-renders
 * @param {Function} setForm - The form state setter function
 * @param {Function} setErrors - The errors state setter function (optional)
 * @returns {Function} - Memoized change handler
 */
export const createFormChangeHandler = (setForm, setErrors = null) => {
  return (e) => {
    const { name, value, type, checked, files } = e.target;
    const fieldValue = type === 'checkbox' ? checked : 
                      type === 'file' ? files[0] : value;
    
    // Update form state
    setForm(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error if it exists (only if setErrors is provided)
    if (setErrors) {
      setErrors(prev => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    }
  };
};

/**
 * Validates a form field and returns error message
 * @param {string} name - Field name
 * @param {any} value - Field value
 * @param {Object} validators - Validation rules
 * @returns {string} - Error message or empty string
 */
export const validateField = (name, value, validators = {}) => {
  const validator = validators[name];
  if (!validator) return '';
  
  return validator(value);
};

/**
 * Validates entire form and returns errors object
 * @param {Object} form - Form data
 * @param {Object} validators - Validation rules
 * @returns {Object} - Errors object
 */
export const validateForm = (form, validators) => {
  const errors = {};
  
  Object.keys(validators).forEach(fieldName => {
    const error = validateField(fieldName, form[fieldName], validators);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^01[0-9]{9}$|^\+?[0-9]{10,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
};

/**
 * Common validators
 */
export const COMMON_VALIDATORS = {
  required: (value) => !value || !value.toString().trim() ? 'This field is required.' : '',
  email: (value) => !value ? '' : !VALIDATION_PATTERNS.EMAIL.test(value) ? 'Please enter a valid email address.' : '',
  phone: (value) => !value ? '' : !VALIDATION_PATTERNS.PHONE.test(value) ? 'Please enter a valid phone number.' : '',
  password: (value) => !value ? '' : !VALIDATION_PATTERNS.PASSWORD.test(value) ? 
    'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.' : '',
  minLength: (min) => (value) => !value ? '' : value.length < min ? `Must be at least ${min} characters.` : '',
  maxLength: (max) => (value) => !value ? '' : value.length > max ? `Must be less than ${max} characters.` : '',
  number: (value) => !value ? '' : isNaN(value) || Number(value) < 0 ? 'Must be a positive number.' : '',
  percentage: (value) => !value ? '' : isNaN(value) || Number(value) < 0 || Number(value) > 100 ? 'Must be between 0-100.' : '',
}; 