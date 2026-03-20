# Fix Bug Prompt

Use this prompt when asking Claude to fix a bug in this project.

---

**Template:**

```
Bug: [describe what's wrong]
File: [file path]
Expected: [what should happen]
Actual: [what is happening]
Error message: [paste error if any]

Please fix the bug. Do not refactor unrelated code. Only change what's needed.
```

---

**Examples:**

```
Bug: AI service always returns is_safe: false even for clean ingredients
File: backend/services/aiService.js
Expected: Returns is_safe: true for "water, xylitol, mint extract"
Actual: Returns is_safe: false with reason "JSON parse error"
Error message: SyntaxError: Unexpected token < in JSON at position 0

Please fix the bug. Do not refactor unrelated code.
```

```
Bug: Redux productSlice doesn't update after addProduct succeeds
File: frontend/src/redux/slices/productSlice.js
Expected: New product appears in list immediately after form submit
Actual: Product list unchanged until page refresh
```
