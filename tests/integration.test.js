const test = require('node:test');
const assert = require('node:assert');
const app = require('../backend/server');

test('Integration & Performance Test Suite for TaskFlow API', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    await t.test('IT-01: POST /api/auth/login returns authentication token', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sachin@taskflow.com', password: 'password123' }),
      });
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(body.token);
    });

    await t.test('IT-02: POST /api/auth/login returns 400 on missing credentials', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sachin@taskflow.com' }),
      });
      assert.strictEqual(res.status, 400);
    });

    await t.test('IT-03: Full CRUD lifecycle (Create -> Read -> Update -> Delete) & Latency Check', async () => {
      const startTime = performance.now();

      // Create
      const createRes = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Week 5 Test Task',
          desc: 'Integration check',
          priority: 'High',
          date: '2026-11-22',
        }),
      });
      assert.strictEqual(createRes.status, 201);
      const created = (await createRes.json()).data;
      assert.ok(created.id);

      // Read
      const readRes = await fetch(`${baseUrl}/tasks/${created.id}`);
      assert.strictEqual(readRes.status, 200);

      // Update
      const updateRes = await fetch(`${baseUrl}/tasks/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      assert.strictEqual(updateRes.status, 200);
      assert.strictEqual((await updateRes.json()).data.status, 'Completed');

      // Delete
      const delRes = await fetch(`${baseUrl}/tasks/${created.id}`, { method: 'DELETE' });
      assert.strictEqual(delRes.status, 200);

      const elapsedMs = (performance.now() - startTime).toFixed(2);
      console.log(`Full CRUD Integration Cycle completed in ${elapsedMs} ms`);
      assert.ok(Number(elapsedMs) < 500, 'API CRUD lifecycle should execute under 500ms');
    });

    await t.test('IT-04: GET /api/tasks?status=Completed filters tasks accurately', async () => {
      const res = await fetch(`${baseUrl}/tasks?status=Completed`);
      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.every((task) => task.status === 'Completed'));
    });

    await t.test('IT-05: Error Handling returns 400 on missing required fields', async () => {
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc: 'Missing title and date' }),
      });
      assert.strictEqual(res.status, 400);
    });

    await t.test('IT-06: Error Handling returns 404 for non-existent or invalid Task ID', async () => {
      const res = await fetch(`${baseUrl}/tasks/invalid-id-999`);
      const body = await res.json();
      assert.strictEqual(res.status, 404);
      assert.strictEqual(body.success, false);
    });
  } finally {
    server.close();
  }
});
