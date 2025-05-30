const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(bodyParser.json());

// Helper functions
const readTasks = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        throw err;
    }
};

const writeTasks = (tasks) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
};

// Routes

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const tasks = readTasks();
    const newTask = {
        id: Date.now().toString(),
        title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    writeTasks(tasks);
    
    res.status(201).json(newTask);
});

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the To-Do API",
        endpoints: {
            getAllTasks: "GET /tasks",
            createTask: "POST /tasks",
            getTask: "GET /tasks/:id",
            updateTask: "PUT /tasks/:id",
            partialUpdate: "PATCH /tasks/:id",
            deleteTask: "DELETE /tasks/:id"
        }
    });
});

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.status(200).json(tasks);
});

// GET /tasks/:id - Get a task by ID
app.get('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(task);
});

// PUT /tasks/:id - Update a task by ID (full update)
app.put('/tasks/:id', (req, res) => {
    const { title, description, completed } = req.body;
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    if (!title && !description && completed === undefined) {
        return res.status(400).json({ error: 'At least one field (title, description, completed) is required' });
    }
    
    const updatedTask = {
        ...tasks[taskIndex],
        title: title !== undefined ? title : tasks[taskIndex].title,
        description: description !== undefined ? description : tasks[taskIndex].description,
        completed: completed !== undefined ? completed : tasks[taskIndex].completed
    };
    
    tasks[taskIndex] = updatedTask;
    writeTasks(tasks);
    
    res.status(200).json(updatedTask);
});

// PATCH /tasks/:id - Partially update a task by ID
app.patch('/tasks/:id', (req, res) => {
    const { title, description, completed } = req.body;
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    if (!title && !description && completed === undefined) {
        return res.status(400).json({ error: 'At least one field (title, description, completed) is required' });
    }
    
    const updatedTask = {
        ...tasks[taskIndex],
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed })
    };
    
    tasks[taskIndex] = updatedTask;
    writeTasks(tasks);
    
    res.status(200).json(updatedTask);
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    writeTasks(tasks);
    
    res.status(204).end();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});