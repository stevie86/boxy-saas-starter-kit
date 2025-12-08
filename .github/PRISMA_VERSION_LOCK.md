# 🔒 Prisma Version Lock

**Current Version:** `6.9.0`  
**Last Updated:** December 2024

## Quick Reference

### ✅ Safe Commands
```bash
npm install                    # Install dependencies (version locked)
npm ci                         # Clean install (uses lock file)
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema changes
npx prisma studio             # Open Prisma Studio
```

### ⚠️ Requires Bypass
```bash
npm update                    # Will trigger safeguard
npm install prisma@latest     # Will trigger safeguard
npm install @prisma/client@latest  # Will trigger safeguard
```

### 🔓 Bypass (Use with caution!)
```bash
ALLOW_PRISMA_UPGRADE=true npm install prisma@X.Y.Z @prisma/client@X.Y.Z
```

## Why This Exists

Prisma upgrades can break:
- Database migrations
- Schema compatibility
- Client API contracts
- Type definitions
- Query behavior

## Need to Upgrade?

See [PRISMA_UPGRADE_GUIDE.md](../PRISMA_UPGRADE_GUIDE.md) for the full process.

## Safeguard Components

1. **preinstall hook** - Runs before `npm install`
2. **check-prisma-version.js** - Validates versions
3. **.npmrc** - Enforces exact versions
4. **Documentation** - This file and upgrade guide

## Troubleshooting

**Error: "Prisma version change detected"**
- This is intentional protection
- Review what changed in package.json
- Decide if upgrade is necessary
- Follow upgrade guide if proceeding

**Bypass not working?**
- Ensure environment variable is set: `ALLOW_PRISMA_UPGRADE=true`
- Check that you're using the exact command format
- Verify you're in the project root directory
