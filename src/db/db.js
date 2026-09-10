const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'lernwerkstatt.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS worksheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'mathe',
    child_id INTEGER REFERENCES children(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS worksheet_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worksheet_id INTEGER NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
    module_type TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    config_json TEXT NOT NULL,
    tasks_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worksheet_module_id INTEGER NOT NULL REFERENCES worksheet_modules(id) ON DELETE CASCADE,
    task_index INTEGER NOT NULL,
    answer TEXT,
    correct INTEGER NOT NULL,
    answered_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
