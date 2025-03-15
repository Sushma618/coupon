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
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each IP to 1000 requests per hour
    message: 'Too many requests from this IP, please try again later.',
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
    }
});

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('Allowed origin:', frontendUrl); // Debug log

app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: true
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
        // Get the real IP address from various headers
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.headers['x-real-ip'] || 
                  req.connection.remoteAddress;
                  
        console.log('Client IP:', ip); // Debug log
        
        const lastClaimTime = req.cookies.lastClaimTime;
        const claimCheck = canUserClaimCoupon(ip, lastClaimTime);

        if (!claimCheck.canClaim) {
            return res.status(429).json({
                success: false,
                message: `You've already claimed a coupon. Please wait ${Math.ceil(claimCheck.remainingTime/60)} minutes and ${claimCheck.remainingTime % 60} seconds before claiming another coupon.`
            });
        }

        // Update tracking information
        const now = Date.now();
        userClaims.set(ip, now);
        
        // Set cookie specific to this IP
        res.cookie('lastClaimTime', now.toString(), {
            maxAge: 3600000,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
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
