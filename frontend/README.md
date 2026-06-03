# BeaverUP Frontend

React frontend for the BeaverUP language training project.

## Install

```bash
npm install
```

## Run

Start the backend first from the project root:

```bash
cd C:\Users\dekel\Desktop\beaverup
npm start
```

Then start the frontend:

```bash
cd C:\Users\dekel\Desktop\beaverup\frontend
npm start
```

Frontend URL:

```txt
http://localhost:5173
```

Backend API base URL:

```txt
http://localhost:3000
```

## Mock Auth

Login and signup are connected to the backend:

```txt
POST http://localhost:3000/api/auth/login
POST http://localhost:3000/api/auth/signup
POST http://localhost:3000/api/auth/logout
GET  http://localhost:3000/api/users/me
```

The logged-in mock user is stored in browser `localStorage` and used for Settings, Progress, History, and Workspace requests.

Passwords are mock values for Assignment 3. The backend stores:

```txt
passwordHash: "mock-password-123456"
```

Production auth should replace this with bcrypt or Argon2 password hashing.

## Test

```bash
npm test -- --watchAll=false --runInBand
```

## Build

```bash
npm run build
```
