const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth'); // <-- 1. Import auth routes

const app = express();
const PORT = process.env.PORT || 5001;

// ... (middleware and DB connection) ...
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.use('/api/auth', authRoutes); // <-- 2. Use auth routes
app.use('/api', apiRoutes);

// ... (start the server) ...
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});