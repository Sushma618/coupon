import React, { useState } from 'react';
import axios from 'axios';
import Coupon from './components/Coupon';

function App() {
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState(null);

  const getCoupon = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-coupon'); // ✅ Connect to backend
      
      setCoupon(response.data.coupon);
      setError(null);
    } catch (err) {
      setCoupon(null);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Round Robin Coupon Distribution</h1>
      <button onClick={getCoupon} style={styles.button}>Get Coupon</button>
      {coupon && <Coupon code={coupon} />}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    marginTop: '50px',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    margin: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    color: 'red',
  },
};

export default App;
