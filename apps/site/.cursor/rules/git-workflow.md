# Git Workflow Rules

## MANDATORY: Always Use Feature Branches

**NEVER commit directly to `main` branch.**

### Before Making Any Changes

1. **Check current branch:**

   ```bash
   git branch --show-current
   ```

2. **If on `main`, create a feature branch immediately:**
   ```bash
   git checkout -b cursor/<descriptive-name>-bb0e
   ```

### Branch Naming Convention

**Required format:** `cursor/<descriptive-name>-bb0e`

**Examples:**

- `cursor/add-json-ld-api-bb0e`
- `cursor/fix-relationship-arrows-bb0e`
- `cursor/update-footer-metadata-bb0e`

**Rules:**

- Prefix: Always start with `cursor/`
- Suffix: Always end with `-bb0e`
- Description: Use kebab-case (lowercase with hyphens)
- Be descriptive: Name should indicate the feature/fix

### Workflow Steps

1. **Create branch** from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b cursor/<feature-name>-bb0e
   ```

2. **Make changes and commit frequently:**

   ```bash
   git add <files>
   git commit -m "feat: description"
   ```

3. **Push to feature branch:**

   ```bash
   git push -u origin cursor/<feature-name>-bb0e
   ```

4. **Create Pull Request:**
   - Use `ManagePullRequest` tool
   - Base branch: `main`
   - Create as draft by default
   - Include detailed description

5. **After approval, merge via GitHub UI**

### Pre-Commit Checklist

Before ANY git commit:

- [ ] Confirm not on `main` branch
- [ ] Branch name follows `cursor/*-bb0e` pattern
- [ ] Changes are tested (tests passing)
- [ ] Build succeeds
- [ ] Commit message follows conventional commits format

### Emergency Direct Commits to Main

**Only allowed for:**

- Critical security hotfixes (with immediate notification)
- Deployment configuration emergencies
- **Must be discussed with team first**

### Enforcement

This rule is enforced by:

1. Cursor agent reading this file before any git operations
2. Manual verification before each commit
3. Branch protection rules on GitHub (if configured)

---

**Last Updated:** 2026-07-06
