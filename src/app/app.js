const express = require('express');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
// --- Import BeaverUP resource routes ---
const learningItemRoutes = require('./routes/learningItemRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

const app = express();
const PORT = 3000; // --- Default port from requirements ---

// --- Middleware to parse JSON bodies ---
app.use(express.json());

// --- Apply logger globally to all requests ---
app.use(logger);

// --- Initial route handling ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: 'BeaverUP server is running' },
        error: null
    });
});

// --- Mount the user routes under /users prefix ---
app.use('/users', userRoutes);

// --- Mount BeaverUP resource routes ---
app.use('/learning-items', learningItemRoutes);
app.use('/interactions', interactionRoutes);

// --- Global 404 handler for unknown routes ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found.',
            details: { path: req.originalUrl }
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

