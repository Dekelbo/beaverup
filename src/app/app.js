const express = require('express');
const logger = require('./middleware/logger');

// --- Import BeaverUP resource routes ---
const authController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const learningItemRoutes = require('./routes/learningItemRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

const app = express();
const PORT = 3000; // --- Default port from requirements ---

// --- Allow frontend API requests ---
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-role, x-user-id');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// --- Middleware to parse JSON bodies ---
app.use(express.json());

// --- Apply logger globally to all requests ---
app.use(logger);

// --- initial route handling ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: 'BeaverUP server is running' },
        error: null
    });
});

// Register route groups under their base API endpoints paths
app.use('/api/auth', authRoutes);
app.get('/api/users/me', authController.getMe);
app.use('/users', userRoutes);
app.use('/learning-items', learningItemRoutes);
app.use('/interactions', interactionRoutes);

// --- Global 404 handler for unknown routes ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 'INVALID_JSON',
                message: 'Request body must be valid JSON.',
                details: {}
            }
        });
    }

    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected server error.',
            details: {}
        }
    });
});

// --- Start the application ---
app.listen(PORT, () => {
    console.log(`// --- App is listening on http://localhost:${PORT} ---`);
});
