'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../database/skil_hub.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');

    // Enforce foreign key constraints
    db.pragma('foreign_keys = ON');

    // Run schema if tables don't exist yet
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
  }
  return db;
}

/**
 * Gracefully closes the database connection.
 * Useful for shutting down the server cleanly and flushing WAL.
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ SKIL Hub database connection closed cleanly.');
  }
}

// Ensure the database is closed on application termination
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

module.exports = { getDb, closeDb };
