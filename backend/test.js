const assert = require('assert');
const app = require('./server');

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Test GET all tasks
    const getRes = await fetch(`${baseUrl}/tasks`);
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getData.success, true);
    console.log('PASS: GET /api/tasks');

    // 2. Test POST create task
    const postRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test API Task', desc: 'Verify POST', priority: 'High', date: '2026-11-20' })
    });
    const postData = await postRes.json();
    assert.strictEqual(postRes.status, 201);
    const createdId = postData.data.id;
    console.log('PASS: POST /api/tasks');

    // 3. Test PUT update task
    const putRes = await fetch(`${baseUrl}/tasks/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    const putData = await putRes.json();
    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putData.data.status, 'Completed');
    console.log('PASS: PUT /api/tasks/:id');

    // 4. Test DELETE task
    const delRes = await fetch(`${baseUrl}/tasks/${createdId}`, { method: 'DELETE' });
    assert.strictEqual(delRes.status, 200);
    console.log('PASS: DELETE /api/tasks/:id');

    console.log('\nAll API tests passed successfully!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
  }
});
