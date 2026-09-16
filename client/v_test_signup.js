import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

const testSignup = async () => {
    console.log('--- Testing Signup API ---');

    // 1. Test missing name
    try {
        console.log('\nTesting missing name...');
        await axios.post(`${BASE_URL}/signup`, {
            email: 'test@example.com',
            password: 'Password123!'
        });
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    // 2. Test invalid name (too short)
    try {
        console.log('\nTesting invalid name (1 char)...');
        await axios.post(`${BASE_URL}/signup`, {
            name: 'A',
            email: 'test@example.com',
            password: 'Password123!'
        });
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    // 3. Test invalid password
    try {
        console.log('\nTesting invalid password...');
        await axios.post(`${BASE_URL}/signup`, {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'pass'
        });
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    // 4. Test missing email
    try {
        console.log('\nTesting missing email...');
        await axios.post(`${BASE_URL}/signup`, {
            name: 'Jane Doe',
            password: 'Password123!'
        });
    } catch (error) {
        console.log('Status:', error.response?.status);
        console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    }

    // 5. Test valid request (Note: this might fail if the server is not running or email exists)
    try {
        console.log('\nTesting valid request...');
        const res = await axios.post(`${BASE_URL}/signup`, {
            name: 'Jane Doe',
            email: `jane.doe.${Date.now()}@example.com`,
            password: 'Password123!'
        });
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.log('Status:', error.response?.status || 'Error');
        console.log('Response:', error.response?.data || error.message);
    }
};

testSignup();
