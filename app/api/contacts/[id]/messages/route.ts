import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/contacts/[id]/messages - Get all messages for a contact
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: { contactId: params.id },
      orderBy: { timestamp: 'asc' },
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        contactId: params.id,
        direction: 'inbound',
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    // Reset unread count
    await prisma.contact.update({
      where: { id: params.id },
      data: { unreadCount: 0 },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

