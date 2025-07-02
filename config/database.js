// Database configuration
// This file can be expanded later to include database connection settings

const config = {
  development: {
    // Add your database configuration here
    // Example for MongoDB:
    // mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/tooling_app',
    
    // Example for PostgreSQL:
    // host: process.env.DB_HOST || 'localhost',
    // port: process.env.DB_PORT || 5432,
    // database: process.env.DB_NAME || 'tooling_app',
    // username: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || 'password',
  },
  production: {
    // Production database configuration
  },
  test: {
    // Test database configuration
  }
};

module.exports = config[process.env.NODE_ENV || 'development']; 