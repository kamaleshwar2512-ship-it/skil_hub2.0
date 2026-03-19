'use strict';

/**
 * Simple Node script to verify that the Node backend can talk to the ML service.
 * 
 * Usage:
 *   cd server
 *   node scripts/verify-ml-integration.js
 */

require('dotenv').config();
const { ML_SERVICE_URL } = require('../src/config/config');

async function main() {
  console.log('\n🔎 Verifying ML integration');
  console.log(`   ML_SERVICE_URL: ${ML_SERVICE_URL}\n`);

  try {
    const healthStart = Date.now();
    const healthRes = await fetch(`${ML_SERVICE_URL}/health`);
    const healthJson = await healthRes.json();
    console.log('➡️  /health status:', healthRes.status, 'in', Date.now() - healthStart, 'ms');
    console.log('    body:', healthJson);
  } catch (err) {
    console.error('❌ Failed to call /health:', err.message);
  }

  try {
    const classifyStart = Date.now();
    const classifyRes = await fetch(`${ML_SERVICE_URL}/classify-achievement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Won best project award at college hackathon building full stack web app',
      }),
    });
    const classifyJson = await classifyRes.json();
    console.log('\n➡️  /classify-achievement status:', classifyRes.status, 'in', Date.now() - classifyStart, 'ms');
    console.log('    body:', classifyJson);
  } catch (err) {
    console.error('❌ Failed to call /classify-achievement:', err.message);
  }

  try {
    const recStart = Date.now();
    const recRes = await fetch(`${ML_SERVICE_URL}/recommend-collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        required_skills: ['Python', 'Machine Learning'],
        user_skills: [
          { user_id: 1, skills: 'Python Machine Learning Data Science' },
          { user_id: 2, skills: 'React JavaScript Frontend' },
        ],
        exclude_user_ids: [],
        top_n: 5,
      }),
    });
    const recJson = await recRes.json();
    console.log('\n➡️  /recommend-collaborators status:', recRes.status, 'in', Date.now() - recStart, 'ms');
    console.log('    body:', recJson);
  } catch (err) {
    console.error('❌ Failed to call /recommend-collaborators:', err.message);
  }

  console.log('\n✅ ML integration verification script finished.\n');
}

main().catch((err) => {
  console.error('Unexpected error in verify-ml-integration:', err);
  process.exit(1);
});

