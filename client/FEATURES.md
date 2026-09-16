# KUCH V - Feature Documentation

## 🚀 User Features (Client)

### 🔐 Authentication & Security
- **Secure Login/Registration**: Email-based signup with robust validation.
- **Two-Factor Authentication (2FA)**: OTP verification via email for critical actions.
- **Password Recovery**: Secure forgot/reset password flow with OTP.
- **Session Management**: Automatic token refresh mechanism using HttpOnly cookies.

### 📊 User Dashboard
- **Overview**: Real-time summary of total balance, active plans, and recent transactions.
- **Portfolio**: Detailed view of investment performance and daily accruals.
- **Market Data**: Live crypto tickers and price charts.
- **Profile Management**: Update personal details and password.

### 💰 Financial Operations
- **Deposits**: 
    - Support for multiple cryptocurrencies (BTC, USDT, etc.).
    - QR code generation for admin wallets.
    - Transaction proof upload (screenshot).
- **Withdrawals**:
    - Secure withdrawal requests to external wallets.
    - OTP verification for all outgoing funds.
    - Status tracking (Pending, Approved, Rejected).

### 📈 Investment System
- **Investment Plans**: Browse and purchase various investment tiers.
- **ROI Calculation**: Automated daily profit crediting.
- **History**: Complete record of all purchased plans and their status.

### 🎧 Support
- **Ticket System**: Create and track support tickets for issues.

---

## 🛡️ Admin Features (Back Office)

### 👥 User Management
- **User List**: View all registered users with search and filter.
- **User Details**: Inspect specific user profiles, balances, and activity.
- **Action Control**: Freeze/Unfreeze accounts, manually adjust balances.
- **Admin Management**: Create and manage other admin accounts.

### 💸 Finance Management
- **Deposit Approvals**: Review user deposit proofs and approve/reject with one click.
- **Withdrawal Processing**: Process payout requests and mark as completed.
- **Treasury Wallets**: Manage the platform's receiving wallet addresses.

### ⚙️ System Configuration
- **Investment Plans**: Create, edit, or delete investment plans (ROI %, duration).
- **Platform Settings**: Toggle maintenance mode, update platform name.
- **Support Tickets**: Respond to and close user support tickets.
