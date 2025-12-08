# Prisma Upgrade Guide

## ⚠️ Important: Prisma Version Lock

This project has safeguards in place to prevent accidental Prisma upgrades, which can introduce breaking changes.

**Current locked version:** `6.9.0`

## Why is Prisma locked?

Prisma upgrades can introduce:
- Breaking schema changes
- Migration incompatibilities
- Client API changes
- Database provider compatibility issues
- Performance regressions

## How to upgrade Prisma (when needed)

### 1. Review the changelog
Visit: https://github.com/prisma/prisma/releases

Check for:
- Breaking changes
- Migration requirements
- Database compatibility
- Known issues

### 2. Test in a separate branch

```bash
git checkout -b prisma-upgrade-test
```

### 3. Bypass the version check

```bash
ALLOW_PRISMA_UPGRADE=true npm install prisma@latest @prisma/client@latest
```

### 4. Update the schema if needed

```bash
npx prisma validate
npx prisma format
```

### 5. Test migrations

```bash
# Backup your database first!
npx prisma migrate dev --name upgrade_prisma
```

### 6. Run all tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 7. Update the safeguard

If the upgrade is successful, update `scripts/check-prisma-version.js`:

```javascript
const ALLOWED_PRISMA_VERSION = 'X.Y.Z'; // Update to new version
```

## Bypassing the safeguard (temporary)

If you need to bypass the check temporarily:

```bash
ALLOW_PRISMA_UPGRADE=true npm install
```

**Note:** This should only be used when you intentionally want to upgrade Prisma.

## Current database setup

- **Development:** SQLite (`file:./dev.db`)
- **Testing:** SQLite (`file:./tmp/test.db`)
- **Production:** PostgreSQL (via Docker or hosted)

## Troubleshooting

### "Prisma version change detected" error

This is intentional! It means:
1. Someone tried to upgrade Prisma (maybe via `npm update`)
2. A dependency pulled in a newer Prisma version
3. package.json was manually edited

**Solution:** Review the change and decide if you want to proceed with the upgrade.

### Accidental upgrade already happened

```bash
# Revert to locked version
git checkout package.json package-lock.json
npm install
```

## Questions?

Before upgrading Prisma, consider:
- Is this upgrade necessary?
- What problem does it solve?
- Have you tested it thoroughly?
- Are there any breaking changes?
