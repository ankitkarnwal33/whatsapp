import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/contacts/[id] - Delete a contact and all their messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete contact (messages will be cascade deleted due to onDelete: Cascade)
    await prisma.contact.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/contacts/[id] - Clear chat history (delete messages but keep contact)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (body.action === 'clear') {
      // Delete all messages for this contact
      await prisma.message.deleteMany({
        where: { contactId: params.id },
      })

      // Reset unread count
      await prisma.contact.update({
        where: { id: params.id },
        data: { unreadCount: 0 },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error clearing chat:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat' },
      { status: 500 }
    )
  }
}

