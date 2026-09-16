import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

const runTest = async () => {
    console.log('--- Testing Auth Refresh Flow ---');
    
    try {
        // 1. Login to get tokens and cookie
        console.log('\n1. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: 'jane.doe@example.com', // Using an existing email from test_signup.js logs if possible, or just a known one
            password: 'Password123!'
        }, {
            withCredentials: true
        });
        
        console.log('Login Status:', loginRes.status);
        const cookieHeader = loginRes.headers['set-cookie'];
        console.log('Set-Cookie Header:', cookieHeader ? 'Present' : 'Missing');
        
        if (!cookieHeader) {
            console.error('FAILED: No refreshToken cookie returned');
            return;
        }

        // 2. Attempt refresh using the cookie
        console.log('\n2. Attempting Refresh...');
        const refreshRes = await axios.post(`${BASE_URL}/refresh`, {}, {
            headers: {
                Cookie: cookieHeader[0]
            },
            withCredentials: true
        });
        
        console.log('Refresh Status:', refreshRes.status);
        console.log('New Access Token:', refreshRes.data.accessToken ? 'Received' : 'Missing');
        
        if (refreshRes.data.accessToken) {
            console.log('SUCCESS: Refresh flow working as expected.');
        } else {
            console.error('FAILED: Refresh response missing accessToken');
        }

    } catch (error) {
        console.log('Error Status:', error.response?.status || 'Network Error');
        console.log('Error Response:', JSON.stringify(error.response?.data || error.message, null, 2));
    }
};

runTest();
