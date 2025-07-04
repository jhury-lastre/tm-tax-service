/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (US format)
 */
const PHONE_REGEX = /^[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/;

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

/**
 * Validate required field
 */
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Validate numeric values
 */
export const isNumeric = (value: string | number): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  return !isNaN(Number(value));
};

/**
 * Validate positive numbers
 */
export const isPositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? Number(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validate currency amount
 */
export const isValidCurrency = (value: string | number): boolean => {
  const num = typeof value === 'string' ? Number(value.replace(/[$,]/g, '')) : value;
  return !isNaN(num) && num >= 0;
};

/**
 * Validate year
 */
export const isValidYear = (year: string | number): boolean => {
  const num = typeof year === 'string' ? Number(year) : year;
  const currentYear = new Date().getFullYear();
  return !isNaN(num) && num >= 1900 && num <= currentYear + 10;
};

/**
 * Validation error messages
 */
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  numeric: 'Please enter a valid number',
  positiveNumber: 'Please enter a positive number',
  currency: 'Please enter a valid currency amount',
  year: 'Please enter a valid year',
} as const;

/**
 * Form field validator
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'numeric' | 'positiveNumber' | 'currency' | 'year';
  message?: string;
  value?: number;
}

export const validateField = (value: string | number | null | undefined, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    let isValid = true;
    let message = rule.message;

    switch (rule.type) {
      case 'required':
        isValid = isRequired(value);
        message = message || ValidationMessages.required;
        break;
      case 'email':
        isValid = !value || isValidEmail(String(value));
        message = message || ValidationMessages.email;
        break;
      case 'phone':
        isValid = !value || isValidPhone(String(value));
        message = message || ValidationMessages.phone;
        break;
      case 'minLength':
        isValid = !value || hasMinLength(String(value), rule.value || 0);
        message = message || ValidationMessages.minLength(rule.value || 0);
        break;
      case 'maxLength':
        isValid = !value || hasMaxLength(String(value), rule.value || 100);
        message = message || ValidationMessages.maxLength(rule.value || 100);
        break;
      case 'numeric':
        isValid = !value || isNumeric(value);
        message = message || ValidationMessages.numeric;
        break;
      case 'positiveNumber':
        isValid = !value || isPositiveNumber(value);
        message = message || ValidationMessages.positiveNumber;
        break;
      case 'currency':
        isValid = !value || isValidCurrency(value);
        message = message || ValidationMessages.currency;
        break;
      case 'year':
        isValid = !value || isValidYear(value);
        message = message || ValidationMessages.year;
        break;
    }

    if (!isValid) {
      return message;
    }
  }

  return null;
}; 