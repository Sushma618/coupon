const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

// Available coupons (in production, this should be in a database)
const coupons = [
    "SAVE20OFF", "SPECIAL30", "DISCOUNT25", 
    "FREESHIP", "WELCOME15", "BONUS10",
    "EXTRA5OFF", "VIP40OFF", "NEWUSER20",
    "FLASH15OFF"
];

let couponIndex = 0;
const userClaims = new Map(); // Using Map for better memory management

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Utility function to get the next available coupon
function getNextCoupon() {
    const coupon = coupons[couponIndex];
    couponIndex = (couponIndex + 1) % coupons.length;
    return coupon;
}

// Utility function to check if user can claim a coupon
function canUserClaimCoupon(ip, lastClaimTime) {
    const now = Date.now();
    const hourInMs = 3600000;

    // Check IP-based restriction
    if (userClaims.has(ip)) {
        const lastIpClaimTime = userClaims.get(ip);
        if (now - lastIpClaimTime < hourInMs) {
            return {
                canClaim: false,
                remainingTime: Math.ceil((hourInMs - (now - lastIpClaimTime)) / 1000)
            };
        }
    }

    // Check cookie-based restriction
    if (lastClaimTime) {
        const cookieClaimTime = parseInt(lastClaimTime);
        if (now - cookieClaimTime < hourInMs) {
            return {
                canClaim: false,
                remainingTime: Math.ceil((hourInMs - (now - cookieClaimTime)) / 1000)
            };
        }
    }

    return { canClaim: true };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Coupon claim endpoint
app.get('/api/get-coupon', (req, res) => {
    try {
        const ip = req.ip;
        const lastClaimTime = req.cookies.lastClaimTime;
        const claimCheck = canUserClaimCoupon(ip, lastClaimTime);

        if (!claimCheck.canClaim) {
            return res.status(429).json({
                success: false,
                message: `Please wait ${claimCheck.remainingTime} seconds before claiming another coupon.`
            });
        }

        // Update tracking information
        const now = Date.now();
        userClaims.set(ip, now);
        res.cookie('lastClaimTime', now.toString(), {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        const coupon = getNextCoupon();
        res.json({
            success: true,
            coupon,
            message: 'Coupon claimed successfully!'
        });

    } catch (error) {
        console.error('Error in coupon claim:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.'
        });
    }
});

// Cleanup old entries periodically (every hour)
setInterval(() => {
    const hourAgo = Date.now() - 3600000;
    for (const [ip, timestamp] of userClaims.entries()) {
        if (timestamp < hourAgo) {
            userClaims.delete(ip);
        }
    }
}, 3600000);

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
