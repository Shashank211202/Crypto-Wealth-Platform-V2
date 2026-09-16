# KUCH V - In-Depth Technical Implementation Guide

## Table of Contents
- [Authentication Flow Deep Dive](#authentication-flow-deep-dive)
- [Deposit System Implementation](#deposit-system-implementation)
- [Withdrawal System Implementation](#withdrawal-system-implementation)
- [State Management Patterns](#state-management-patterns)
- [Real-time WebSocket Implementation](#real-time-websocket-implementation)
- [Component Patterns](#component-patterns)
- [API Integration Guide](#api-integration-guide)
- [Error Handling Strategy](#error-handling-strategy)

---

## Authentication Flow Deep Dive

### **Registration Process - Step by Step**

#### 1. User Fills Registration Form

```javascript
// src/pages/auth/Register.jsx
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  referralCode: ''
});

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }
  
  if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    toast.error('Invalid email format');
    return;
  }
  
  // API call
  try {
    const response = await authService.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      referralCode: formData.referralCode || undefined
    });
    
    // Response: { message: 'OTP sent to email', email: user.email }
    navigate('/auth/verify-otp', { state: { email: formData.email } });
    toast.success('Please check your email for OTP');
  } catch (error) {
    toast.error(error);
  }
};
```

#### 2. Backend Processes Registration

**API Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "referralCode": "REF123"
}
```

**Backend Flow:**
1. Validate input data
2. Check if email already exists
3. Hash password using bcrypt
4. Generate 6-digit OTP
5. Save OTP in database with expiry (10 minutes)
6. Send OTP via email service
7. Return success response

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "john@example.com"
}
```

#### 3. User Enters OTP

```javascript
// OTP Verification Component
const [otp, setOtp] = useState(['', '', '', '', '', '']);

const handleVerify = async () => {
  const otpString = otp.join('');
  
  if (otpString.length !== 6) {
    toast.error('Please enter all 6 digits');
    return;
  }
  
  try {
    const response = await authService.verifyOtp(email, otpString);
    
    // Auto-login after verification
    // Response includes: { accessToken, user }
    navigate('/dashboard');
    toast.success('Account verified successfully!');
  } catch (error) {
    toast.error(error);
    setOtp(['', '', '', '', '', '']); // Reset OTP
  }
};
```

**API Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Backend Flow:**
1. Find user by email
2. Check if OTP matches and not expired
3. Mark user as verified
4. Generate JWT access token and refresh token
5. Return tokens and user data

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "isVerified": true
  }
}
```

#### 4. Client Stores Auth Data

```javascript
// src/services/auth.service.js
async verifyOtp(email, otp) {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    let { accessToken, user } = response.data;
    
    if (accessToken) {
      // Store token in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Emit login event (other components can listen)
      authEvents.emit('login', user);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Verification failed';
  }
}
```

#### 5. AuthContext Updates

```javascript
// src/context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Subscribe to auth events
    const unsubscribeLogin = authEvents.on('login', (u) => {
      setUser(u);
      // User is now logged in globally
    });
    
    const unsubscribeLogout = authEvents.on('logout', () => {
      setUser(null);
      // User is logged out globally
    });
    
    return () => {
      unsubscribeLogin();
      unsubscribeLogout();
    };
  }, []);
  
  // ... rest of context
};
```

### **Login Process**

#### Complete Login Flow with OTP

```javascript
// Step 1: Initial Login Attempt
const handleLogin = async (email, password) => {
  try {
    const user = await authService.login(email, password);
    navigate('/dashboard');
  } catch (error) {
    // Check if OTP is required
    if (error.requiresOtp) {
      setShowOtpModal(true);
      setEmail(email);
    } else {
      toast.error(error.message);
    }
  }
};

// Step 2: If OTP Required
const handleOtpVerification = async (otp) => {
  try {
    const response = await authService.verifyLoginOtp(email, otp);
    // Now logged in
    navigate('/dashboard');
  } catch (error) {
    toast.error(error);
  }
};
```

**Login API Flow:**

```javascript
// src/services/auth.service.js
async login(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password });
    let { accessToken, user } = response.data;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      
      // Fetch complete profile
      try {
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data?.user) {
          user = { ...user, ...profileRes.data.user };
        }
      } catch (e) {
        console.warn('Failed to fetch profile after login', e);
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      authEvents.emit('login', user);
    }
    
    return user;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data; // Contains: { message, requiresOtp, email }
    }
    throw { message: 'Login failed' };
  }
}
```

### **Token Refresh Mechanism**

```javascript
// src/services/api.js - Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call refresh endpoint with httpOnly refresh token cookie
        const response = await axios.post(
          `${API_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const { accessToken } = response.data;
        
        if (accessToken) {
          // Update token
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        authEvents.emit('logout');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Deposit System Implementation

### **Multi-Step Deposit Flow**

The deposit system is a **4-step wizard** with file upload capabilities.

#### **Step 1: Select Network**

```javascript
// src/pages/dashboard/Deposit.jsx
const [currentStep, setCurrentStep] = useState(1);
const [selectedNetwork, setSelectedNetwork] = useState(null);
const [depositOptions, setDepositOptions] = useState([]);

useEffect(() => {
  fetchDepositOptions();
}, []);

const fetchDepositOptions = async () => {
  try {
    const options = await depositService.getDepositOptions();
    // options = [{ asset: 'BTC', network: 'Bitcoin', address: '...', qrCode: '...' }, ...]
    setDepositOptions(options);
  } catch (error) {
    toast.error('Failed to load deposit options');
  }
};

const handleNetworkSelect = (network) => {
  setSelectedNetwork(network);
  setCurrentStep(2);
};
```

**Deposit Options Display:**

```javascript
{depositOptions.map((option) => (
  <Card 
    key={option._id}
    onClick={() => handleNetworkSelect(option)}
    className="cursor-pointer hover:border-blue-500"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold">{option.asset}</h3>
        <p className="text-sm text-gray-400">{option.network}</p>
      </div>
      <ArrowRight />
    </div>
  </Card>
))}
```

#### **Step 2: Enter Amount**

```javascript
const [amount, setAmount] = useState('');
const [cryptoEquivalent, setCryptoEquivalent] = useState(0);

const calculateCryptoAmount = async (usdAmount) => {
  if (!usdAmount || !selectedNetwork) return;
  
  try {
    // Fetch current crypto price
    const price = await getCryptoPrice(selectedNetwork.asset);
    const cryptoAmount = parseFloat(usdAmount) / price;
    setCryptoEquivalent(cryptoAmount.toFixed(8));
  } catch (error) {
    console.error('Price fetch failed', error);
  }
};

useEffect(() => {
  calculateCryptoAmount(amount);
}, [amount, selectedNetwork]);
```

```javascript
<div className="space-y-4">
  <div>
    <label>Deposit Amount (USD)</label>
    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Enter amount in USD"
      min="10"
      className="w-full px-4 py-3 rounded bg-gray-800"
    />
  </div>
  
  <div className="bg-blue-900/20 p-4 rounded">
    <p className="text-sm text-gray-400">You will send approximately</p>
    <p className="text-2xl font-bold text-blue-400">
      {cryptoEquivalent} {selectedNetwork.asset}
    </p>
  </div>
  
  <Button onClick={() => setCurrentStep(3)}>
    Continue
  </Button>
</div>
```

#### **Step 3: Upload Proof**

```javascript
const [proofFile, setProofFile] = useState(null);
const [proofPreview, setProofPreview] = useState(null);
const fileInputRef = useRef(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.error('Please upload a valid image (JPG, PNG, WEBP)');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size must be less than 5MB');
    return;
  }
  
  setProofFile(file);
  
  // Generate preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setProofPreview(reader.result);
  };
  reader.readAsDataURL(file);
};

const handleReupload = () => {
  setProofFile(null);
  setProofPreview(null);
  fileInputRef.current.value = '';
};
```

**UI for Upload:**

```javascript
<div className="space-y-4">
  {/* Display wallet address and QR code */}
  <div className="bg-gray-800 p-6 rounded-lg">
    <h3 className="font-bold mb-4">Send {selectedNetwork.asset} to this address:</h3>
    
    {/* QR Code */}
    <div className="flex justify-center mb-4">
      <img 
        src={selectedNetwork.qrCode} 
        alt="QR Code" 
        className="w-48 h-48 border-4 border-white rounded"
      />
    </div>
    
    {/* Address with copy button */}
    <div className="flex items-center gap-2 bg-gray-900 p-3 rounded">
      <code className="flex-1 text-sm break-all">
        {selectedNetwork.address}
      </code>
      <button onClick={handleCopyAddress}>
        <Copy size={20} />
      </button>
    </div>
  </div>
  
  {/* File upload */}
  <div>
    <label className="block mb-2">Upload Transaction Proof</label>
    
    {!proofFile ? (
      <label className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
        <Upload className="mx-auto mb-2" size={48} />
        <p>Click to upload screenshot</p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </label>
    ) : (
      <div className="relative">
        <img 
          src={proofPreview} 
          alt="Proof" 
          className="w-full rounded-lg"
        />
        <Button 
          onClick={handleReupload}
          variant="secondary"
          className="mt-2"
        >
          Re-upload
        </Button>
      </div>
    )}
  </div>
  
  <Button 
    onClick={() => setCurrentStep(4)}
    disabled={!proofFile}
  >
    Continue to Review
  </Button>
</div>
```

#### **Step 4: Review & Submit**

```javascript
const handleSubmit = async () => {
  setSubmitting(true);
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('claimedAmount', amount);
    formData.append('screenshot', proofFile);
    formData.append('adminWalletId', selectedNetwork._id);
    formData.append('asset', selectedNetwork.asset);
    formData.append('network', selectedNetwork.network);
    
    // Submit via service
    await depositService.createDeposit(formData);
    
    toast.success('Deposit request submitted successfully!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error);
  } finally {
    setSubmitting(false);
  }
};
```

**API Call:**

```javascript
// src/services/deposit.service.js
async createDeposit(formData) {
  try {
    // formData contains: claimedAmount, screenshot, adminWalletId, asset, network
    const response = await api.post('/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Deposit submission failed';
  }
}
```

**Backend receives:**
- `claimedAmount` - Amount user claims to have deposited (USD)
- `screenshot` - File upload (transaction proof)
- `adminWalletId` - Which admin wallet they sent to
- `asset` - Cryptocurrency (BTC, USDT, etc.)
- `network` - Network type (Bitcoin, TRC20, ERC20, etc.)

**Backend creates deposit record:**
```javascript
{
  userId: user._id,
  claimedAmount: 100,
  asset: 'USDT',
  network: 'TRC20',
  adminWalletId: wallet._id,
  screenshot: '/uploads/proof_12345.jpg',
  status: 'PENDING',
  createdAt: Date.now()
}
```

---

## Withdrawal System Implementation

### **Complete Withdrawal Flow with OTP**

#### **Step 1: Enter Withdrawal Details**

```javascript
const [withdrawalForm, setWithdrawalForm] = useState({
  amount: '',
  asset: 'USDT',
  network: 'TRC20',
  address: ''
});

const [balance, setBalance] = useState(0);
const [fees, setFees] = useState(0);

useEffect(() => {
  fetchBalance();
  calculateFees();
}, []);

const calculateFees = () => {
  // Example: 2% withdrawal fee
  const feeAmount = parseFloat(withdrawalForm.amount) * 0.02;
  setFees(feeAmount);
};

const validateWithdrawal = () => {
  if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
    toast.error('Please enter a valid amount');
    return false;
  }
  
  if (parseFloat(withdrawalForm.amount) > balance) {
    toast.error('Insufficient balance');
    return false;
  }
  
  if (parseFloat(withdrawalForm.amount) < 10) {
    toast.error('Minimum withdrawal is $10');
    return false;
  }
  
  if (!withdrawalForm.address) {
    toast.error('Please enter wallet address');
    return false;
  }
  
  return true;
};

const handleNext = () => {
  if (validateWithdrawal()) {
    setCurrentStep(2); // Move to OTP step
  }
};
```

#### **Step 2: OTP Verification**

```javascript
const [otp, setOtp] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [countdown, setCountdown] = useState(0);

const requestOtp = async () => {
  try {
    await withdrawalService.requestOtp();
    setOtpSent(true);
    setCountdown(60); // 60 second countdown
    toast.success('OTP sent to your email');
  } catch (error) {
    toast.error(error);
  }
};

useEffect(() => {
  if (countdown > 0) {
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [countdown]);

const verifyAndProceed = () => {
  if (otp.length === 6) {
    setCurrentStep(3); // Move to review
  } else {
    toast.error('Please enter 6-digit OTP');
  }
};
```

**OTP Input UI:**

```javascript
<div className="space-y-4">
  <p className="text-center text-gray-400">
    Enter the OTP sent to your email
  </p>
  
  <div className="flex justify-center gap-2">
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <input
        key={index}
        type="text"
        maxLength="1"
        className="w-12 h-12 text-center text-2xl bg-gray-800 rounded"
        value={otp[index] || ''}
        onChange={(e) => handleOtpChange(index, e.target.value)}
      />
    ))}
  </div>
  
  <div className="text-center">
    {countdown > 0 ? (
      <p className="text-gray-400">Resend OTP in {countdown}s</p>
    ) : (
      <button onClick={requestOtp} className="text-blue-400">
        Resend OTP
      </button>
    )}
  </div>
  
  <Button onClick={verifyAndProceed} disabled={otp.length !== 6}>
    Verify & Continue
  </Button>
</div>
```

#### **Step 3: Review & Submit**

```javascript
const finalAmount = parseFloat(withdrawalForm.amount) - fees;

const handleSubmitWithdrawal = async () => {
  setSubmitting(true);
  
  try {
    const response = await withdrawalService.createWithdrawal(
      withdrawalForm.amount,
      withdrawalForm.asset,
      withdrawalForm.network,
      withdrawalForm.address,
      otp
    );
    
    toast.success('Withdrawal request submitted!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.message || 'Withdrawal failed');
  } finally {
    setSubmitting(false);
  }
};
```

**API Call:**

```javascript
// src/services/withdrawal.service.js
async createWithdrawal(amount, currency, network, address, otp) {
  try {
    const response = await api.post('/withdrawals', {
      amount,
      asset: currency,
      network,
      destinationAddress: address,
      otp
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit withdrawal' };
  }
}
```

**Request Body:**
```json
{
  "amount": 100,
  "asset": "USDT",
  "network": "TRC20",
  "destinationAddress": "TXYZabc123...",
  "otp": "123456"
}
```

**Backend Processing:**
1. Verify OTP is valid and not expired
2. Check user has sufficient balance
3. Lock the withdrawal amount (deduct from available balance)
4. Create withdrawal record with status 'PENDING'
5. Notify admins via WebSocket
6. Return success response

**Response:**
```json
{
  "success": true,
  "withdrawal": {
    "id": "withdraw_12345",
    "amount": 100,
    "asset": "USDT",
    "network": "TRC20",
    "status": "PENDING",
    "createdAt": "2026-01-25T17:00:00Z"
  }
}
```

---

This technical documentation continues with many more sections... Would you like me to continue adding more detailed implementation guides for other features?
