import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Component for the coupon display
const CouponDisplay = ({ coupon, message }) => (
  <div className="coupon-card">
    <h2>Your Exclusive Coupon Code</h2>
    <div className="coupon-code">{coupon}</div>
    <p className="success-message">{message}</p>
  </div>
);

// Component for the claim button
const ClaimButton = ({ onClick, isLoading }) => (
  <div className="claim-section">
    <button 
      onClick={onClick} 
      disabled={isLoading}
      className="claim-button"
    >
      {isLoading ? (
        <span>Claiming<span className="loading-dots"></span></span>
      ) : (
        'Claim Your Coupon'
      )}
    </button>
  </div>
);

function App() {
  const [coupon, setCoupon] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const claimCoupon = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage('');
      
      const response = await axios.get(`${API_URL}/api/get-coupon`, {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success) {
        setCoupon(response.data.coupon);
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(
        err.code === 'ECONNABORTED' 
          ? 'Request timed out. Please try again.' 
          : err.response?.data?.message || 'An error occurred while claiming the coupon.'
      );
      setCoupon(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎟️ Premium Coupon Hub</h1>
        <p className="subtitle">Unlock Exclusive Savings Today!</p>
      </header>

      <main className="main-content">
        <div className="coupon-container">
          {coupon ? (
            <CouponDisplay coupon={coupon} message={message} />
          ) : (
            <ClaimButton onClick={claimCoupon} isLoading={isLoading} />
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Limited to one coupon per user every hour. Terms and conditions apply.</p>
      </footer>
    </div>
  );
}

export default App;

