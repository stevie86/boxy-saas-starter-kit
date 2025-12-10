# Project Structure & Organization

## Directory Layout

### Core Application Structure
```
app/                          # Next.js App Router
├── (dashboard)/             # Dashboard route group
│   ├── bookings/           # Booking management pages
│   ├── rooms/              # Room management pages
│   ├── layout.tsx          # Dashboard layout with navigation
│   └── page.tsx            # Dashboard home page
├── actions/                # Server Actions for data mutations
├── api/                    # API routes (legacy and new endpoints)
└── globals.css             # Global styles

components/                   # Reusable UI components
├── ui/                     # Base UI components (Button, Card, Input, etc.)
├── bookings/               # Booking-specific components
├── rooms/                  # Room-specific components
├── shared/                 # Shared utility components
└── layouts/                # Layout components

lib/                         # Utilities and business logic
├── queries/                # Database query functions
├── utils/                  # Helper utilities
├── zod/                    # Schema validation
├── db.ts                   # Database connection
├── auth.ts                 # Authentication config
└── prisma.ts               # Prisma client

prisma/                      # Database schema and migrations
├── migrations/             # Database migration files
├── schema.prisma           # Database schema definition
└── seed.ts                 # Database seeding script
```

## Naming Conventions

### Files and Folders
- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx` (App Router convention)
- **Components**: PascalCase (`BookingForm.tsx`)
- **Styles**: Component name + `.module.css` (`BookingForm.module.css`)
- **Utilities**: camelCase (`dateUtils.ts`)
- **Types**: PascalCase interfaces (`BookingData`)

### Database Models
- **Tables**: PascalCase singular (`Booking`, `Room`, `Guest`)
- **Fields**: camelCase (`checkIn`, `checkOut`, `totalAmount`)
- **Enums**: UPPER_CASE (`ADMIN`, `OWNER`, `MEMBER`)

## Component Organization

### UI Component Structure
```typescript
// components/ui/Button.tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  // Implementation with CSS modules
}
```

### Feature Component Structure
```typescript
// components/bookings/BookingForm.tsx
import { Button } from '@/components/ui/Button'
import styles from './BookingForm.module.css'

export function BookingForm() {
  // Feature-specific logic
}
```

## Data Layer Patterns

### Server Actions Location
- Place in `/app/actions/` directory
- Group by feature (`bookings.ts`, `rooms.ts`)
- Export named functions with clear purposes

### Database Queries
- Centralize in `/lib/queries/` directory
- One file per domain (`bookings.ts`, `rooms.ts`)
- Include tenant isolation in all queries

### Multi-Tenant Isolation
```typescript
// Always include tenant context
const bookings = await prisma.booking.findMany({
  where: {
    property: { teamId: tenantId } // Tenant isolation
  }
});
```

## Styling Conventions

### CSS Modules Pattern
- One `.module.css` file per component
- Use semantic class names (`container`, `header`, `content`)
- Leverage Tailwind utilities for common styles
- Custom CSS for component-specific styling

### Mobile-First Approach
- Design for touch interfaces first
- Use responsive breakpoints consistently
- Optimize for tablet and phone usage
- Ensure accessibility for all screen sizes

## Route Organization

### App Router Structure
```
app/
├── (dashboard)/            # Route group (doesn't affect URL)
│   ├── page.tsx           # /dashboard
│   ├── rooms/
│   │   ├── page.tsx       # /rooms
│   │   └── new/
│   │       └── page.tsx   # /rooms/new
│   └── bookings/
│       ├── page.tsx       # /bookings
│       └── new/
│           └── page.tsx   # /bookings/new
└── api/
    └── v1/                # API versioning
        └── bookings/      # RESTful endpoints
```

## Import Conventions

### Path Aliases
- Use `@/` for root-level imports
- Prefer absolute imports over relative
- Group imports: external, internal, relative

```typescript
// External libraries
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Internal components
import { Button } from '@/components/ui/Button'
import { BookingCard } from '@/components/bookings/BookingCard'

// Relative imports (when necessary)
import styles from './BookingForm.module.css'
```

## Error Handling Patterns

### Client-Side Errors
- Use React Error Boundaries for component errors
- Toast notifications for user-facing errors
- Proper loading states and error messages

### Server-Side Errors
- Structured error responses from API routes
- Proper HTTP status codes
- Tenant-aware error logging

## Testing Organization

### Test File Structure
```
__tests__/
├── lib/                   # Unit tests for utilities
├── components/            # Component tests
└── e2e/                   # End-to-end tests
    ├── auth/             # Authentication flows
    ├── bookings/         # Booking workflows
    └── rooms/            # Room management
```

### Test Naming
- Test files: `*.spec.ts` or `*.test.ts`
- Describe blocks: Feature or component name
- Test cases: "should [expected behavior] when [condition]"