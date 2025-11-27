import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * WhatsApp Business API Webhook Handler
 * 
 * This endpoint handles incoming messages from WhatsApp Business API.
 * 
 * Setup Instructions:
 * 1. In Meta Business Suite (https://business.facebook.com/):
 *    - Go to WhatsApp > API Setup
 *    - Click "Edit" on Webhook
 *    - Set Webhook URL: https://yourdomain.com/api/webhook/whatsapp
 *    - Set Verify Token: (use WHATSAPP_VERIFY_TOKEN from .env)
 *    - Subscribe to "messages" field
 * 
 * 2. Meta will send a GET request for verification - we handle that below
 * 3. Meta will send POST requests when messages arrive - we process those
 */

// GET request: Webhook verification (required by Meta)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  // Verify the webhook
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST request: Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle different webhook event types
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || []

      for (const entry of entries) {
        const changes = entry.changes || []

        for (const change of changes) {
          if (change.field === 'messages') {
            const value = change.value

            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value.contacts?.[0])
              }
            }

            // Handle status updates (sent, delivered, read)
            if (value.statuses) {
              for (const status of value.statuses) {
                await handleStatusUpdate(status)
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle an incoming message from a user
 */
async function handleIncomingMessage(
  message: any,
  contact: any
) {
  const waNumber = message.from // WhatsApp number
  const messageId = message.id
  const text = message.text?.body || message.type // Fallback to type if no text
  const timestamp = new Date(parseInt(message.timestamp) * 1000)

  // Upsert contact (create if doesn't exist, update if exists)
  const contactData = await prisma.contact.upsert({
    where: { waNumber },
    update: {
      name: contact?.profile?.name || undefined,
      updatedAt: new Date(),
    },
    create: {
      waNumber,
      name: contact?.profile?.name || null,
      unreadCount: 1,
    },
  })

  // Store the message
  await prisma.message.create({
    data: {
      contactId: contactData.id,
      direction: 'inbound',
      content: text,
      timestamp,
      status: 'delivered', // Incoming messages are considered delivered
      isRead: false, // Mark as unread for admin
    },
  })

  // Increment unread count
  await prisma.contact.update({
    where: { id: contactData.id },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
  })

  console.log(`Received message from ${waNumber}: ${text}`)
}

/**
 * Handle status updates (sent, delivered, read)
 */
async function handleStatusUpdate(status: any) {
  const messageId = status.id
  const newStatus = status.status // "sent", "delivered", "read"

  // Find the message by WhatsApp message ID (we'd need to store this)
  // For now, we'll update the most recent outbound message for the contact
  // In a production app, you'd want to store the WhatsApp message ID
  await prisma.message.updateMany({
    where: {
      direction: 'outbound',
      status: { not: newStatus },
    },
    data: {
      status: newStatus,
    },
    take: 1, // Update only the most recent one (this is a simplification)
  })
}

