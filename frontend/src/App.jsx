import { useEffect, useState } from 'react';
import { api } from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState(null);

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await api.list();
      setTasks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkHealth() {
    try {
      const data = await api.health();
      setHealth(data);
    } catch (e) {
      setHealth({ status: 'error', error: e.message });
    }
  }

  useEffect(() => {
    checkHealth();
    loadTasks();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.create({ title, description });
      setTitle('');
      setDescription('');
      loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggle(task) {
    try {
      await api.update(task._id, { completed: !task.completed });
      loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.remove(id);
      loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(task) {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  }

  async function saveEdit(id) {
    try {
      await api.update(id, { title: editTitle, description: editDescription });
      cancelEdit();
      loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>MERN Stack Todo</h1>
        <span className={`badge ${health?.status === 'ok' ? 'ok' : 'bad'}`}>
          API: {health ? health.status : '...'}
          {health?.db ? ` · DB: ${health.db}` : ''}
        </span>
      </header>

      <form onSubmit={handleCreate} className="card">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className={`task ${task.completed ? 'done' : ''}`}>
            {editingId === task._id ? (
              <div className="edit">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button onClick={() => saveEdit(task._id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                  />
                  <div>
                    <div className="title">{task.title}</div>
                    {task.description && (
                      <div className="desc">{task.description}</div>
                    )}
                  </div>
                </label>
                <div className="actions">
                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
        {!loading && tasks.length === 0 && (
          <li className="empty">No tasks yet. Add one above!</li>
        )}
      </ul>
    </div>
  );
}
