# Development Guidelines

This document contains critical information about working with this codebase. Follow these guidelines precisely.

## Repository structure

- The repository is a monorepo managed with `npm workspaces`.
- There are 3 workspaces: `frontend`, `backend` and `shared`.

## Available commands

- `npm run check -w <workspace>` - check types
- `npm run test -w <workspace>` - run tests
- `npm run lint` - lint code
- `npm run fmt` - format code

## Core Development Rules

- Before marking a task as completed, always:
  1. check types
  2. run linter
  3. run tests 
  4. run formatter
- Add comments sparsely, and focus on comments that explain the _WHY_ behind code. Don't add comments that explain the following passage of code.
- Never use the `any` type. Instead, prefer `unknown` or `never` where applicable.