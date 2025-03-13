const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

const coupons = ["COUPON1", "COUPON2", "COUPON3"];
let couponIndex = 0;
const userClaims = {};

function getNextCoupon() {
    const coupon = coupons[couponIndex];
    couponIndex = (couponIndex + 1) % coupons.length;
    return coupon;
}

app.get('/get-coupon', (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    if (userClaims[ip] && now - userClaims[ip] < 3600000) {
        const remainingTime = Math.ceil((3600000 - (now - userClaims[ip])) / 1000);
        return res.status(429).json({ 
            success: false, 
            message: `Try again after ${remainingTime} seconds` 
        });
    }

    userClaims[ip] = now;

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

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});

module.exports = app;
