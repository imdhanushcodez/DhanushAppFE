// Form validation helpers according to US-01, US-16, US-18

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateMobile = (mobile) => {
  // 10-digit mobile number requirement
  const re = /^\d{10}$/;
  return re.test(String(mobile).trim());
};

export const validatePassword = (password) => {
  // Minimum 8 characters with at least one letter and one number
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain at least one letter and one number.' };
  }
  return { valid: true, message: '' };
};

