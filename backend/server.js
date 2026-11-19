const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB if URI is provided, otherwise run with in-memory fallback store
let useMemoryStore = true;
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => { useMemoryStore = false; console.log('Connected to MongoDB'); })
    .catch(() => console.log('MongoDB unavailable, using in-memory database'));
}

let tasks = [
  { id: 1, title: "Complete Week 1 Architecture", desc: "Prepare system diagrams", priority: "High", status: "Completed", date: "2026-11-13" },
  { id: 2, title: "Build Front-End UI", desc: "Responsive HTML/CSS/JS views", priority: "High", status: "Completed", date: "2026-11-14" },
  { id: 3, title: "Develop RESTful Back-End API", desc: "Express CRUD routes & validation", priority: "Medium", status: "Pending", date: "2026-11-15" }
];

// Simple Token-Based Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  res.status(200).json({
    success: true,
    token: 'mock-jwt-token-sachin-taskflow-2026',
    user: { name: 'Sachin Kumar Yadav', email }
  });
});

// GET /api/tasks - Retrieve all tasks (supports ?status= filter)
app.get('/api/tasks', (req, res) => {
  const { status } = req.query;
  const result = status && status !== 'All'
    ? tasks.filter(t => t.status.toLowerCase() === status.toLowerCase())
    : tasks;
  res.status(200).json({ success: true, count: result.length, data: result });
});

// GET /api/tasks/:id - Retrieve a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks - Create a new task with input validation
app.post('/api/tasks', (req, res) => {
  const { title, desc, priority, status, date } = req.body;
  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and due date are required' });
  }
  const newTask = {
    id: Date.now(),
    title: title.trim(),
    desc: desc || '',
    priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
    status: ['Pending', 'Completed'].includes(status) ? status : 'Pending',
    date
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks[index] = { ...tasks[index], ...req.body, id: tasks[index].id };
  res.status(200).json({ success: true, data: tasks[index] });
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  const deleted = tasks.splice(index, 1);
  res.status(200).json({ success: true, message: 'Task deleted', data: deleted });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`TaskFlow API server running on http://localhost:${PORT}`));
}

module.exports = app;
