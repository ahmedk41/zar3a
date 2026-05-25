import { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

/**
 * ForgotPasswordRequest Component
 * Step 1: User enters email to request OTP
 */
const ForgotPasswordRequest = ({ onOTPRequested, onCancel }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password/request-otp`,
        { email: email.trim().toLowerCase() }
      );

      setMessage(response.data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>🔐 Reset Password</h2>
          <p>Enter your email address to receive a verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
                setMessage('');
              }}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="submit-btn"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>

          {sent && (
            <button
              type="button"
              onClick={() => onOTPRequested(email)}
              className="submit-btn"
              style={{ marginTop: '12px', background: '#10b981' }}
            >
              Continue to Enter OTP
            </button>
          )}
        </form>

        <button onClick={onCancel} className="back-btn">
          ← Back to Login
        </button>

        <div className="info-box">
          <p>💡 <strong>Tip:</strong> Make sure to check your spam folder if you don't see the email in a few seconds.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordRequest;
