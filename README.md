Crypto-Wealth-Platform-V2 - Premium Crypto Investment Platform










Crypto-Wealth-Platform-V2 is a high-performance, hyper-polished crypto investment ecosystem designed for the modern investor. Built on a robust MERN Stack architecture, it features a glassmorphism UI, real-time market data, advanced admin controls, and secure multi-currency transaction handling.

🌟 Key Features
💎 User Experience (Frontend)
Glassmorphism Dashboard: A stunning, translucent UI with dynamic gradients and smooth animations powered by Framer Motion.
Real-time Market Data: Live crypto tickers and interactive charts visualized with Recharts.
Localization Support: Interface adapted for broader accessibility.
Secure Transactions: OTP-verified withdrawals and QR-based crypto deposits.
Investment Portfolio: Detailed tracking of active plans, daily ROI accruals, and profit history.
Support System: Integrated support ticket system for user assistance.
🛡️ Security & Authentication
Two-Factor Authentication (2FA): Mandatory Email OTP for critical actions (Withdrawals, Password Changes).
Role-Based Access Control (RBAC): Strict separation between User and Admin portals.
Robust Validation: Server-side validation and sanitization for all inputs.
JWT Authentication: Secure stateless authentication with Access and Refresh tokens.
⚙️ Advanced Admin Panel
Dedicated Admin Portal: Separate login route for administrators.
User Management: Granular control over user accounts, balances, and verification status.
Financial Oversight: Approve/Reject deposits and withdrawals with proof validation.
System Configuration: Manage investment plans, tickets, and platform variables dynamically.
Wallet Management: Manage admin treasury wallets for deposits.
🛠️ Technology Stack
Frontend (Client)
Framework: React 18 + Vite
Styling: Tailwind CSS, Framer Motion
State Management: Context API (Auth, Market, Settings, Socket)
Routing: React Router DOM v6
Visualization: Recharts
HTTP Client: Axios with Interceptors
Real-time: Socket.io-client
Backend (Server)
Runtime: Node.js
Framework: Express.js
Database: MongoDB Atlas (Mongoose ODM)
Real-time: Socket.io
Authentication: JWT, BCrypt
Services: Cloudinary (Image Uploads), Brevo/Nodemailer (Email Service), Node-Cron (Scheduled Tasks)
📂 Project Structure
Crypto-Wealth-Platform-V2/
├── client/                 # React Application
│   ├── src/
│   │   ├── components/     # UI Components (Layout, UI, Forms)
│   │   ├── content/        # Static Content & Assets
│   │   ├── context/        # Global State Providers
│   │   ├── hooks/          # Custom Hooks
│   │   ├── pages/          # Application Views
│   │   │   ├── admin/      # Admin Dashboard Views
│   │   │   ├── auth/       # Authentication Pages
│   │   │   └── dashboard/  # User Dashboard Views
│   │   └── services/       # API Services (Auth, User, etc.)
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express API
│   ├── config/             # Database, JWT, Email Config
│   ├── modules/            # Domain-Driven Modules
│   │   ├── admin/          # Admin Logic
│   │   ├── auth/           # Authentication Routes
│   │   ├── deposit/        # Deposit Handling
│   │   ├── profit/         # ROI Calculation Engine
│   │   ├── user/           # User Management
│   │   ├── wallet/         # Wallet Logic
│   │   └── withdrawal/     # Payout Processing
│   ├── app.js              # Server Entry Point
│   └── package.json
│
├── README.md               # Project Documentation
└── DEPLOYMENT.md           # Deployment Guide
📝 Configuration (.env)

You must configure environment variables for both the server and client. Create a .env file in the respective directories.

1. Server (/server/.env)
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name

# Authentication (JWT)
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Email Service (Brevo/Nodemailer)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM="Crypto Support" <support@yourdomain.com>

# Cloudinary (Image Uploads)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
2. Client (/client/.env)
# API URL must point to your running server
VITE_API_URL=http://localhost:3000/api
🚀 Getting Started
Prerequisites
Node.js (v18 or higher)
MongoDB Atlas Account
Cloudinary Account
SMTP Service (e.g., Brevo)
1. Backend Setup
cd server
npm install

# Setup your .env file as shown above
# Start the server
npm run dev
2. Frontend Setup
cd client
npm install

# Setup your .env file as shown above
# Start the server
npm run dev

Navigate to:

http://localhost:5173

to view the application.

📚 Documentation
Usage Features
Technical Implementation
API Documentation
❓ Troubleshooting
❌ Database Connection Failed
Check if your IP is whitelisted in MongoDB Atlas.
Verify MONGO_URI in server/.env.
❌ Images not uploading
Verify Cloudinary credentials in server/.env.
Ensure the image file size is under the limit (defaults to 5MB).
❌ CORS Error in Client
Ensure CLIENT_URL in server/.env exactly matches your frontend URL.
If running locally, it's usually:
http://localhost:5173
🤝 Contributing
Fork the repository
Create your feature branch:
git checkout -b feature/AmazingFeature
Commit your changes:
git commit -m "Add some AmazingFeature"
Push to the branch:
git push origin feature/AmazingFeature
Open a Pull Request
🔗 Repository

GitHub: Crypto-Wealth-Platform-V2

Built with ❤️ by Shashank Singh.
