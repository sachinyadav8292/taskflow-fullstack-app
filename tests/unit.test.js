const test = require('node:test');
const assert = require('node:assert');

// Simulated utility functions from TaskFlow Front-End & Back-End
function validateTaskInput(task) {
  const allowedPriorities = ['Low', 'Medium', 'High'];
  if (!task || !task.title || typeof task.title !== 'string' || task.title.trim().length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters long' };
  }
  if (!task.date) {
    return { valid: false, error: 'Due date is required' };
  }
  if (task.priority && !allowedPriorities.includes(task.priority)) {
    return { valid: false, error: 'Invalid priority level' };
  }
  return { valid: true };
}

function calculateTaskStats(tasks) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };
}

function filterTasksByStatus(tasks, status) {
  if (!status || status.toLowerCase() === 'all') return tasks;
  return tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
}

test('Unit Test 1: Valid task payload passes validation', () => {
  const result = validateTaskInput({
    title: 'Optimize API',
    priority: 'High',
    date: '2026-11-20',
  });
  assert.strictEqual(result.valid, true);
});

test('Unit Test 2: Empty or whitespace-only title fails validation', () => {
  const result = validateTaskInput({ title: '   ', date: '2026-11-20' });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Title must be at least 3 characters long');
});

test('Unit Test 3: Title shorter than 3 characters fails validation', () => {
  const result = validateTaskInput({ title: 'Hi', date: '2026-11-20' });
  assert.strictEqual(result.valid, false);
});

test('Unit Test 4: Missing due date fails validation', () => {
  const result = validateTaskInput({ title: 'Complete Week 5' });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Due date is required');
});

test('Unit Test 5: Unsupported priority enum fails validation', () => {
  const result = validateTaskInput({
    title: 'Deploy App',
    priority: 'Urgent',
    date: '2026-11-20',
  });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, 'Invalid priority level');
});

test('Unit Test 6: Dashboard statistics calculation & status filtering accuracy', () => {
  const sample = [
    { id: 1, title: 'Task 1', status: 'Pending' },
    { id: 2, title: 'Task 2', status: 'Completed' },
    { id: 3, title: 'Task 3', status: 'Pending' },
  ];
  const stats = calculateTaskStats(sample);
  assert.deepStrictEqual(stats, { total: 3, pending: 2, completed: 1 });

  const pendingOnly = filterTasksByStatus(sample, 'Pending');
  assert.strictEqual(pendingOnly.length, 2);
});
