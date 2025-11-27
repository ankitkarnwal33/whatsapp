import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

/**
 * API Route to send messages via WhatsApp Business API
 * 
 * POST /api/messages/send
 * Body: { to: string, message: string, contactId?: string }
 * 
 * Requires authentication (admin must be logged in)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { to, message, contactId } = body

    // Validate input
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Send message via WhatsApp API
    const whatsappResponse = await sendWhatsAppMessage({
      to,
      message,
    })

    // If contactId is provided, store the message in database
    if (contactId) {
      const timestamp = new Date()

      await prisma.message.create({
        data: {
          contactId,
          direction: 'outbound',
          content: message,
          timestamp,
          status: 'sent',
          isRead: true, // Outbound messages are considered read
        },
      })

      // Update contact's last activity
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          updatedAt: timestamp,
        },
      })
    }

    return NextResponse.json({
      success: true,
      messageId: whatsappResponse.messages?.[0]?.id,
    })
  } catch (error: any) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to send message',
      },
      { status: 500 }
    )
  }
}

