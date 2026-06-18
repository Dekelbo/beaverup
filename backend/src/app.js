const cors = require('cors');
const express = require('express');
const http = require('http');
const { testDatabaseConnection } = require('./config/database');
const env = require('./config/env');
const authController = require('./controllers/authController');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const learningItemRoutes = require('./routes/learningItemRoutes');
const userRoutes = require('./routes/userRoutes');
const logger = require('./middleware/logger');
const { initializeSocket } = require('./services/socketService');
const { sendError, sendSuccess } = require('./utils/responses');

const app = express();

app.use(
    cors({
        origin: env.frontendUrl,
        allowedHeaders: ['Content-Type', 'x-user-role', 'x-user-id'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
);
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
    return sendSuccess(res, 200, { message: 'BeaverUP database backend is running' });
});

app.get('/db/status', async (req, res) => {
    try {
        await testDatabaseConnection();
        return sendSuccess(res, 200, { message: 'Database connection is working.' });
    } catch (error) {
        return sendError(res, 500, 'DATABASE_CONNECTION_ERROR', 'Could not connect to database.');
    }
});

app.use('/api/auth', authRoutes);
app.get('/api/users/me', authController.getMe);
app.use('/users', userRoutes);
app.use('/admins', adminRoutes);
app.use('/learning-items', learningItemRoutes);
app.use('/interactions', interactionRoutes);

app.use((req, res) => {
    return sendError(res, 404, 'NOT_FOUND', 'Route not found');
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return sendError(res, 400, 'INVALID_JSON', 'Request body must be valid JSON.');
    }

    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error.');
});

if (require.main === module) {
    testDatabaseConnection()
        .then(() => {
            const server = http.createServer(app);
            initializeSocket(server);

            server.listen(env.port, () => {
                console.log(`// --- BeaverUP backend is listening on http://localhost:${env.port} ---`);
            });
        })
        .catch(error => {
            console.error('Database connection failed. Check backend/.env and make sure MySQL is running.');
            console.error(error.message);
            process.exit(1);
        });
}

module.exports = app;
