# BeaverUP Frontend

React frontend for BeaverUP, a structured language performance trainer for spoken fluency.

## Install

```bash
npm install
```

## Run Backend

Start the backend first from the project root:

```bash
npm start
```

Backend API base URL:

```txt
http://localhost:3000
```

## Run Frontend

Start the frontend from the `frontend` folder:

```bash
npm start
```

Frontend URL:

```txt
http://localhost:5173
```

## Pages

```txt
/login
/signup
/dashboard
/workspace
/progress
/history
/settings
```

## Backend Endpoints Used

```txt
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/users/me
PUT  /users/:id
GET  /learning-items/user/:userId
GET  /interactions/user/:userId
POST /interactions
```

## Mock Auth

Login and signup are connected to the backend. The logged-in mock user is stored in browser `localStorage` and used for Settings, Progress, History, Dashboard, and Workspace requests.

Passwords are mock values for Assignment 3. The backend stores:

```txt
passwordHash: "mock-password-123456"
```

Production auth should replace this with bcrypt or Argon2 password hashing.

## Mock Data Limits

The backend currently uses in-memory mock arrays. Data can survive a browser refresh, but it resets when the backend server restarts.

The AI response is currently mocked by the backend. AI API integration and live dashboard updates with sockets are planned for production.

## Build

```bash
npm run build
```


