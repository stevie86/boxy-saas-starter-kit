# Technology Stack & Build System

## Core Technologies

### Frontend
- **Next.js 16** with App Router (React 19)
- **TypeScript** for type safety
- **CSS Modules** for component-scoped styling
- **Tailwind CSS** with DaisyUI components
- **React Hot Toast** for notifications

### Backend
- **Next.js API Routes** with Server Actions
- **NextAuth.js** for authentication
- **Prisma ORM** with PostgreSQL database
- **SAML Jackson** for SSO integration

### Database
- **PostgreSQL** as primary database
- **Prisma** for schema management and queries
- Multi-tenant architecture with team-based isolation

### Development Tools
- **ESLint** with TypeScript and Prettier integration
- **Husky** for git hooks
- **Jest** for testing
- **Playwright** for E2E testing

## Common Commands

### Development
```bash
pnpm dev                 # Start development server
pnpm build               # Build for production
pnpm start               # Start production server
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix ESLint issues
pnpm format              # Format code with Prettier
pnpm type-check          # TypeScript type checking
```

### Database Operations
```bash
pnpm db:generate         # Generate Prisma client
pnpm db:push             # Push schema to database
pnpm db:migrate          # Run database migrations
pnpm db:studio           # Open Prisma Studio
```

### Package Management
- **Always use pnpm** for consistency and performance
- **Clean installs**: Remove node_modules and lock files when troubleshooting
- **Missing dependencies**: Check for missing Tailwind plugins like @tailwindcss/typography

### Code Quality
```bash
npm run format:check     # Check code formatting
npm run prepare          # Install git hooks
```

## Architecture Patterns

### Multi-Tenant SaaS
- Team-based tenant isolation
- Role-based access control (RBAC)
- Subscription and billing integration
- Usage tracking and quota management

### Component Structure
- CSS Modules for styling (`.module.css`)
- Reusable UI components in `/components/ui/`
- Feature-specific components in domain folders
- Server Actions in `/app/actions/`

### Database Patterns
- Tenant isolation via `teamId` foreign keys
- Soft deletes and audit trails
- Optimistic concurrency with `updatedAt`
- Indexed queries for performance

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL="postgresql://..."     # PostgreSQL connection
NEXTAUTH_URL="http://localhost:3000" # Auth callback URL
NEXTAUTH_SECRET="your-secret"       # JWT signing secret
```

### Optional Variables
```bash
STRIPE_SECRET_KEY="sk_..."          # Stripe integration
SMTP_HOST="smtp.example.com"        # Email service
MIXPANEL_TOKEN="..."                # Analytics
```

## Deployment

### Vercel (Recommended)
- Automatic deployments from Git
- Environment variable management
- Preview deployments for branches
- Built-in analytics and monitoring

### Database Hosting
- Supabase (free tier available)
- Railway (free tier available)
- Neon (free tier available)
- AWS RDS for production