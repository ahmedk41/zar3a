import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordRequest from './ForgotPasswordRequest';
import OTPVerification from './OTPVerification';
import ResetPasswordWithOTP from './ResetPasswordWithOTP';
import './ForgotPassword.css';

/**
 * ForgotPassword Component
 * Coordinates the three-step OTP-based password reset flow:
 * 1. Request OTP (email entry)
 * 2. Verify OTP (6-digit code entry)
 * 3. Reset Password (new password entry)
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'reset'
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const handleOTPRequested = (userEmail) => {
    setEmail(userEmail);
    setStep('verify');
  };

  const handleOTPVerified = (token) => {
    setVerificationToken(token);
    setStep('reset');
  };

  const handleResetSuccess = () => {
    // Redirect to login is handled in ResetPasswordWithOTP component
    // This callback can be used for additional logic if needed
  };

  const handleBack = () => {
    setStep('request');
    setEmail('');
    setVerificationToken('');
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-page">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className={`step ${step === 'request' ? 'active' : step !== 'request' ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Email</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step === 'verify' ? 'active' : step === 'reset' ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">OTP</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step === 'reset' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Password</span>
        </div>
      </div>

      {/* Step Components */}
      {step === 'request' && (
        <ForgotPasswordRequest onOTPRequested={handleOTPRequested} onCancel={handleCancel} />
      )}

      {step === 'verify' && (
        <OTPVerification email={email} onOTPVerified={handleOTPVerified} onBack={handleBack} />
      )}

      {step === 'reset' && (
        <ResetPasswordWithOTP
          verificationToken={verificationToken}
          email={email}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
