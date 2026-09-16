import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

const testLogin = async () => {
    console.log('--- Testing Login API ---');

    // Use a known user or create one
    const email = `test.${Date.now()}@example.com`;
    const name = 'Test User';
    const password = 'Password123!';

    try {
        // 1. Signup
        console.log('Registering user...');
        await axios.post(`${BASE_URL}/signup`, { name, email, password });

        // 2. We can't easily verify OTP without reading DB/logs, 
        // but we can try to login. 
        // If emailVerificationRequired is true, login will return 403 with requiresOtp.
        // Let's see if we can get a response that includes user info.
        
        console.log('Attempting login...');
        try {
            const res = await axios.post(`${BASE_URL}/login`, { email, password });
            console.log('Status:', res.status);
            console.log('User keys:', Object.keys(res.data.user));
            console.log('Name in response:', res.data.user.name);
            console.log('User in Response:', JSON.stringify(res.data.user, null, 2));
        } catch (error) {
            console.log('Status:', error.response?.status);
            if (error.response?.data?.requiresOtp) {
                console.log('Login requires OTP (expected if mandatory verification is on)');
                // In this case, we'd need to verify OTP to see the full user object.
                // But the code update was also applied to verifyOtp.
            } else {
                console.log('Response:', JSON.stringify(error.response?.data, null, 2));
            }
        }
    } catch (error) {
        console.error('Error during test:', error.response?.data || error.message);
    }
};

testLogin();
