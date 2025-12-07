# HostelPulse MVP - Sprint 2 Plan

## Overview
This document outlines the plan for Sprint 2 of the HostelPulse MVP development. Sprint 2 focuses on enhancing the user interface, implementing modals and forms, and improving the overall user experience.

## Current Status
- Sprint 1 has been completed with the implementation of:
  - Session management
  - Validation schemas
  - Server actions
  - Fetch utilities
  - Basic UI pages

- Testing infrastructure has been set up but requires fixes:
  - Jest configuration needs updating
  - Missing dependencies need to be installed
  - Test files have been created but are not running properly

## Sprint 2 Goals
1. Fix testing infrastructure
2. Implement UI components for guest management
3. Implement UI components for room management
4. Implement UI components for booking management
5. Enhance dashboard with real-time data
6. Improve error handling and user feedback

## Tasks

### 1. Fix Testing Infrastructure
- [x] Update Jest configuration
- [ ] Install missing dependencies
- [ ] Fix test setup files
- [ ] Implement unit tests for validation schemas
- [ ] Implement unit tests for fetch utilities
- [ ] Implement unit tests for server actions

### 2. Guest Management UI
- [ ] Create guest list view with filtering and sorting
- [ ] Implement guest details modal
- [ ] Create guest creation form
- [ ] Implement guest editing functionality
- [ ] Add blacklist management

### 3. Room Management UI
- [ ] Create room list view with filtering by status
- [ ] Implement room details modal
- [ ] Create room creation form
- [ ] Implement room editing functionality
- [ ] Add room availability calendar

### 4. Booking Management UI
- [ ] Create booking list view with filtering by status
- [ ] Implement booking details modal
- [ ] Create booking creation form with room selection
- [ ] Implement check-in/check-out functionality
- [ ] Add booking cancellation with confirmation

### 5. Dashboard Enhancements
- [ ] Implement occupancy chart
- [ ] Add revenue summary
- [ ] Create upcoming arrivals/departures widgets
- [ ] Implement quick action buttons
- [ ] Add notification system for important events

### 6. Error Handling and User Feedback
- [ ] Implement toast notifications for actions
- [ ] Add form validation feedback
- [ ] Create error boundaries for component failures
- [ ] Implement loading states for async operations
- [ ] Add confirmation dialogs for destructive actions

## Timeline
- Week 1: Fix testing infrastructure and implement guest management UI
- Week 2: Implement room management UI and booking management UI
- Week 3: Enhance dashboard and improve error handling
- Week 4: Testing, bug fixes, and final polish

## Dependencies
- @testing-library/jest-dom
- @testing-library/react
- @testing-library/user-event
- jest-environment-jsdom

## Next Steps
1. Install missing testing dependencies:
   ```bash
   npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
   ```
2. Fix the Jest setup file to properly import testing libraries
3. Begin implementing the guest management UI components
