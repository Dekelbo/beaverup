# BeaverUP

BeaverUP is a language-learning web app for spoken fluency practice. The core loop is:

```text
Write -> Polish -> Learn -> Reuse
```

Users can practice in Conversation, Story, and Translate modes, save learning items, review history, and join live language rooms in Beaver Hub.

## Tech Stack

- Frontend: React, React Router, Fetch API, Socket.IO client
- Backend: Node.js, Express, Socket.IO
- Database: MySQL
- ORM: Sequelize
- AI: OpenAI SDK

## Project Structure

```text
beaverup/
  backend/
    src/
      app.js
      config/
      controllers/
      middleware/
      routes/
      services/
      scripts/
      utils/
    models/
    migrations/
    package.json
    .env.example
  frontend/
    public/
    src/
      components/
      pages/
      services/
      App.js
    package.json
    .env.example
  postman/
    BeaverUp.postman_collection.json
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create a local frontend env file from:

```text
frontend/.env.example
```

Save it as:

```text
frontend/.env
```

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE beaverup;
```

Create a local backend env file from:

```text
backend/.env.example
```

Save it as:

```text
backend/.env
```

Then fill in your local MySQL password and OpenAI key.

Check the database connection:

```bash
cd backend
npm run db:test
```

Sync ORM tables:

```bash
npm run db:sync
```

The migration files are also available in `backend/migrations` if the database needs to be created manually from SQL files.

If an existing database was created before the 12-level BeaverUP scale, run:

```bash
cd backend
mysql -h your-db-host -P 3306 -u your-db-user -p beaverup < migrations/007-update-level-scale.sql
```

This updates `users.currentLevel` and `interactions.level` so the database accepts values such as `A1+`, `A2+`, `B1+`, `B2+`, `C1+`, and `C2+`.

## Environment Variables

Backend variables:

```text
PORT=3000
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,https://your-frontend-service.onrender.com

DB_HOST=localhost
DB_PORT=3306
DB_NAME=beaverup
DB_USER=root
DB_PASSWORD=replace_with_your_mysql_password

AI_PROVIDER=openai
AI_API_KEY=replace_with_your_ai_key
AI_MODEL=gpt-4o-mini
AI_MAX_OUTPUT_TOKENS=500
```

Frontend variables:

```text
PORT=5173
REACT_APP_API_BASE_URL=http://localhost:3000
```

Do not commit real `.env` files. Commit only `backend/.env.example` and `frontend/.env.example`.

## Run The App

Start backend:

```bash
cd backend
npm start
```

Start frontend:

```bash
cd frontend
npm start
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

## ORM Models

Required Assignment 4 models are implemented:

- `User`
- `Admin`
- `Interaction` as the main project resource
- `InteractionLearningItem` as the junction table
- `LearningItem`

Relationships:

- `User` has many `Interaction`
- `User` has many `LearningItem`
- `User` has one `Admin`
- `Interaction` belongs to many `LearningItem`
- `LearningItem` belongs to many `Interaction`

The many-to-many relationship uses `interaction_learning_items`.

## ORM Setup

Sequelize connects to MySQL using the values from `backend/.env`.

The model files are stored in:

```text
backend/models
```

The Sequelize connection and model registration are handled by:

```text
backend/src/config/database.js
backend/models/index.js
```

To create or update the tables from the ORM models, run:

```bash
cd backend
npm run db:sync
```

To check only the database connection, run:

```bash
cd backend
npm run db:test
```

## Migrations

SQL schema files are in:

```text
backend/migrations
```

They create:

- `users`
- `admins`
- `interactions`
- `learning_items`
- `interaction_learning_items`

`006-seed-demo-data.sql` is optional demo data.

## API Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message.",
    "details": {}
  }
}
```

## Main API Endpoints

Base backend URL:

```text
http://localhost:3000
```

Most protected routes use simple assignment-friendly headers:

```text
x-user-id: 1
x-user-role: user
```

Admin-only routes should use:

```text
x-user-role: admin
```

Auth:

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/users/me
```

Users:

```text
GET    /users
GET    /users/:id
GET    /users/:id/summary
GET    /users/:id/with-interactions
GET    /users/:id/with-learning-items
POST   /users
PUT    /users/:id
DELETE /users/:id
```

Admins:

```text
GET    /admins
GET    /admins/:id
POST   /admins
PUT    /admins/:id
DELETE /admins/:id
```

Interactions:

```text
GET    /interactions
GET    /interactions/:id
GET    /interactions/:id/details
GET    /interactions/user/:userId
POST   /interactions
PUT    /interactions/:id
DELETE /interactions/:id
```

Learning items:

```text
GET    /learning-items
GET    /learning-items/:id
GET    /learning-items/:id/details
GET    /learning-items/user/:userId
POST   /learning-items
PUT    /learning-items/:id
DELETE /learning-items/:id
```

Database status:

```text
GET /db/status
```

## AI Feature

AI is integrated through:

```text
POST /interactions
```

The frontend never calls OpenAI directly. It sends the selected mode and user input to the backend. The backend calls OpenAI and stores the result in MySQL.

Supported modes:

- Conversation: first click starts the AI question; later answers receive native rewrite, higher-level rewrite, learning items, and next prompt.
- Story: first click generates a story up to 100 words; later input creates follow-up stories using difficult words.
- Translate: returns direct natural translations.

## WebSocket Feature

Beaver Hub provides live language rooms using Socket.IO.

Custom events:

```text
room:join
room:message
room:leave
room:users
```

Demo flow:

1. Open BeaverUP in two browser tabs.
2. Log in.
3. Open Beaver Hub in both tabs.
4. Join the same language room.
5. Send a message in one tab.
6. Confirm the other tab receives it instantly.

Messages are live only and are not stored in MySQL.

## Postman Collection

The Postman collection is stored in:

```text
postman/BeaverUp.postman_collection.json
```

Use this variable in Postman:

```text
baseUrl = http://localhost:3000
```

For protected requests, add:

```text
x-user-id: 1
x-user-role: user
```

Use `x-user-role: admin` for admin-only requests.

To test protected routes, please send a POST request to /api/auth/login. 
Copy the returned token and either set it as a {{token}} variable in Postman
or paste it directly into the Authorization tab as a Bearer Token.

## Deployment

Deploy the app as three connected services:

```text
React frontend -> Render Static Site
Node/Express backend -> Render Web Service
MySQL database -> AWS RDS
```

AWS RDS:

```text
Engine: MySQL
Database name: beaverup
Public access: Yes
Inbound rule: MySQL/Aurora, port 3306, from the address range required by the course/presentation
```

Render backend web service:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Backend Render environment variables:

```text
PORT=10000
FRONTEND_URL=https://your-frontend-service.onrender.com
FRONTEND_URLS=http://localhost:5173,https://your-frontend-service.onrender.com

DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_NAME=beaverup
DB_USER=admin
DB_PASSWORD=your_aws_rds_password

AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4o-mini
AI_MAX_OUTPUT_TOKENS=500
```

Render frontend static site:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
```

Frontend Render environment variables:

```text
REACT_APP_API_BASE_URL=https://your-backend-service.onrender.com
```

After the AWS database is available, use the RDS endpoint and password in a local `backend/.env`, then run:

```bash
cd backend
npm run db:test
npm run db:sync
```

For deployments that include database schema changes, deploy in this order:

```text
1. Deploy the backend.
2. Run any required database migration, such as backend/migrations/007-update-level-scale.sql.
3. Deploy the frontend.
```

After the frontend has its final Render URL, update the backend `FRONTEND_URL` and `FRONTEND_URLS` values in Render and redeploy the backend.

## Known Limitations

- Authentication uses localStorage and mock headers (`x-user-id`, `x-user-role`), not JWT or sessions.
- Passwords are hashed, but authentication is intentionally simple for the assignment.
- Chat room messages are live only and are not saved in MySQL.
- OpenAI usage depends on the API key quota and billing setup.
