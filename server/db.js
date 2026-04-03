import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'rail-sandbox.db');

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

/**
 * Initialize sql.js and load/create the database.
 * Must be called (and awaited) before using any other exports.
 */
export async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file or create a new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Applications table - stores Rail application submissions
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rail_application_id TEXT UNIQUE,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      customer_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customers table - synced from Rail API
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rail_customer_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Accounts table - synced from Rail API
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rail_account_id TEXT UNIQUE NOT NULL,
      rail_customer_id TEXT NOT NULL,
      account_type TEXT,
      asset_type TEXT,
      label TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rail_customer_id) REFERENCES customers(rail_customer_id)
    )
  `);

  // Transactions table - deposits, withdrawals, exchanges
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rail_transaction_id TEXT UNIQUE NOT NULL,
      rail_account_id TEXT,
      type TEXT NOT NULL,
      amount TEXT,
      asset_type TEXT,
      status TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  persist();
  console.log('Database initialized successfully');
}

/**
 * Save the in-memory database to disk
 */
function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// ─── Helper: run a SELECT that returns multiple rows ───
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// ─── Helper: run a SELECT that returns a single row ───
function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

// ─── Helper: run an INSERT / UPDATE / DELETE ───
function execute(sql, params = []) {
  db.run(sql, params);
  persist();
  return { changes: db.getRowsModified() };
}

// ─────────────────────────────────────────────
//  Applications
// ─────────────────────────────────────────────

export function saveApplication(applicationData) {
  return execute(
    `INSERT OR REPLACE INTO applications (rail_application_id, customer_name, email, status, customer_type, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [
      applicationData.id,
      applicationData.customer_name,
      applicationData.email,
      applicationData.status,
      applicationData.customer_type,
    ]
  );
}

export function getApplicationByRailId(railApplicationId) {
  return queryOne(
    'SELECT * FROM applications WHERE rail_application_id = ?',
    [railApplicationId]
  );
}

export function getAllApplications() {
  return queryAll('SELECT * FROM applications ORDER BY created_at DESC');
}

// ─────────────────────────────────────────────
//  Customers
// ─────────────────────────────────────────────

export function saveCustomer(customerData) {
  return execute(
    `INSERT OR REPLACE INTO customers (rail_customer_id, name, email, status, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [
      customerData.id,
      customerData.name,
      customerData.email,
      customerData.status,
    ]
  );
}

export function getCustomerByRailId(railCustomerId) {
  return queryOne(
    'SELECT * FROM customers WHERE rail_customer_id = ?',
    [railCustomerId]
  );
}

export function getAllCustomers() {
  return queryAll('SELECT * FROM customers ORDER BY created_at DESC');
}

// ─────────────────────────────────────────────
//  Accounts
// ─────────────────────────────────────────────

export function saveAccount(accountData) {
  return execute(
    `INSERT OR REPLACE INTO accounts (rail_account_id, rail_customer_id, account_type, asset_type, label, status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      accountData.id,
      accountData.customer_id,
      accountData.account_type,
      accountData.asset_type,
      accountData.label,
      accountData.status,
    ]
  );
}

export function getAccountByRailId(railAccountId) {
  return queryOne(
    'SELECT * FROM accounts WHERE rail_account_id = ?',
    [railAccountId]
  );
}

export function getAccountsByCustomerId(railCustomerId) {
  return queryAll(
    'SELECT * FROM accounts WHERE rail_customer_id = ? ORDER BY created_at DESC',
    [railCustomerId]
  );
}

export function getAllAccounts() {
  return queryAll('SELECT * FROM accounts ORDER BY created_at DESC');
}

// ─────────────────────────────────────────────
//  Transactions
// ─────────────────────────────────────────────

export function saveTransaction(transactionData) {
  return execute(
    `INSERT OR REPLACE INTO transactions (rail_transaction_id, rail_account_id, type, amount, asset_type, status, details, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      transactionData.id,
      transactionData.account_id,
      transactionData.type,
      transactionData.amount,
      transactionData.asset_type,
      transactionData.status,
      JSON.stringify(transactionData),
    ]
  );
}

export function getTransactionByRailId(railTransactionId) {
  const result = queryOne(
    'SELECT * FROM transactions WHERE rail_transaction_id = ?',
    [railTransactionId]
  );
  if (result && result.details) {
    result.details = JSON.parse(result.details);
  }
  return result;
}

export function getTransactionsByAccountId(railAccountId) {
  const results = queryAll(
    'SELECT * FROM transactions WHERE rail_account_id = ? ORDER BY created_at DESC',
    [railAccountId]
  );
  return results.map((r) => ({
    ...r,
    details: r.details ? JSON.parse(r.details) : null,
  }));
}

export function getAllTransactions() {
  const results = queryAll(
    'SELECT * FROM transactions ORDER BY created_at DESC'
  );
  return results.map((r) => ({
    ...r,
    details: r.details ? JSON.parse(r.details) : null,
  }));
}

export default { initializeDatabase };
