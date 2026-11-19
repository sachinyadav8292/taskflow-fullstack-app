# TaskFlow - Back-End RESTful API (Week 3)

## Overview
This module provides the Node.js and Express.js RESTful API for the **TaskFlow** application, supporting authentication, full CRUD operations, input validation, and MongoDB/Mongoose schema modeling.

## Setup & Local Execution
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the API server:
   ```bash
   npm start
   ```
   The server runs at `http://localhost:5000`.
4. Run automated API tests:
   ```bash
   npm test
   ```

## API Documentation

| Method | Endpoint | Description | Request Body / Params | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication | `{ "email": "...", "password": "..." }` | `200 OK` + JWT Token |
| `GET` | `/api/tasks` | Fetch all tasks | Optional query: `?status=Pending` | `200 OK` + Array of tasks |
| `GET` | `/api/tasks/:id` | Fetch single task | URL param: `id` | `200 OK` + Task object (`404` if missing) |
| `POST` | `/api/tasks` | Create new task | `{ "title": "...", "desc": "...", "priority": "High", "date": "2026-11-20" }` | `201 Created` + Created task |
| `PUT` | `/api/tasks/:id` | Update existing task | URL param: `id`, JSON fields to update | `200 OK` + Updated task |
| `DELETE` | `/api/tasks/:id` | Delete a task | URL param: `id` | `200 OK` + Confirmation message |
