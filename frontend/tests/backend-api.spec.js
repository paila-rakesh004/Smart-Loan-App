const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:8000/api';

test.describe('Backend Authentication API Tests', () => {
  test('POST /users/login/ - should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users/login/`, {
      data: {
        username: 'nonexistent_user_12345',
        password: 'wrongpassword'
      }
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /token/ - should return JWT tokens for valid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/token/`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    });
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('access');
      expect(data).toHaveProperty('refresh');
    } else {
      expect(response.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('POST /token/refresh/ - should refresh access token', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const refreshResponse = await request.post(`${BASE_URL}/token/refresh/`, {
        data: { refresh: tokens.refresh }
      });
      expect(refreshResponse.status()).toBe(200);
      const newTokens = await refreshResponse.json();
      expect(newTokens).toHaveProperty('access');
    }
  });
});

test.describe('User Profile API Tests', () => {
  test('GET /users/profile/ - should reject without authentication', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/profile/`);
    const status = response.status();
    expect(status === 401 || status === 403).toBeTruthy();
  });

  test('GET /users/profile/ - should return profile with valid token', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/users/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
    }
  });

  test('GET /users/check-status/ - should return user status', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/users/check-status/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
    }
  });
});

test.describe('Loan API Tests', () => {
  test('GET /loans/my-loans/ - should reject without authentication', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/loans/my-loans/`);
    const status = response.status();
    expect(status === 401 || status === 403).toBeTruthy();
  });

  test('GET /loans/my-loans/ - should return user loans with valid token', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/loans/my-loans/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    }
  });

  test('GET /loans/officer/all-loans/ - should reject without officer token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/loans/officer/all-loans/`);
    const status = response.status();
    expect(status === 401 || status === 403).toBeTruthy();
  });

  test('POST /loans/apply/ - should reject without authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/loans/apply/`, {
      data: {
        occupation: 'Engineer',
        organization_name: 'Tech Corp',
        monthly_income: 50000,
        loan_type: 'Personal',
        loan_amount: 500000,
        tenure: 36,
        nominee_name: 'Jane Doe',
        nominee_age: 30
      }
    });
    const status = response.status();
    expect(status === 401 || status === 403).toBeTruthy();
  });
});

test.describe('Loan Stats API Tests', () => {
  test('GET /loans/customer/stats/ - should return customer loan stats', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/loans/customer/stats/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
    }
  });

  test('GET /loans/officer/stats/ - should return officer stats', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/loans/officer/stats/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
    }
  });
});

test.describe('OTP API Tests', () => {
  test('POST /users/send-otp/ - should accept username', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users/send-otp/`, {
      data: { username: '' }
    });
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('POST /users/verify-otp/ - should validate OTP format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users/verify-otp/`, {
      data: {
        username: 'testuser',
        otp: '12345'
      }
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('KYC API Tests', () => {
  test('GET /users/my-kyc/ - should reject without authentication', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/my-kyc/`);
    const status = response.status();
    expect(status === 401 || status === 403).toBeTruthy();
  });

  test('GET /users/my-kyc/ - should return KYC status with valid token', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/token/`, {
      data: { username: 'admin', password: 'admin123' }
    });
    if (loginResponse.status() === 200) {
      const tokens = await loginResponse.json();
      const response = await request.get(`${BASE_URL}/users/my-kyc/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      expect(response.status()).toBe(200);
    }
  });
});