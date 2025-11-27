import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/config - Get app configuration (masked values for display)
 * Only accessible to authenticated users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const maskValue = (value: string | null | undefined) => {
      if (!value) return null
      if (value.length <= 8) return '••••••••'
      return `${value.substring(0, 4)}${'•'.repeat(value.length - 8)}${value.substring(value.length - 4)}`
    }

    return NextResponse.json({
      phoneNumberId: maskValue(process.env.WHATSAPP_PHONE_NUMBER_ID),
      businessAccountId: maskValue(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasBusinessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    )
  }
}

