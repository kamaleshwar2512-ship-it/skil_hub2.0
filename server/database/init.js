'use strict';
/**
 * database/init.js
 * Run with: node database/init.js
 * Creates the SQLite database and applies the schema.
 */
const { getDb } = require('../src/config/database');

try {
  const db = getDb();
  // Quick sanity check
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('\n✅ SKIL Hub database initialized successfully.');
  console.log('   Tables created:', tables.map((t) => t.name).join(', '));
  process.exit(0);
} catch (err) {
  console.error('\n❌ Database initialization failed:', err.message);
  process.exit(1);
}
