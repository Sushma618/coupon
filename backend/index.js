const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const coupons = ["COUPON1", "COUPON2", "COUPON3"]; // List of available coupons
let couponIndex = 0;
const userClaims = {}; // To track IP addresses

// Function to distribute coupons sequentially
function getNextCoupon() {
    const coupon = coupons[couponIndex];
    couponIndex = (couponIndex + 1) % coupons.length;
    return coupon;
}

// API to get coupon
app.get('/get-coupon', (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    // ✅ IP Tracking (Restrict within 1 hour)
    if (userClaims[ip] && now - userClaims[ip] < 3600000) {
        const remainingTime = Math.ceil((3600000 - (now - userClaims[ip])) / 1000);
        return res.status(429).json({ 
            success: false, 
            message: `Try again after ${remainingTime} seconds` 
        });
    }

    // ✅ Update IP claim time
    userClaims[ip] = now;

    // ✅ Cookie Tracking (Restrict within 1 hour)
    if (req.cookies.lastClaimTime) {
        const lastClaimTime = parseInt(req.cookies.lastClaimTime);
        if (now - lastClaimTime < 3600000) {
            const remainingTime = Math.ceil((3600000 - (now - lastClaimTime)) / 1000);
            return res.status(429).json({ 
                success: false, 
                message: `Try again after ${remainingTime} seconds` 
            });
        }
    }

    res.cookie('lastClaimTime', now.toString(), { maxAge: 3600000 });

    const coupon = getNextCoupon();
    res.json({ success: true, coupon });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
