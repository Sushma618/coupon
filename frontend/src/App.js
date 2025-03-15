import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [coupon, setCoupon] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const claimCoupon = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage('');
      
      const response = await axios.get(`${API_URL}/api/get-coupon`, {
        withCredentials: true
      });

      if (response.data.success) {
        setCoupon(response.data.coupon);
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while claiming the coupon.');
      setCoupon(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎟️ Coupon Distribution System</h1>
        <p className="subtitle">Claim your exclusive coupon below!</p>
      </header>

      <main className="main-content">
        <div className="coupon-container">
          {coupon ? (
            <div className="coupon-card">
              <h2>Your Coupon Code:</h2>
              <div className="coupon-code">{coupon}</div>
              <p className="success-message">{message}</p>
            </div>
          ) : (
            <div className="claim-section">
              <button 
                onClick={claimCoupon} 
                disabled={isLoading}
                className="claim-button"
              >
                {isLoading ? 'Claiming...' : 'Claim Your Coupon'}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>One coupon per user. Please wait 1 hour between claims.</p>
      </footer>
    </div>
  );
}

export default App;

