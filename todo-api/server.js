const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(bodyParser.json());

// Инициализация файла данных
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Вспомогательные функции
const readTasks = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Error writing tasks file:', err);
  }
};

// Корневой путь - документация API
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to To-Do List API',
    endpoints: {
      'GET /tasks': 'Get all tasks',
      'POST /tasks': 'Create new task',
      'GET /tasks/:id': 'Get task by ID',
      'PUT /tasks/:id': 'Full update task',
      'PATCH /tasks/:id': 'Partial update task',
      'DELETE /tasks/:id': 'Delete task'
    }
  });
});

// Создание задачи
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  const tasks = readTasks();
  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// Получение всех задач
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.status(200).json(tasks);
});

// Получение задачи по ID
app.get('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
});

// Полное обновление задачи
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
    title: title || tasks[taskIndex].title,
    description: description !== undefined ? description : tasks[taskIndex].description,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed
  };

  tasks[taskIndex] = updatedTask;
  writeTasks(tasks);

  res.status(200).json(updatedTask);
});

// Частичное обновление задачи
app.patch('/tasks/:id', (req, res) => {
  const { title, description, completed } = req.body;
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
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

// Удаление задачи
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

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});