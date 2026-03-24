import initSqlJs from 'sql.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let SQL = null;


function getDatabasePath() {
  try {
    // Electron production
    if (process.resourcesPath) {
      const userDataPath =
        process.env.APPDATA ||
        (process.platform === 'darwin'
          ? process.env.HOME + '/Library/Application Support'
          : process.env.HOME + '/.local/share');

      const fullPath = path.join(userDataPath, 'POS System', 'pos-database.db');
      console.log('📁 Using production DB path:', fullPath);
      return fullPath;
    }
  } catch (err) {
    console.log('⚠️ Electron not detected');
  }

  // Dev fallback
  const devPath = path.join(process.cwd(), 'pos-database.db');
  console.log('📁 Using dev DB path:', devPath);
  return devPath;
}

const DB_PATH = getDatabasePath();

// 🔥 Get wasm file path
function getWasmPath() {
  // For development: look in public folder
  const devWasm = path.join(process.cwd(), 'public', 'sql-wasm.wasm');
  if (fs.existsSync(devWasm)) {
    return devWasm;
  }
  
  // For production: look in resources
  if (process.resourcesPath) {
    const prodWasm = path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'sql-wasm.wasm');
    if (fs.existsSync(prodWasm)) {
      return prodWasm;
    }
  }
  
  // Fallback: use node_modules path
  const nodeWasm = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  if (fs.existsSync(nodeWasm)) {
    return nodeWasm;
  }
  
  throw new Error('sql-wasm.wasm file not found!');
}

async function saveDatabase() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      await fs.writeFile(DB_PATH, buffer);
      console.log('💾 Database saved');
    } catch (err) {
      console.error('❌ Error saving database:', err);
    }
  }
}

async function initDatabase() {
  if (db) return db;
  
  try {
    const wasmPath = getWasmPath();
    console.log('📁 Loading wasm from:', wasmPath);
    
    // Load SQL.js with wasm file
    SQL = await initSqlJs({
      locateFile: () => wasmPath
    });
    
    await fs.ensureDir(path.dirname(DB_PATH));
    
    let dbData = null;
    if (await fs.pathExists(DB_PATH)) {
      const buffer = await fs.readFile(DB_PATH);
      dbData = new Uint8Array(buffer);
      console.log('✅ Loaded existing database from:', DB_PATH);
    } else {
      console.log('📦 Creating new database at:', DB_PATH);
    }
    
    db = new SQL.Database(dbData);
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        purchase_price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_amount REAL NOT NULL,
        total_profit REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        selling_price REAL NOT NULL,
        profit REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    if (!dbData) {
      await saveDatabase();
    }
    
    console.log('✅ Database initialized');
    return db;
  } catch (err) {
    console.error('❌ Database init error:', err);
    throw err;
  }
}

async function query(sql, params = []) {
  const database = await initDatabase();
  try {
    const stmt = database.prepare(sql);
    const results = [];
    
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

async function run(sql, params = []) {
  const database = await initDatabase();
  try {
    const stmt = database.prepare(sql);
    
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    stmt.step();
    
    let lastInsertRowid = null;
    try {
      const result = database.exec('SELECT last_insert_rowid()');
      if (result && result[0] && result[0].values && result[0].values[0]) {
        lastInsertRowid = result[0].values[0][0];
      }
    } catch (e) {}
    
    stmt.free();
    await saveDatabase();
    
    return { lastInsertRowid, changes: database.getRowsModified() };
  } catch (err) {
    console.error('Run error:', err);
    throw err;
  }
}

async function get(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

const dbApi = {
  initDatabase,
  query,
  run,
  get,
  saveDatabase,
  get DB_PATH() { return DB_PATH; }
};

let initPromise = null;

const dbProxy = new Proxy(dbApi, {
  get(target, prop) {
    if (prop === 'initDatabase' || prop === 'saveDatabase' || prop === 'DB_PATH') {
      return target[prop];
    }
    return async (...args) => {
      if (!initPromise) {
        initPromise = target.initDatabase();
      }
      await initPromise;
      return target[prop](...args);
    };
  }
});

export default dbProxy;