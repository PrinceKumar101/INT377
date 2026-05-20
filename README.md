# MERN Todo App L

A small MERN stack todo application.

## Structure

```
.
├── backend/   # Express + Mongoose API
└── frontend/  # React + Vite UI
```

## Setup

### Backend

```bash
cd backend
npm install
# edit .env and set MONGO_URI to your MongoDB Atlas connection string
npm run dev
```

Server runs on `http://localhost:5000`.

#### API Routes

| Method | Route             | Description                  |
| ------ | ----------------- | ---------------------------- |
| GET    | `/api/health`     | Health check + DB status     |
| GET    | `/api/tasks`      | List all tasks               |
| GET    | `/api/tasks/:id`  | Get a single task            |
| POST   | `/api/tasks`      | Create a task                |
| PUT    | `/api/tasks/:id`  | Update a task                |
| DELETE | `/api/tasks/:id`  | Delete a task                |

Task body: `{ "title": "string", "description": "string", "completed": false }`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`. It reads `VITE_API_URL` from `frontend/.env`.

## Environment Variables

**backend/.env**
```
MONGO_URI=<your mongodb atlas connection string>
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```
# INT377
# INT377
