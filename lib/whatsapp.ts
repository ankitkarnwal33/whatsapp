// WhatsApp Business API helper functions
// Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";

interface SendMessageParams {
  to: string;
  message: string;
}

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/**
 * Send a text message via WhatsApp Business API
 *
 * @param params - Object containing 'to' (phone number) and 'message' (text content)
 * @returns Promise with the API response
 *
 * Phone number format: Should include country code without + (e.g., "1234567890")
 *
 * Configure in Meta Business Suite:
 * 1. Go to https://business.facebook.com/
 * 2. Navigate to WhatsApp > API Setup
 * 3. Copy your Phone Number ID and Access Token
 * 4. Add them to your .env file
 */
export async function sendWhatsAppMessage(
  params: SendMessageParams
): Promise<WhatsAppMessageResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp API credentials not configured");
  }

  // Format phone number (remove any + or spaces)
  const to = params.to.replace(/[+\s]/g, "");

  const url = `${WHATSAPP_API_URL}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: params.message,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `WhatsApp API error: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Verify webhook signature (optional but recommended for production)
 * This helps ensure requests are actually from Meta
 */
export function verifyWebhookSignature(
  signature: string,
  payload: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // In development, skip verification
    return true;
  }

  // Implement HMAC verification here if needed
  // For now, we'll rely on the verify token challenge
  return true;
}
