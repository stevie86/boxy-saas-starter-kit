// Temporary types for demo mode - replace with Prisma types when database is connected

export interface Room {
  id: string
  name: string
  type: string
  beds: number
  pricePerNight?: number
  status?: string
  description?: string
  amenities?: string
  maxOccupancy?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Booking {
  id: string
  checkIn: Date
  checkOut: Date
  status: string
  channel?: string
  totalAmount?: number
  amountPaid?: number
  paymentStatus?: string
  notes?: string
  confirmationCode?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface BookingBed {
  id: string
  bookingId: string
  roomId: string
  bedLabel: string
  pricePerNight?: number
}

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  nationality?: string
  documentType?: string
  documentId?: string
  dateOfBirth?: Date
  address?: string
  city?: string
  country?: string
  notes?: string
  blacklisted?: boolean
  createdAt?: Date
  updatedAt?: Date
}