# Refactor Prompt

Use this prompt when asking Claude to refactor code in this project.

---

**Template:**

```
Refactor: [file path]
Goal: [what you want to improve — readability / performance / separation of concerns]
Constraint: [what must NOT change — API contract, DB schema, test coverage]
```

---

**Examples:**

```
Refactor: backend/services/productService.js
Goal: Extract the AI validation logic into a separate function for easier unit testing
Constraint: The public createProduct() API must not change. DB schema unchanged.
```

```
Refactor: frontend/src/pages/AddProductPage.jsx
Goal: Split the form logic and the AI result display into two separate components
Constraint: Behavior must be identical. No new Redux actions.
```

---

**Rules for refactoring in this project:**

- Never change the REST API contract (routes, request/response shape)
- Never alter the DB schema without a new migration file
- Never merge service layer into controller layer
- Always keep AI audit in `productService.createProduct`, not in the controller
