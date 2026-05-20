const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => fetch(`${API_URL}/health`).then(handle),
  list: () => fetch(`${API_URL}/tasks`).then(handle),
  create: (task) =>
    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }).then(handle),
  update: (id, updates) =>
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(handle),
  remove: (id) =>
    fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' }).then(handle),
};
