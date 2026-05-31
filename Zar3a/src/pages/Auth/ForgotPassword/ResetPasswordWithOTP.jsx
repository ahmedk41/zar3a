import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

/**
 * ResetPasswordWithOTP Component
 * Step 3: User enters new password
 */
const ResetPasswordWithOTP = ({ verificationToken, email, onSuccess }) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[!@#$%^&*]/.test(pwd)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordStrength(calculateStrength(pwd));
  };

  const getStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[passwordStrength] || 'Very Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 2) {
      setError('Password is too weak. Include uppercase, lowercase, and numbers.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password/reset-password`,
        {
          verificationToken,
          newPassword,
          confirmPassword,
        }
      );

      // Success! Show message and redirect
      alert('✅ Password reset successfully! You can now login with your new password.');
      onSuccess?.();
      navigate('/login');
    } catch (err) {
      
      let msg = err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. Please try again.';
      if (typeof msg === 'object' && msg !== null) msg = msg.message || 'Failed to reset password. Please try again.';
      setError(msg);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>🔑 Create New Password</h2>
          <p>Enter a strong password for your Zar3a account</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`strength-bar ${i < passwordStrength ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <span className={`strength-label strength-${passwordStrength}`}>
                  {getStrengthLabel()}
                </span>
              </div>
            )}

            <small className="password-requirements">
              ✓ Minimum 8 characters
              <br />
              ✓ Mix of uppercase and lowercase letters
              <br />
              ✓ Include numbers and special characters for better security
            </small>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <small style={{ color: '#dc2626' }}>Passwords do not match</small>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <small style={{ color: '#10b981' }}>✓ Passwords match</small>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="submit-btn"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="security-notice">
          <p>🔒 <strong>Security:</strong> Your password is encrypted and never shared. After resetting, you'll need to login again with your new password.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithOTP;
