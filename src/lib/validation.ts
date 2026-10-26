/**
 * Email validation utility for GapFinder AI.
 * Ensures all email inputs have a valid user, domain, and top-level domain suffix (.com, .org, .edu, etc.)
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = (email || '').trim();

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Please enter your email address.',
    };
  }

  // Requires username, @, domain, and a TLD of at least 2 characters
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: 'Please enter a valid email address, for example, name@gmail.com.',
    };
  }

  const parts = sanitized.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      sanitized,
      error: 'Please enter a valid email address, for example, name@gmail.com.',
    };
  }

  const domain = parts[1];
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (domainParts.length < 2 || !tld || tld.length < 2) {
    return {
      isValid: false,
      sanitized,
      error: 'Please enter a valid email address, for example, name@gmail.com.',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}
