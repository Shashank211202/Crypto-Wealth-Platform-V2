# KUCH V - API Documentation

The backend exposes a RESTful API powered by Express.js. All responses generally follow a standard JSON structure.

## Base URL
Defaults to `http://localhost:3000/api` in development.

## Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } // Optional payload
}
```

---

## 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/signup` | Register a new user account | ❌ |
| `POST` | `/login` | Authenticate user and get tokens | ❌ |
| `POST` | `/logout` | Clear session cookies | ❌ |
| `POST` | `/refresh` | Refresh access token using cookie | ❌ |
| `POST` | `/forgot-password` | Request password reset OTP | ❌ |
| `POST` | `/verify-otp` | Verify email OTP | ❌ |
| `GET` | `/profile` | Get current user details | ✅ |

---

## 👥 Users (`/api/users`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `PUT` | `/profile` | Update user profile info | ✅ |
| `PUT` | `/password` | Change account password | ✅ |
| `GET` | `/kyc/status` | Check KYC verification status | ✅ |

---

## 💰 Deposits (`/api/deposits`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/` | Submit a new deposit request | ✅ |
| `GET` | `/my-deposits` | View deposit history | ✅ |
| `GET` | `/options` | Get available admin wallets for deposit | ✅ |

---

## 💸 Withdrawals (`/api/withdrawals`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/request` | Request an OTP for withdrawal | ✅ |
| `POST` | `/` | Submit withdrawal request (requires OTP) | ✅ |
| `GET` | `/my-withdrawals` | View withdrawal history | ✅ |

---

## 📈 Investments (`/api/investments`)

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/plans` | List available investment plans | ✅ |
| `POST` | `/purchase` | Purchase a plan | ✅ |
| `GET` | `/my-investments` | Get active/history of investments | ✅ |

---

## 🛡️ Admin (`/api/admin`) - **Restricted**

> **Note**: All endpoints here require `role: "ADMIN"`.

| Prefix | Description |
| :--- | :--- |
| `/users` | Manage user accounts (Freeze, Update Balance) |
| `/deposits` | Approve/Reject user deposits |
| `/withdrawals` | Process withdrawal requests |
| `/plans` | CRUD operations for Investment Plans |
| `/tickets` | Manage support tickets |
| `/wallets` | Manage system treasury wallets |
| `/settings` | Configure global platform settings |

---

## 🔄 Real-time Events (Socket.io)

The server emits real-time events to connected clients.

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `notification` | `{ title, message, type }` | General user status updates |
| `deposit_update` | `{ status, amount }` | When a deposit is approved/rejected |
| `withdrawal_update` | `{ status, amount }` | When a withdrawal is processed |
