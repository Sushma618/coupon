# Round-Robin Coupon Distribution System

A web application that distributes coupons to guest users in a round-robin manner with built-in abuse prevention mechanisms.

## Features

- Sequential coupon distribution
- Guest access without login requirements
- Abuse prevention through:
  - IP address tracking
  - Cookie-based tracking
  - Rate limiting
- Clear user feedback
- Responsive modern UI
- Cross-browser compatibility

## Tech Stack

- Frontend:
  - React.js
  - Axios for API calls
  - Modern CSS with Flexbox
- Backend:
  - Node.js
  - Express.js
  - Cookie-parser for cookie management
  - Express-rate-limit for API rate limiting

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Abuse Prevention Strategies

### 1. IP Address Tracking
- Each user's IP address is recorded when claiming a coupon
- Users are restricted from claiming another coupon for 1 hour from the same IP
- IP records are automatically cleaned up to prevent memory leaks

### 2. Cookie-Based Tracking
- HTTP-only cookies are used to track claims from the same browser
- Cookies are set with strict security options
- Same-site policy is enforced to prevent CSRF attacks

### 3. Rate Limiting
- Global rate limiting is implemented to prevent DDoS attacks
- Limits are set to 100 requests per 15 minutes per IP
- Custom error messages inform users about remaining wait time

## Deployment

### Backend Deployment
1. Set appropriate environment variables:
   - `PORT`: The port number for the server
   - `NODE_ENV`: Set to 'production'
   - `FRONTEND_URL`: The URL of your frontend application

2. Build and start:
   ```bash
   npm install
   npm start
   ```

### Frontend Deployment
1. Set the production API URL in `.env`:
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```

3. Deploy the contents of the `build` directory to your web server

## Security Considerations

- All cookies are set with HTTP-only flag
- CORS is properly configured
- Rate limiting prevents brute force attempts
- Input validation on all endpoints
- Secure cookie attributes in production
- No sensitive data exposure

## License

MIT License - feel free to use this project for any purpose.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 