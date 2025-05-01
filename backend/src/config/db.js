/**
 * Database Configuration and Connection Setup
 *
 * This module initializes a Sequelize instance configured for either:
 *  - In-memory SQLite (when running tests)
 *  - PostgreSQL (for all other environments)
 * It also exports a `connectDB` function to verify and establish the connection.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env

let sequelize;

// Use in-memory SQLite database when running unit/integration tests
if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,       // Disable SQL query logging during tests
  });
} else {
  // Configure Sequelize for PostgreSQL in development/production
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',  // Database dialect
    logging: false,       // Disable SQL query logging
    pool: {               // Connection pool settings
      max: 5,             // Maximum number of connections in pool
      min: 0,             // Minimum number of connections in pool
      acquire: 30000,     // Maximum time (ms) to try getting a connection before throwing error
      idle: 10000         // Maximum time (ms) a connection can be idle before being released
    },
    define: {
      timestamps: true    // Automatically add `createdAt` and `updatedAt` fields
    },
    dialectOptions: {
      ssl: {               // Enable SSL for secure connections (required by some hosts)
        require: true,
        rejectUnauthorized: false
      }
    }
  });
}

/**
 * Attempt to authenticate and establish the database connection.
 * Logs success or, on failure, prints the error and exits the process.
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit the Node.js process if unable to connect
  }
};

module.exports = {
  sequelize,  // The configured Sequelize instance
  connectDB   // Function to initiate the connection
};
