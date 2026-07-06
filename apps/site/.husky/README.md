# Git Hooks (Husky)

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks to maintain code quality and prevent CI failures.

## Pre-commit Hook

The pre-commit hook runs automatically before each commit and executes [lint-staged](https://github.com/lint-staged/lint-staged) to validate staged files.

### What runs on commit:

**For JavaScript/TypeScript files (`.js`, `.jsx`, `.ts`, `.tsx`):**

- `eslint --fix` - Auto-fix linting issues
- `prettier --write` - Format code

**For JSON, Markdown, CSS files:**

- `prettier --write` - Format code

**For test files (`.test.ts`, `.test.tsx`):**

- `vitest related --run` - Run related tests

### Benefits

✅ **Prevents CI failures** from linting/formatting issues  
✅ **Auto-fixes** common issues before commit  
✅ **Runs only on staged files** (fast)  
✅ **Ensures consistent code quality** across the team

## Setup

Hooks are automatically installed when running:

```bash
npm install
```

The `prepare` script in `package.json` runs `husky` to set up the hooks.

## Skipping Hooks (Emergency Use Only)

If you absolutely need to skip the pre-commit hook:

```bash
git commit --no-verify -m "Your message"
```

**⚠️ Warning:** Only use `--no-verify` in emergencies. Skipped validations will fail in CI.

## Troubleshooting

**Hook not running?**

1. Check `.husky/pre-commit` exists and is executable
2. Run `npx husky` to reinstall hooks
3. Verify you're in a git repository

**Lint-staged failing?**

- Check the error message - it's usually a linting or test failure
- Fix the issue in your code
- Stage the fix and commit again

**Need to update hook behavior?**

- Edit `.husky/pre-commit` for hook commands
- Edit `lint-staged` config in `package.json` for file-specific tasks
