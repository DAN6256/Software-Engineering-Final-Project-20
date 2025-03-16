const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger');
const models = require('./src/models');

const authRoutes = require('./src/routes/auth.routes');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);


setupSwagger(app);

if (process.env.NODE_ENV !== 'test'){
connectDB()
  .then(() => models.sequelize.sync({ alter: true })) 
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });
}

module.exports = app;
