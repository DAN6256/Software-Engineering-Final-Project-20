/**
 * Swagger Setup for FabTrack API Documentation
 *
 * This module configures and initializes Swagger UI using swagger-jsdoc
 * and swagger-ui-express. It generates OpenAPI (v3.0.0) documentation
 * based on JSDoc comments in the route files, and serves the interactive
 * UI at the `/api-docs` endpoint.
 */

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// OpenAPI specification definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FabTrack API',                 // Title of the API documentation
    version: '1.0.0',                      // API version
    description: 'API documentation for the FabTrack equipment tracking system'
  },
  servers: [
    {
      url: 'http://localhost:3000/',       // Local development server URL
      description: 'Development test server'
    },
    {
      url: 'https://backendservice-9fbf.onrender.com/', // Deployed production server
      description: 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',                      // HTTP authentication scheme
        scheme: 'bearer',                  // Bearer token for JWT
        bearerFormat: 'JWT'                // Indicate the format is JWT
      }
    }
  }
};

// Options for swagger-jsdoc to locate JSDoc annotations
const options = {
  swaggerDefinition,                       // The OpenAPI definition above
  apis: ['./src/routes/*.js']             // Files containing JSDoc comments for endpoints
};

// Generate the Swagger specification from JSDoc comments
const swaggerSpec = swaggerJSDoc(options);

/**
 * Middleware to mount Swagger UI routes.
 * @param {object} app - The Express application instance.
 */
const setupSwagger = (app) => {
  // Serve Swagger UI at `/api-docs`
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;  // Export the setup function for use in server.js
