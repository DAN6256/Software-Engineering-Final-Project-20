/**
 * Main application entry point.
 *
 * Sets up the Express server with:
 * - CORS restricted to a single origin
 * - JSON body parsing
 * - API route registration
 * - Swagger UI for API documentation
 * - Database connection and model synchronization
 *
 * Exports the Express `app` instance for integration testing.
 */

const express = require('express');
require('dotenv').config();
const cors = require('cors');                        // Enable CORS support
const { connectDB } = require('./src/config/db');    // Database connection helper
const setupSwagger = require('./src/config/swagger'); // Swagger setup function
const models = require('./src/models');               // Load and register all Sequelize models

// Import route handlers
const authRoutes = require('./src/routes/auth.routes');
const equipmentRoutes = require('./src/routes/equipment.routes');
const borrowRoutes = require('./src/routes/borrow.routes');

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow only a specific origin
app.use(cors({
  origin: "https://fab-track-wtcn.vercel.app"
}));

// Parse incoming JSON requests automatically
app.use(express.json());

// Mount API route modules under their respective path prefixes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);

// Initialize Swagger UI at /api-docs for interactive API exploration
setupSwagger(app);

// Only connect to the database and start the HTTP server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    // Synchronize Sequelize models with the database schema (create/update tables)
    .then(() => models.sequelize.sync({ alter: true }))
    .then(() => {
      // Begin listening for incoming requests
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch(err => {
      console.error('Error connecting to the database:', err);
    });
}

// Export the Express app for testing purposes
module.exports = app;
