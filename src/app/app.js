const express = require('express');
const logger = require('./middleware/logger');
const { isAdmin } = require('./middleware/auth'); // ---> Import authorization middleware

const app = express();
const PORT = 3000; // ---> Default port from requirements

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

// --- Protected route: Delete user (Requires admin role) ---
// --- Logger -> isAdmin -> Controller logic ---
app.delete('/users/:id', isAdmin, (req, res) => {
    const userId = req.params.id;
    
    res.json({
        success: true,
        data: { 
            message: `User with ID ${userId} has been deleted successfully.`,
            deletedId: userId
        },
        error: null
    });
});

// --- Start the application ---
app.listen(PORT, () => {
    console.log(`--- comment ---// App is listening on http://localhost:${PORT}`);
});