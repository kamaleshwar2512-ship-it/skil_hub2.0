const http = require('http');

const API_URL = 'http://localhost:3000/api';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Login to get token ---');
  let token = null;
  const loginRes = await request('POST', '/auth/login', {
    email: 'aarav.p@skilhub.edu',
    password: 'password123'
  });
  if (loginRes.data && loginRes.data.data && loginRes.data.data.accessToken) {
    token = loginRes.data.data.accessToken;
    console.log('Login success.');
  } else {
    console.log('Login failed', loginRes);
    return;
  }

  console.log('\n--- 2. Project 1 Recommendations (Collaborators) ---');
  // Project 1 required: ["Go", "React", "PostgreSQL", "Docker"]
  const p1Res = await request('GET', '/projects/1/recommendations', null, token);
  console.log('Status:', p1Res.status);
  console.log('Response:', JSON.stringify(p1Res.data, null, 2));

  console.log('\n--- 3. User 1 Recommendations (Projects) ---');
  // User 1 skills: ["React", "Node.js", "Python", "Machine Learning"]
  const u1Res = await request('GET', '/users/1/recommendations', null, token);
  console.log('Status:', u1Res.status);
  console.log('Response:', JSON.stringify(u1Res.data, null, 2));

  console.log('\n--- 4. Edge Case: Requesting recommendations for non-existent project ---');
  const missingPRes = await request('GET', '/projects/999/recommendations', null, token);
  console.log('Status:', missingPRes.status);
  console.log('Response:', JSON.stringify(missingPRes.data, null, 2));

  console.log('\n--- 5. Edge Case: Requesting recommendations for non-existent user ---');
  const missingURes = await request('GET', '/users/999/recommendations', null, token);
  console.log('Status:', missingURes.status);
  console.log('Response:', JSON.stringify(missingURes.data, null, 2));

  console.log('\n--- 6. Edge Case: Malformed ID ---');
  const malformedRes = await request('GET', '/projects/abc/recommendations', null, token);
  console.log('Status:', malformedRes.status);
  console.log('Response:', JSON.stringify(malformedRes.data, null, 2));
}

runTests();
