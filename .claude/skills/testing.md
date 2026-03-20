# Testing Guide — Clean Label E-Commerce

## Test Strategy

| Layer        | Type             | Tool         |
|--------------|------------------|--------------|
| Services     | Unit tests       | Jest         |
| Controllers  | Integration      | Supertest    |
| AI Service   | Mock + Unit      | Jest + mock  |
| Frontend     | Component        | React Testing Library |

## Key Tests to Write

### aiService.test.js
```js
// Mock OpenAI — never call real API in tests
jest.mock('openai');

test('flags ethanol as unsafe', async () => {
  OpenAI.prototype.chat = { completions: { create: jest.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({
      is_safe: false, reason: 'Contains ethanol', flagged_ingredients: ['ethanol']
    })}}]
  })}}
  const result = await analyzeIngredients('water, ethanol, mint');
  expect(result.is_safe).toBe(false);
});

test('approves clean ingredients', async () => {
  // similar setup with is_safe: true
});
```

### productService.test.js
```js
test('does not save product if AI marks unsafe', async () => {
  // mock aiService to return is_safe: false
  // assert productRepository.create is NOT called
});
```

### API integration test (Supertest)
```js
test('POST /api/products requires auth', async () => {
  const res = await request(app).post('/api/products').send({...});
  expect(res.status).toBe(401);
});
```

## Running Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## What NOT to Mock
- PostgreSQL queries in integration tests — use a test DB (`clean_label_test`)
- The product → AI → DB flow — test the full chain end-to-end at least once
