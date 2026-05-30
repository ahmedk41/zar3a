import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

/**
 * OTPVerification Component
 * Step 2: User enters 6-digit OTP
 */
const OTPVerification = ({ email, onOTPVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password/verify-otp`,
        { email, otp: otpValue }
      );

      // OTP verified successfully, move to next step
      onOTPVerified(response.data.verificationToken);
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(message);
      
      // Extract attempts left if available
      if (message.includes('attempts')) {
        const match = message.match(/(\d+) attempts/);
        if (match) setAttemptsLeft(parseInt(match[1]));
      }

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;
  const isLocked = attemptsLeft <= 0;

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>📱 Enter Verification Code</h2>
          <p>We sent a 6-digit code to {email}</p>
        </div>

        {/* Timer */}
        <div className={`otp-timer ${isExpired ? 'expired' : timeLeft < 60 ? 'warning' : ''}`}>
          ⏱️ Expires in: {formatTime(timeLeft)}
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || isExpired || isLocked}
                className="otp-input"
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          {isExpired && (
            <div className="warning-message">
              ⏰ Code has expired. Please request a new one.
            </div>
          )}

          {isLocked && (
            <div className="error-message">
              🔒 Too many failed attempts. Please request a new code.
            </div>
          )}

          {attemptsLeft > 0 && !isLocked && (
            <p className="attempts-left">
              {attemptsLeft === 1
                ? '⚠️ Last attempt remaining'
                : `${attemptsLeft} attempts remaining`}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || isExpired || isLocked}
            className="submit-btn"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="otp-footer">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="resend-btn"
          >
            Request New Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
