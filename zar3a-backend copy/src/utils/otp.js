import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP (e.g., "123456")
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash the OTP for secure storage
 * @param {string} otp - Plain OTP
 * @returns {Promise<string>} Hashed OTP
 */
export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hashed version
 * @param {string} otp - Plain OTP from user input
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>} True if OTP matches
 */
export const verifyOTP = async (otp, hashedOTP) => {
  return bcrypt.compare(otp, hashedOTP);
};

/**
 * Generate a secure verification token for post-OTP verification state
 * @returns {string} 32-byte hex token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Check if OTP record has expired
 * @param {Date} expiresAt - Expiration date from database
 * @returns {boolean} True if expired
 */
export const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};
