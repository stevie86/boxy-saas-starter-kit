/**
 * Date utility functions for hostel management system
 */

/**
 * Check if a date range is valid (check-out after check-in)
 */
export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  return checkOut > checkIn
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: Date, 
  end1: Date, 
  start2: Date, 
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Check if a date is within a range (inclusive start, exclusive end)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end
}

/**
 * Get the current date without time component
 */
export function getCurrentDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Compare two dates (returns -1, 0, or 1)
 */
export function compareDates(date1: Date, date2: Date): number {
  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString)
}