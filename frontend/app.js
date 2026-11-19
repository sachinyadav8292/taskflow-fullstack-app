// Automatically uses relative '/api/tasks' in production (Render) and localhost when opened via Live Server
const API_BASE_URL =
  window.location.port === '5500' ? 'http://localhost:5000/api/tasks' : '/api/tasks';

// XSS Output Encoding Helper (Week 6 Security Hardening)
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function fetchTasks(status = 'All') {
  try {
    const url = status === 'All' ? API_BASE_URL : `${API_BASE_URL}?status=${status}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const result = await response.json();
    localStorage.setItem('taskflow_tasks', JSON.stringify(result.data));
    return result.data;
  } catch (error) {
    console.warn('Backend offline, using local cache:', error.message);
    return JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
  }
}

// Dashboard Logic
const taskListEl = document.getElementById('task-list');
if (taskListEl) {
  const filterEl = document.getElementById('filter-status');
  const formEl = document.getElementById('task-form');

  async function renderDashboard() {
    const allTasks = await fetchTasks('All');
    const filter = filterEl.value;
    const displayed = filter === 'All' ? allTasks : allTasks.filter((t) => t.status === filter);

    document.getElementById('total-count').textContent = allTasks.length;
    document.getElementById('pending-count').textContent = allTasks.filter(
      (t) => t.status === 'Pending'
    ).length;
    document.getElementById('completed-count').textContent = allTasks.filter(
      (t) => t.status === 'Completed'
    ).length;

    // Batch DOM insertion via DocumentFragment (Week 5 Optimization)
    taskListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    displayed.forEach((task) => {
      const item = document.createElement('div');
      item.className = 'task-item';
      item.innerHTML = `
        <div>
          <h4>${escapeHTML(task.title)}</h4>
          <small>Due: ${escapeHTML(task.date)} | Status: <strong>${escapeHTML(task.status)}</strong></small>
        </div>
        <div>
          <span class="badge ${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
          <a href="detail.html?id=${encodeURIComponent(task.id)}" class="btn-primary">View / Edit</a>
        </div>
      `;
      fragment.appendChild(item);
    });

    taskListEl.appendChild(fragment);
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formEl.querySelector('button[type="submit"]');
    const payload = {
      title: document.getElementById('task-title').value.trim(),
      desc: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      status: 'Pending',
      date: document.getElementById('task-date').value,
    };

    try {
      if (submitBtn) submitBtn.disabled = true;
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create task');
      formEl.reset();
      await renderDashboard();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  filterEl.addEventListener('change', renderDashboard);
  renderDashboard();
}

// Detail & Edit Page Logic
const editFormEl = document.getElementById('edit-form');
if (editFormEl) {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('id');

  async function loadTaskDetails() {
    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}`);
      if (!response.ok) throw new Error('Task not found');
      const { data: task } = await response.json();

      document.getElementById('edit-title').value = task.title;
      document.getElementById('edit-desc').value = task.desc;
      document.getElementById('edit-priority').value = task.priority;
      document.getElementById('edit-status').value = task.status;
      document.getElementById('edit-date').value = task.date;
    } catch (error) {
      alert('Unable to load task: ' + error.message);
    }
  }

  editFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedTask = {
      title: document.getElementById('edit-title').value.trim(),
      desc: document.getElementById('edit-desc').value.trim(),
      priority: document.getElementById('edit-priority').value,
      status: document.getElementById('edit-status').value,
      date: document.getElementById('edit-date').value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error('Failed to update task');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert('Update error: ' + error.message);
    }
  });

  document.getElementById('delete-btn').addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert('Delete error: ' + error.message);
    }
  });

  loadTaskDetails();
}
