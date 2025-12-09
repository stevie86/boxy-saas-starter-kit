# Design Document: Hostel Management System

## Overview

The Hostel Management System (HMS) is a minimalistic, touch-optimized web application built with Next.js 16, React 19, and Prisma ORM. It provides hostel owners with a streamlined interface to manage bookings and monitor room occupation through any modern browser on tablets or phones. The system leverages the existing database schema and focuses on essential functionality with a mobile-first, modular architecture.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 with React 19 (App Router)
- **Backend**: Next.js API Routes with Server Actions
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: CSS Modules for component-scoped styles
- **State Management**: React Server Components with minimal client-side state

### Architectural Principles

1. **Mobile-First Design**: All components designed for touch interaction first, then enhanced for desktop
2. **Server-Centric**: Leverage React Server Components to minimize client-side JavaScript
3. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactivity
4. **Modular Components**: Self-contained, reusable UI components with clear boundaries
5. **Data Locality**: Fetch data close to where it's used to minimize prop drilling

### Application Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Dashboard shell with navigation
│   ├── rooms/
│   │   ├── page.tsx        # Room overview (Server Component)
│   │   ├── [id]/
│   │   │   └── page.tsx    # Room details
│   │   └── new/
│   │       └── page.tsx    # Create room form
│   ├── bookings/
│   │   ├── page.tsx        # Bookings list (Server Component)
│   │   ├── [id]/
│   │   │   └── page.tsx    # Booking details
│   │   └── new/
│   │       └── page.tsx    # Create booking form
│   └── page.tsx            # Dashboard home
├── actions/
│   ├── rooms.ts            # Server actions for room operations
│   └── bookings.ts         # Server actions for booking operations
├── components/
│   ├── ui/
│   │   ├── Button.tsx      # Touch-optimized button
│   │   ├── Card.tsx        # Container component
│   │   ├── Input.tsx       # Form input with mobile keyboard support
│   │   └── Badge.tsx       # Status indicator
│   ├── rooms/
│   │   ├── RoomCard.tsx    # Room display card
│   │   └── RoomForm.tsx    # Room creation/edit form (Client Component)
│   └── bookings/
│       ├── BookingCard.tsx # Booking display card
│       └── BookingForm.tsx # Booking creation form (Client Component)
└── lib/
    ├── db.ts               # Prisma client singleton
    ├── queries/
    │   ├── rooms.ts        # Room data queries
    │   └── bookings.ts     # Booking data queries
    └── utils/
        ├── dates.ts        # Date manipulation utilities
        └── occupation.ts   # Occupation calculation logic
```

## Components and Interfaces

### Data Access Layer

#### Prisma Client Singleton (`lib/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Room Queries (`lib/queries/rooms.ts`)

```typescript
export async function getRooms(propertyId: string)
export async function getRoomById(id: string)
export async function createRoom(data: CreateRoomInput)
export async function getRoomOccupation(roomId: string, date: Date)
```

#### Booking Queries (`lib/queries/bookings.ts`)

```typescript
export async function getBookings(propertyId: string, filters?: BookingFilters)
export async function getBookingById(id: string)
export async function createBooking(data: CreateBookingInput)
export async function cancelBooking(id: string)
export async function getActiveBookingsForRoom(roomId: string, date: Date)
```

### Server Actions

#### Room Actions (`app/actions/rooms.ts`)

```typescript
'use server'

export async function createRoomAction(formData: FormData)
export async function updateRoomAction(id: string, formData: FormData)
```

#### Booking Actions (`app/actions/bookings.ts`)

```typescript
'use server'

export async function createBookingAction(formData: FormData)
export async function cancelBookingAction(id: string)
```

### UI Components

#### Touch-Optimized Button (`components/ui/Button.tsx`)

- Minimum touch target: 44x44px
- Active state feedback with scale transform
- Disabled state with reduced opacity
- Variants: primary, secondary, danger

#### Room Card (`components/rooms/RoomCard.tsx`)

- Displays room name, bed count, occupation status
- Visual indicators: available (green), partial (yellow), full (red)
- Touch-friendly card layout with adequate spacing
- Server Component for optimal performance

#### Booking Form (`components/bookings/BookingForm.tsx`)

- Client Component with form validation
- Mobile-optimized date pickers
- Room selection with availability preview
- Guest name input
- Real-time validation feedback

## Data Models

### Extended Room Model

The existing Prisma `Room` model is used with computed occupation data:

```typescript
type RoomWithOccupation = Room & {
  occupiedBeds: number
  availableBeds: number
  occupationRate: number
}
```

### Extended Booking Model

The existing Prisma `Booking` model is used with related data:

```typescript
type BookingWithDetails = Booking & {
  guest: Guest | null
  beds: (BookingBed & { room: Room })[]
  property: Property
}
```

### Booking Status Enum

```typescript
type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'
```

## Data Models

### Room Occupation Calculation

The system calculates room occupation dynamically based on active bookings:

```typescript
interface OccupationCalculation {
  roomId: string
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  occupationRate: number // 0-100
  activeBookings: Booking[]
}
```

**Calculation Logic:**
1. Query all bookings where `checkIn <= currentDate` AND `checkOut > currentDate` AND `status IN ('confirmed', 'checked_in')`
2. For each booking, count the number of `BookingBed` records associated with the room
3. Sum the bed counts to get `occupiedBeds`
4. Calculate `availableBeds = totalBeds - occupiedBeds`
5. Calculate `occupationRate = (occupiedBeds / totalBeds) * 100`



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Room display completeness
*For any* room, when rendered in the UI, the display should contain the room name, total bed count, and occupied bed count.
**Validates: Requirements 1.2**

### Property 2: Occupation visual indicators
*For any* room, the visual indicator should be green when availableBeds > 0 and occupiedBeds == 0, yellow when 0 < occupiedBeds < totalBeds, and red when occupiedBeds == totalBeds.
**Validates: Requirements 1.4**

### Property 3: Booking creation with valid data
*For any* valid booking data (guest name, room, check-in date before check-out date, room not fully occupied), creating the booking should result in the booking existing in the database and the room's occupation count being updated.
**Validates: Requirements 2.2**

### Property 4: Invalid date range rejection
*For any* booking where check-out date is before or equal to check-in date, the creation should be rejected with an error.
**Validates: Requirements 2.3**

### Property 5: Fully occupied room rejection
*For any* room where occupiedBeds equals totalBeds, attempting to create a new booking should be rejected with an error.
**Validates: Requirements 2.4**

### Property 6: Bookings sorted by check-in date
*For any* list of bookings, they should be ordered such that for each adjacent pair, the earlier booking's check-in date is less than or equal to the later booking's check-in date.
**Validates: Requirements 3.1**

### Property 7: Booking display completeness
*For any* booking, when rendered in the UI, the display should contain guest name, room name, check-in date, check-out date, and booking status.
**Validates: Requirements 3.2**

### Property 8: Booking status calculation
*For any* booking, if the current date equals the check-in date, the status should be 'checked_in' or 'confirmed'; if the current date is after the check-out date, the status should be 'checked_out' or 'completed'.
**Validates: Requirements 3.3, 3.4**

### Property 9: Cancellation removes booking and updates occupation
*For any* booking, cancelling it should result in the booking status being 'cancelled' and the room's occupied bed count being recalculated to exclude that booking's beds.
**Validates: Requirements 4.2, 4.4**

### Property 10: Room creation with valid data
*For any* valid room data (non-empty name, positive bed count), creating the room should result in the room existing in the database with status 'available' and occupiedBeds equal to 0.
**Validates: Requirements 5.2**

### Property 11: Empty room name rejection
*For any* room name that is empty or contains only whitespace, room creation should be rejected with an error.
**Validates: Requirements 5.3**

### Property 12: Invalid bed count rejection
*For any* room with bed count less than or equal to zero, room creation should be rejected with an error.
**Validates: Requirements 5.4**

### Property 13: Occupation calculation invariant
*For any* room at any point in time, the occupied bed count should never exceed the total bed count (occupiedBeds <= totalBeds).
**Validates: Requirements 6.3**

### Property 14: Occupation reflects active bookings
*For any* room and date, the occupied bed count should equal the sum of beds from all bookings where check-in <= date < check-out and status is 'confirmed' or 'checked_in'.
**Validates: Requirements 6.1, 6.2, 6.4**

### Property 15: Touch target minimum size
*For any* interactive UI element (button, link, input), the touch target should be at least 44x44 pixels.
**Validates: Requirements 7.1**

### Property 16: Responsive layout adaptation
*For any* viewport width, the layout should adapt appropriately: single column for widths < 768px, multi-column for widths >= 768px.
**Validates: Requirements 7.2**

### Property 17: Mobile-appropriate input types
*For any* form input, the HTML input type should match the expected data: type="email" for email fields, type="tel" for phone fields, type="date" for date fields.
**Validates: Requirements 7.4**

### Property 18: Client-side navigation
*For any* navigation between views within the app, the page should not perform a full reload (no browser refresh).
**Validates: Requirements 8.3**

### Property 19: Direct URL navigation
*For any* valid route URL, navigating directly to that URL should load the correct view without requiring navigation from the home page.
**Validates: Requirements 8.4**

## Error Handling

### Validation Errors

**Client-Side Validation:**
- Form inputs validated before submission
- Real-time feedback for invalid inputs
- Clear error messages displayed inline with form fields
- Submit button disabled until form is valid

**Server-Side Validation:**
- All inputs re-validated on the server
- Business rule validation (e.g., room capacity, date conflicts)
- Return structured error responses with field-specific messages
- HTTP 400 for validation errors, 409 for conflicts

### Database Errors

**Connection Errors:**
- Retry logic with exponential backoff
- Graceful degradation with cached data when possible
- User-friendly error message: "Unable to connect. Please try again."

**Constraint Violations:**
- Unique constraint violations return specific error messages
- Foreign key violations handled gracefully
- Transaction rollback on any error

### User-Facing Error Messages

- **Booking Conflicts**: "This room is fully occupied for the selected dates. Please choose different dates or another room."
- **Invalid Dates**: "Check-out date must be after check-in date."
- **Empty Fields**: "Please fill in all required fields."
- **Network Errors**: "Connection lost. Your changes may not have been saved. Please try again."

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework for unit tests. Unit tests will focus on:

1. **Utility Functions**
   - Date manipulation functions (date comparisons, range calculations)
   - Occupation calculation logic
   - Form validation functions

2. **Server Actions**
   - Test that actions properly validate inputs
   - Test that actions return appropriate error responses
   - Test successful operation flows

3. **Component Rendering**
   - Test that components render with expected props
   - Test conditional rendering logic
   - Test error states

### Property-Based Testing

The system will use **fast-check** as the property-based testing library for TypeScript. Property-based tests will verify universal properties across many randomly generated inputs.

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for domain-specific types (rooms, bookings, dates)
- Each property test will include a comment tag referencing the design document property

**Property Test Format:**
```typescript
// Feature: hostel-management, Property 3: Booking creation with valid data
test('creating valid booking persists and updates occupation', () => {
  fc.assert(
    fc.property(validBookingArbitrary, async (bookingData) => {
      // Test implementation
    }),
    { numRuns: 100 }
  )
})
```

**Key Properties to Test:**
- Occupation calculation correctness (Properties 13, 14)
- Booking validation rules (Properties 4, 5)
- Room validation rules (Properties 11, 12)
- Data persistence round-trips (Properties 3, 10)
- Sorting and ordering (Property 6)
- UI rendering completeness (Properties 1, 2, 7)

### Integration Testing

Integration tests will verify end-to-end flows:

1. **Booking Flow**: Create room → Create booking → Verify occupation updated
2. **Cancellation Flow**: Create booking → Cancel booking → Verify occupation recalculated
3. **Date-Based Status**: Create booking → Simulate date changes → Verify status updates

### Test Data Generators

Custom generators for property-based testing:

```typescript
// Generate valid room data
const validRoomArbitrary = fc.record({
  name: fc.string({ minLength: 1 }),
  beds: fc.integer({ min: 1, max: 20 }),
  propertyId: fc.uuid()
})

// Generate valid booking data
const validBookingArbitrary = fc.record({
  guestName: fc.string({ minLength: 1 }),
  roomId: fc.uuid(),
  checkIn: fc.date(),
  checkOut: fc.date()
}).filter(b => b.checkOut > b.checkIn)

// Generate invalid date ranges
const invalidDateRangeArbitrary = fc.record({
  checkIn: fc.date(),
  checkOut: fc.date()
}).filter(b => b.checkOut <= b.checkIn)
```

## Performance Considerations

### Database Queries

1. **Occupation Calculation**: Use indexed queries on `checkIn`, `checkOut`, and `status` fields
2. **Booking Lists**: Implement pagination for properties with many bookings
3. **Room Lists**: Fetch with occupation data in a single query using joins

### Caching Strategy

1. **Room Data**: Cache room list with short TTL (30 seconds) since it changes infrequently
2. **Occupation Data**: Calculate on-demand, no caching due to frequent changes
3. **Static Assets**: Leverage Next.js automatic static optimization

### Mobile Optimization

1. **Bundle Size**: Keep client-side JavaScript minimal using Server Components
2. **Images**: Use Next.js Image component with appropriate sizes
3. **Fonts**: Use system fonts to avoid additional downloads
4. **CSS**: Use CSS Modules to eliminate unused styles

## Security Considerations

### Input Validation

- All user inputs sanitized and validated on both client and server
- SQL injection prevented by Prisma's parameterized queries
- XSS prevention through React's automatic escaping

### Authentication & Authorization

- Leverage existing authentication system (NextAuth with User/Session models)
- Property-level data isolation: users only see data for their property
- Role-based access control using existing Role enum

### Data Privacy

- Guest personal information protected by property-level isolation
- No sensitive data in URLs or client-side state
- Secure session management via existing Session model

## Deployment Considerations

### Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...
```

### Database Migrations

- Use Prisma migrations for schema changes
- Run migrations before deployment
- Backup database before major changes

### Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### Progressive Web App (Future Enhancement)

- Add manifest.json for "Add to Home Screen" capability
- Implement service worker for offline support
- Cache critical assets for faster load times
