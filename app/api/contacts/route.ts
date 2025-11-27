import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/contacts - Get all contacts with their latest message
 * Query params: search (optional) - search by name or number
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let contacts = await prisma.contact.findMany({
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Get only the latest message
        },
      },
      orderBy: {
        updatedAt: 'desc', // Most recent conversations first
      },
    })

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase()
      contacts = contacts.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.waNumber.includes(search)
      )
    }

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

