import { prisma } from '../db'
import { Property } from '@prisma/client'

/**
 * Get the first property or create a demo one if none exists
 * This is crucial for the MVP to "just work" without complex setup
 */
export async function getFirstProperty(): Promise<Property> {
    const property = await prisma.property.findFirst()

    if (property) {
        return property
    }

    // Create default team first if needed
    let team = await prisma.team.findFirst()
    if (!team) {
        team = await prisma.team.create({
            data: {
                name: 'Demo Team',
                slug: 'demo-team',
            }
        })
    }

    // Create demo property
    return await prisma.property.create({
        data: {
            teamId: team.id,
            name: 'HostelPulse Demo Hostel',
            city: 'Lisbon',
            country: 'Portugal',
            currency: 'EUR',
            timezone: 'Europe/Lisbon'
        }
    })
}
