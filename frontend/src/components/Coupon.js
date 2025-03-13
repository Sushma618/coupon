import React from 'react';

function Coupon({ code }) {
  return (
    <div style={styles.couponBox}>
      <h2>Coupon: {code}</h2>
    </div>
  );
}

const styles = {
  couponBox: {
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    margin: '10px',
    borderRadius: '5px',
  },
};

export default Coupon;
