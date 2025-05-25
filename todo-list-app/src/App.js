import React, { useState, useEffect } from 'react';
import { 
  Button, Input, List, Modal, Select, 
  DatePicker, Checkbox, Tag, Divider, 
  Space, notification, Badge, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, 
  DeleteOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';
import './App.css';

const { TextArea } = Input;
const { Option } = Select;

const priorityOptions = [
  { value: 'low', label: 'Низкий', color: 'green' },
  { value: 'medium', label: 'Средний', color: 'orange' },
  { value: 'high', label: 'Высокий', color: 'red' },
];

const categoryOptions = [
  'Работа',
  'Личное',
  'Покупки',
  'Здоровье',
  'Финансы',
  'Другое'
];

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Личное');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const now = dayjs();
    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        const dueDate = dayjs(task.dueDate);
        const hoursRemaining = dueDate.diff(now, 'hour');
        
        if (hoursRemaining > 0 && hoursRemaining <= 24) {
          showNotification(
            'Срок выполнения приближается',
            `Задача "${task.title}" должна быть выполнена через ${hoursRemaining} часов!`,
            'warning'
          );
        } else if (dueDate.isBefore(now)) {
          showNotification(
            'Просроченная задача',
            `Задача "${task.title}" просрочена!`,
            'error'
          );
        }
      }
    });
  }, [tasks]);

  const showNotification = (title, message, type) => {
    notification[type]({
      message: title,
      description: message,
      placement: 'topRight',
    });
  };

  const handleAddTask = () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    resetForm();
    setIsModalVisible(false);
    showNotification('Успех', 'Задача успешно добавлена!', 'success');
  };

  const handleUpdateTask = () => {
    if (!title.trim()) return;

    const updatedTasks = tasks.map(task =>
      task.id === currentTask.id
        ? {
            ...task,
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate ? dueDate.toISOString() : null,
            priority,
            category,
          }
        : task
    );

    setTasks(updatedTasks);
    resetForm();
    setIsModalVisible(false);
    showNotification('Успех', 'Задача успешно обновлена!', 'success');
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    showNotification('Успех', 'Задача успешно удалена!', 'success');
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority('medium');
    setCategory('Личное');
    setCurrentTask(null);
  };

  const openEditModal = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate ? dayjs(task.dueDate) : null);
    setPriority(task.priority);
    setCategory(task.category);
    setIsModalVisible(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'active' && !task.completed);

    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const getPriorityColor = (priority) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'gray';
  };

  const getPriorityLabel = (priority) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.label : 'Неизвестно';
  };

  const isTaskDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const now = dayjs();
    const due = dayjs(dueDate);
    return due.diff(now, 'hour') <= 24 && due.diff(now, 'hour') > 0;
  };

  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    return dayjs(dueDate).isBefore(dayjs(), 'day');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Список дел</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Добавить задачу
        </Button>
      </div>

      <Divider />

      <div className="filters">
        <Space size="large" wrap>
          <Input.Search
            placeholder="Поиск задач..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />

          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            <Option value="all">Все задачи</Option>
            <Option value="completed">Выполненные</Option>
            <Option value="active">Активные</Option>
          </Select>

          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 180 }}
          >
            <Option value="createdAt">По дате создания</Option>
            <Option value="dueDate">По сроку выполнения</Option>
            <Option value="priority">По приоритету</Option>
          </Select>
        </Space>
      </div>

      <Divider />

      <List
        itemLayout="vertical"
        dataSource={sortedTasks}
        renderItem={(task) => (
          <List.Item
            className={`task-item ${task.completed ? 'completed' : ''}`}
            actions={[
              <Space size="middle" key={`actions-${task.id}`}>
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTaskStatus(task.id)}
                >
                  {task.completed ? 'Выполнено' : 'Отметить выполненным'}
                </Checkbox>
                
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(task)}
                >
                  Редактировать
                </Button>
                
                <Popconfirm
                  title="Вы уверены, что хотите удалить эту задачу?"
                  onConfirm={() => handleDeleteTask(task.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Удалить
                  </Button>
                </Popconfirm>
              </Space>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Checkbox 
                  checked={task.completed} 
                  onChange={() => toggleTaskStatus(task.id)}
                />
              }
              title={
                <Space>
                  <span className={task.completed ? 'completed-text' : ''}>
                    {task.title}
                  </span>
                  <Tag color={getPriorityColor(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Tag>
                  <Tag>{task.category}</Tag>
                  {task.dueDate && (
                    <Badge
                      count={
                        isTaskOverdue(task.dueDate) 
                          ? 'Просрочено' 
                          : isTaskDueSoon(task.dueDate) 
                            ? 'Скоро срок' 
                            : null
                      }
                      color={
                        isTaskOverdue(task.dueDate) 
                          ? 'red' 
                          : isTaskDueSoon(task.dueDate) 
                            ? 'orange' 
                            : 'blue'
                      }
                    />
                  )}
                </Space>
              }
              description={
                <>
                  <div>{task.description}</div>
                  {task.dueDate && (
                    <div style={{ marginTop: 8 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Срок: {dayjs(task.dueDate).format('D MMM YYYY, HH:mm')}
                    </div>
                  )}
                  <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                    Создано: {dayjs(task.createdAt).format('D MMM YYYY')}
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={currentTask ? 'Редактировать задачу' : 'Добавить новую задачу'}
        visible={isModalVisible}
        onOk={currentTask ? handleUpdateTask : handleAddTask}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        okText={currentTask ? 'Обновить' : 'Добавить'}
        cancelText="Отмена"
      >
        <div className="form-item">
          <label>Название</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название задачи"
          />
        </div>

        <div className="form-item">
          <label>Описание</label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание задачи"
            rows={4}
          />
        </div>

        <div className="form-item">
          <label>Срок выполнения</label>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            value={dueDate}
            onChange={setDueDate}
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-row">
          <div className="form-item" style={{ flex: 1, marginRight: 16 }}>
            <label>Приоритет</label>
            <Select
              value={priority}
              onChange={setPriority}
              style={{ width: '100%' }}
            >
              {priorityOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form-item" style={{ flex: 1 }}>
            <label>Категория</label>
            <Select
              value={category}
              onChange={setCategory}
              style={{ width: '100%' }}
            >
              {categoryOptions.map(cat => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;