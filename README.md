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
    models/
    migrations/
    package.json
    .env.example
  frontend/
    public/
    src/
    package.json
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

## Environment Variables

Backend variables:

```text
PORT=3000
FRONTEND_URL=http://localhost:5173

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

Do not commit `backend/.env`. Commit only `backend/.env.example`.

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

OpenAI keys are stored only in `backend/.env`.

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

## Known Limitations

- Authentication uses localStorage and mock headers (`x-user-id`, `x-user-role`), not JWT or sessions.
- Chat room messages are not persistent.
- OpenAI usage depends on the API key quota and billing setup.
- The root package files are kept for compatibility, but the clean backend workflow is under `backend/`.

## Submission Notes

Do not include:

- `node_modules`
- `backend/.env`
- real API keys
- real passwords
- generated build folders

Include:

- source code
- `backend/.env.example`
- migrations
- README
- Postman collection
- required screenshots
- demo video
