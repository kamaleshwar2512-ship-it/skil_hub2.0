'use strict';
/**
 * database/seed.js
 * Run with: node server/database/seed.js
 * Runs the seed.sql script to populate the SQLite database with mock data.
 */
const fs = require('fs');
const path = require('path');
const { getDb, closeDb } = require('../src/config/database');

const SEED_FILE = path.join(__dirname, 'seed.sql');

try {
  const db = getDb();
  
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(`Seed file not found at ${SEED_FILE}`);
  }

  const seedQuery = fs.readFileSync(SEED_FILE, 'utf8');

  // Using transaction for atomic seed operation
  const seed = db.transaction(() => {
    db.exec(seedQuery);
  });

  console.log('\n⏳ Starting database seed...');
  seed();
  console.log('✅ SKIL Hub database successfully seeded with initial mock data!');
  
  // Clean up
  if (closeDb) {
    closeDb();
  } else {
    db.close();
  }
  process.exit(0);
} catch (err) {
  console.error('\n❌ Database seeding failed:', err.message);
  process.exit(1);
}
