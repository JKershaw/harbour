# Contributing to Harbour

Thanks for your interest in contributing! This document covers what you need to know before submitting a pull request.

## Contributor License Agreement

By submitting a pull request to this repository, you agree that:

1. Your contribution is your original work, or you have the right to submit it.
2. You assign all copyright in your contribution to the project maintainer(s).
3. You grant the project maintainer(s) an irrevocable, worldwide, royalty-free license to use, modify, distribute, and relicense your contribution under any terms they choose.
4. You understand that your contribution may be relicensed in the future.

This ensures the project can evolve its licensing as needed. If you are contributing on behalf of your employer, you must have their permission to agree to these terms.

## Development Setup

```bash
git clone https://github.com/JKershaw/harbour-cat.git
cd harbour-cat/harbour
npm install
npm start        # Start the server on port 2999
```

Node.js >= 22 is required.

## Testing

This project follows test-driven development. Write failing tests first, then implement.

```bash
cd harbour
npm test                 # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests (requires: npx playwright install chromium)
npm run test:all         # All of the above
```

All tests must pass before a PR will be reviewed.

## Guidelines

- Keep runtime dependencies minimal (currently just `@jkershaw/mangodb`).
- No build step — the UI is served directly from template literals.
- ESM modules with `node:` protocol for built-ins.
- Vanilla JavaScript, no TypeScript.
- Write tests for new functionality.
- Keep changes focused — one feature or fix per PR.
