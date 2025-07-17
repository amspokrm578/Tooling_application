const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database configuration
const config = {
  development: {
    database: {
      type: 'sqlite',
      filename: path.join(dataDir, 'tooling_app.db'),
      verbose: console.log
    }
  },
  production: {
    database: {
      type: 'sqlite',
      filename: process.env.DB_PATH || path.join(dataDir, 'tooling_app.db'),
      verbose: false
    }
  },
  test: {
    database: {
      type: 'sqlite',
      filename: ':memory:', // In-memory database for testing
      verbose: false
    }
  }
};

// Database connection function
const createConnection = () => {
  const dbConfig = config[process.env.NODE_ENV || 'development'].database;
  
  if (dbConfig.type === 'sqlite') {
    const db = new sqlite3.Database(dbConfig.filename, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        throw err;
      } else {
        console.log('✅ Connected to SQLite database:', dbConfig.filename);
        initializeTables(db);
      }
    });
    return db;
  }
};

// Initialize database tables
const initializeTables = (db) => {
  console.log('🔄 Initializing database tables...');
  
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
    } else {
      console.log('✅ Users table ready');
    }
  });

  // Create sessions table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating sessions table:', err.message);
    } else {
      console.log('✅ Sessions table ready');
    }
  });

  // Create tools table for the tool sharing functionality
  db.run(`
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating tools table:', err.message);
    } else {
      console.log('✅ Tools table ready');
    }
  });

  // Create borrowings table for tracking tool loans
  db.run(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id INTEGER NOT NULL,
      borrower_id INTEGER NOT NULL,
      borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      returned_at DATETIME,
      due_date DATETIME,
      status TEXT DEFAULT 'borrowed',
      FOREIGN KEY (tool_id) REFERENCES tools (id),
      FOREIGN KEY (borrower_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating borrowings table:', err.message);
    } else {
      console.log('✅ Borrowings table ready');
    }
  });
};

// Database utility functions
const dbUtils = {
  // Execute a query and return results
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Execute a query and return a single row
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Execute a query that doesn't return results (INSERT, UPDATE, DELETE)
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },

  // Close database connection
  close: () => {
    const db = createConnection();
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  },

  // Get database info
  getInfo: () => {
    const dbConfig = config[process.env.NODE_ENV || 'development'].database;
    return {
      type: dbConfig.type,
      filename: dbConfig.filename,
      environment: process.env.NODE_ENV || 'development'
    };
  }
};

// Test database connection and functionality
const testDatabase = async () => {
  console.log('🧪 Testing database functionality...');
  
  try {
    // Test basic connection
    const db = createConnection();
    console.log('✅ Database connection test passed');

    // Test table creation (should already exist)
    const tables = await dbUtils.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('users', 'sessions', 'tools', 'borrowings')
    `);
    console.log('✅ Found tables:', tables.map(t => t.name));

    // Test inserting a test user
    const testUser = await dbUtils.run(`
      INSERT INTO users (name, email, password) 
      VALUES (?, ?, ?)
    `, ['Test User', 'test@example.com', 'hashedpassword123']);

    console.log('✅ Test user created with ID:', testUser.lastID);

    // Test querying the test user
    const user = await dbUtils.get(`
      SELECT * FROM users WHERE email = ?
    `, ['test@example.com']);

    console.log('✅ Test user retrieved:', { id: user.id, name: user.name, email: user.email });

    // Clean up test data
    await dbUtils.run('DELETE FROM users WHERE email = ?', ['test@example.com']);
    console.log('✅ Test data cleaned up');

    console.log('🎉 All database tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
};

module.exports = {
  config: config[process.env.NODE_ENV || 'development'],
  createConnection,
  initializeTables,
  dbUtils,
  testDatabase
}; 