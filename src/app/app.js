const express = require('express');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes'); 

const app = express();
const PORT = 3000; // --- Default port from requirements ---

// --- Middleware to parse JSON bodies ---
app.use(express.json());

// --- Apply logger globally to all requests ---
app.use(logger);

// --- initial route handling ---
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "BeaverUp server is running",
        data: null,
        error: null
    });
});

// --- Mount the user routes under /users prefix ---
app.use('/users', userRoutes);

// --- Global 404 handler for unknown routes ---
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        data: null, 
        error: { 
            code: "NOT_FOUND", 
            message: "Route not found" 
        } 
    });
});

// --- Start the application ---
app.listen(PORT, () => {
    console.log(`// --- App is listening on http://localhost:${PORT} ---`);
});