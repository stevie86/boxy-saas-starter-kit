# Database Setup Guide

## Current Configuration

This project is configured to use **SQLite** for local development (no Docker required).

### Environment Variables

Your `.env` file is configured with:
```
DATABASE_URL="file:./dev.db"
```

### Database Provider

The Prisma schema (`prisma/schema.prisma`) is set to:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Quick Start

### 1. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 2. (Optional) Seed the database

```bash
npx prisma db seed
```

### 3. View your data

```bash
npx prisma studio
```

This opens a visual database editor at http://localhost:5555

## Switching Between Databases

### Using SQLite (Current - No Docker needed)

**Pros:**
- No Docker required
- Fast setup
- Perfect for development
- Easy to reset

**Cons:**
- Not suitable for production
- Limited concurrent connections
- Some PostgreSQL features unavailable

**Setup:**
```bash
# .env
DATABASE_URL="file:./dev.db"

# prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# Apply
npx prisma db push
```

### Using PostgreSQL (Production-like)

**Pros:**
- Production parity
- Full feature set
- Better for team development
- Handles concurrent connections

**Cons:**
- Requires Docker or hosted database
- More complex setup

**Setup:**
```bash
# Start Docker container
docker-compose up -d

# .env
DATABASE_URL="postgresql://admin:admin@localhost:5432/saas-starter-kit"

# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Apply
npx prisma db push
```

## Testing

Tests use a separate SQLite database:

```bash
# Run tests (uses file:./tmp/test.db)
npm run test:integration
```

## Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

## Troubleshooting

### "Can't reach database server"

**If using SQLite:**
- Check that DATABASE_URL points to a file path
- Ensure you have write permissions in the directory

**If using PostgreSQL:**
- Verify Docker is running: `docker ps`
- Check connection string in .env
- Ensure port 5432 is not in use

### "Database schema is not in sync"

```bash
npx prisma db push
```

### "Prisma Client not generated"

```bash
npx prisma generate
```

### Reset everything

```bash
# Delete database
rm dev.db dev.db-journal

# Regenerate
npx prisma generate
npx prisma db push
```

## Schema Changes

When you modify `prisma/schema.prisma`:

1. **Validate** your changes:
   ```bash
   npx prisma validate
   ```

2. **Format** the schema:
   ```bash
   npx prisma format
   ```

3. **Apply** to database:
   ```bash
   npx prisma db push
   ```

4. **Regenerate** client:
   ```bash
   npx prisma generate
   ```

## Important Notes

- ⚠️ **Prisma version is locked** at 6.9.0 - see [PRISMA_UPGRADE_GUIDE.md](./PRISMA_UPGRADE_GUIDE.md)
- 🗄️ SQLite databases (*.db) are gitignored
- 🧪 Tests use a separate database in `/tmp/`
- 🔄 Use `npx prisma db push` for development (no migrations needed)
- 📊 Use Prisma Studio for visual database management

## Production Deployment

For production, you should:

1. Use PostgreSQL (not SQLite)
2. Use a hosted database service (AWS RDS, Heroku Postgres, etc.)
3. Set DATABASE_URL in your production environment
4. Consider using Prisma Migrate instead of db push

See deployment documentation for more details.
