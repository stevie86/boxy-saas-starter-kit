# Implementation Plan

- [x] 1. Set up core infrastructure and utilities
  - Create Prisma client singleton at `lib/db.ts`
  - Create date utility functions at `lib/utils/dates.ts` for date comparisons and range validation
  - Create occupation calculation utilities at `lib/utils/occupation.ts`
  - Set up Vitest and fast-check testing frameworks
  - _Requirements: All_

- [ ]* 1.1 Write property test for date validation
  - **Property 4: Invalid date range rejection**
  - **Validates: Requirements 2.3**

- [x] 2. Implement room data layer
  - Create room query functions at `lib/queries/rooms.ts` (getRooms, getRoomById, createRoom, getRoomOccupation)
  - Implement room occupation calculation logic that queries active bookings
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [ ]* 2.1 Write property test for occupation calculation invariant
  - **Property 13: Occupation calculation invariant**
  - **Validates: Requirements 6.3**

- [ ]* 2.2 Write property test for occupation reflects active bookings
  - **Property 14: Occupation reflects active bookings**
  - **Validates: Requirements 6.1, 6.2, 6.4**

- [x] 3. Implement room server actions
  - Create room server actions at `app/actions/rooms.ts` (createRoomAction, updateRoomAction)
  - Implement validation for room name (non-empty, no whitespace-only)
  - Implement validation for bed count (must be positive)
  - Return structured error responses for validation failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 3.1 Write property test for room creation with valid data
  - **Property 10: Room creation with valid data**
  - **Validates: Requirements 5.2**

- [ ]* 3.2 Write property test for empty room name rejection
  - **Property 11: Empty room name rejection**
  - **Validates: Requirements 5.3**

- [ ]* 3.3 Write property test for invalid bed count rejection
  - **Property 12: Invalid bed count rejection**
  - **Validates: Requirements 5.4**

- [x] 4. Implement booking data layer
  - Create booking query functions at `lib/queries/bookings.ts` (getBookings, getBookingById, createBooking, cancelBooking, getActiveBookingsForRoom)
  - Implement booking status calculation based on current date vs check-in/check-out dates
  - Implement booking sorting by check-in date
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.2_

- [ ]* 4.1 Write property test for bookings sorted by check-in date
  - **Property 6: Bookings sorted by check-in date**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Write property test for booking status calculation
  - **Property 8: Booking status calculation**
  - **Validates: Requirements 3.3, 3.4**

- [x] 5. Implement booking server actions
  - Create booking server actions at `app/actions/bookings.ts` (createBookingAction, cancelBookingAction)
  - Implement validation for check-in/check-out date range
  - Implement validation for room availability (check if room is fully occupied)
  - Implement cancellation logic that updates booking status and recalculates occupation
  - Return structured error responses for validation failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write property test for booking creation with valid data
  - **Property 3: Booking creation with valid data**
  - **Validates: Requirements 2.2**

- [ ]* 5.2 Write property test for fully occupied room rejection
  - **Property 5: Fully occupied room rejection**
  - **Validates: Requirements 2.4**

- [ ]* 5.3 Write property test for cancellation removes booking and updates occupation
  - **Property 9: Cancellation removes booking and updates occupation**
  - **Validates: Requirements 4.2, 4.4**

- [x] 6. Create touch-optimized UI components
  - Create Button component at `components/ui/Button.tsx` with 44x44px minimum touch target
  - Create Card component at `components/ui/Card.tsx` for container layouts
  - Create Input component at `components/ui/Input.tsx` with mobile-appropriate input types
  - Create Badge component at `components/ui/Badge.tsx` for status indicators
  - Style all components with CSS Modules for mobile-first responsive design
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ]* 6.1 Write property test for touch target minimum size
  - **Property 15: Touch target minimum size**
  - **Validates: Requirements 7.1**

- [ ]* 6.2 Write property test for mobile-appropriate input types
  - **Property 17: Mobile-appropriate input types**
  - **Validates: Requirements 7.4**

- [x] 7. Implement room UI components
  - Create RoomCard component at `components/rooms/RoomCard.tsx` as Server Component
  - Implement visual indicators (green/yellow/red) based on occupation status
  - Display room name, total beds, occupied beds, and available beds
  - Create RoomForm component at `components/rooms/RoomForm.tsx` as Client Component
  - Implement form validation with real-time feedback
  - _Requirements: 1.2, 1.4, 5.1_

- [ ]* 7.1 Write property test for room display completeness
  - **Property 1: Room display completeness**
  - **Validates: Requirements 1.2**

- [ ]* 7.2 Write property test for occupation visual indicators
  - **Property 2: Occupation visual indicators**
  - **Validates: Requirements 1.4**

- [x] 8. Implement booking UI components
  - Create BookingCard component at `components/bookings/BookingCard.tsx` as Server Component
  - Display guest name, room name, check-in date, check-out date, and booking status
  - Create BookingForm component at `components/bookings/BookingForm.tsx` as Client Component
  - Implement room selection with availability preview
  - Implement date pickers optimized for mobile
  - Implement form validation with real-time feedback
  - _Requirements: 2.1, 3.2, 4.1_

- [ ]* 8.1 Write property test for booking display completeness
  - **Property 7: Booking display completeness**
  - **Validates: Requirements 3.2**

- [x] 9. Create room management pages
  - Create rooms overview page at `app/(dashboard)/rooms/page.tsx` as Server Component
  - Fetch and display all rooms with occupation status
  - Create room details page at `app/(dashboard)/rooms/[id]/page.tsx`
  - Create new room page at `app/(dashboard)/rooms/new/page.tsx` with RoomForm
  - Implement client-side navigation between pages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.3, 8.4_

- [ ]* 9.1 Write property test for direct URL navigation
  - **Property 19: Direct URL navigation**
  - **Validates: Requirements 8.4**

- [x] 10. Create booking management pages
  - Create bookings list page at `app/(dashboard)/bookings/page.tsx` as Server Component
  - Fetch and display all bookings sorted by check-in date
  - Create booking details page at `app/(dashboard)/bookings/[id]/page.tsx`
  - Create new booking page at `app/(dashboard)/bookings/new/page.tsx` with BookingForm
  - Implement cancellation confirmation dialog
  - Implement client-side navigation between pages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 8.3, 8.4_

- [x] 11. Create dashboard layout and navigation
  - Create dashboard layout at `app/(dashboard)/layout.tsx`
  - Implement touch-friendly navigation menu
  - Create dashboard home page at `app/(dashboard)/page.tsx` with overview stats
  - Ensure responsive layout adapts to mobile and tablet screen sizes
  - _Requirements: 7.1, 7.2, 8.1, 8.3_

- [ ]* 11.1 Write property test for responsive layout adaptation
  - **Property 16: Responsive layout adaptation**
  - **Validates: Requirements 7.2**

- [ ]* 11.2 Write property test for client-side navigation
  - **Property 18: Client-side navigation**
  - **Validates: Requirements 8.3**

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement error handling and user feedback
  - Add error boundaries for graceful error handling
  - Implement toast notifications for success/error messages
  - Add loading states for async operations
  - Implement retry logic for database connection errors
  - Add user-friendly error messages for all validation failures
  - _Requirements: All_

- [ ] 14. Final polish and optimization
  - Optimize database queries with proper indexes
  - Add loading skeletons for better perceived performance
  - Ensure all touch targets meet 44x44px minimum
  - Test on multiple devices and browsers
  - Verify responsive design at various breakpoints
  - _Requirements: 7.1, 7.2, 8.2_

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
