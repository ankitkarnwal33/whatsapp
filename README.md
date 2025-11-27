# WhatsApp Business Dashboard

A beautiful, minimal dashboard for managing WhatsApp Business conversations. Built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## Features

- 🔐 Simple authentication (email + password)
- 📨 Real-time message handling via WhatsApp Business API webhooks
- 💬 Beautiful chat interface with message bubbles
- 📱 Send messages directly from the dashboard
- 🔍 Search contacts by name or number
- 🗑️ Delete chats or clear message history
- 📊 Unread message badges
- ⚙️ Settings page with configuration info

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (via Prisma)
- **Authentication:** NextAuth.js
- **API:** WhatsApp Business Cloud API

## Prerequisites

- Node.js 18+ and npm
- WhatsApp Business API access (Meta Business Suite)
- A Meta Business Account with WhatsApp API configured

## Installation

1. **Clone or download this repository**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following content:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth Configuration
   # Generate a random secret: openssl rand -base64 32
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Admin User Credentials (for initial setup)
   # You'll create this user via a setup script or manually
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="changeme123"

   # WhatsApp Business API Configuration
   # Get these from Meta Business Suite: https://business.facebook.com/
   WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
   WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-account-id"
   WHATSAPP_ACCESS_TOKEN="your-access-token"
   WHATSAPP_APP_SECRET="your-app-secret"
   WHATSAPP_VERIFY_TOKEN="your-custom-verify-token"

   # Webhook URL Configuration
   # In Meta Business Suite, set your webhook URL to:
   # https://yourdomain.com/api/webhook/whatsapp
   # Use the WHATSAPP_VERIFY_TOKEN above for verification
   ```

   Edit `.env` and fill in your actual credentials:

   - `DATABASE_URL` - SQLite database path (default: `file:./dev.db`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000`)
   - `WHATSAPP_PHONE_NUMBER_ID` - From Meta Business Suite
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` - From Meta Business Suite
   - `WHATSAPP_ACCESS_TOKEN` - From Meta Business Suite
   - `WHATSAPP_VERIFY_TOKEN` - Your custom token for webhook verification

4. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create an admin user:**

   ```bash
   npx tsx scripts/setup-admin.ts
   ```

   Or manually create a user in the database (password must be hashed with bcrypt).

## Running Locally

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Log in with your admin credentials**

## WhatsApp Webhook Configuration

To receive incoming messages, you need to configure the webhook in Meta Business Suite:

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to **WhatsApp > API Setup**
3. Click **"Edit"** on the Webhook section
4. Set **Webhook URL** to: `https://yourdomain.com/api/webhook/whatsapp`
   - For local development, use a tool like [ngrok](https://ngrok.com/) to expose your local server
5. Set **Verify Token** to: (your `WHATSAPP_VERIFY_TOKEN` from `.env`)
6. Subscribe to the **"messages"** field
7. Click **"Verify and Save"**

### Local Development with ngrok

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Use this URL in Meta Business Suite: `https://abc123.ngrok.io/api/webhook/whatsapp`

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import your repository to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables:**

   - Add all variables from your `.env` file
   - Update `NEXTAUTH_URL` to your Vercel domain
   - Update `DATABASE_URL` - For production, consider using a hosted SQLite service or migrating to PostgreSQL

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Your webhook URL will be: `https://your-app.vercel.app/api/webhook/whatsapp`

### Database for Production

For production, consider:

- **SQLite on Vercel:** Works but has limitations (read-only filesystem on serverless)
- **PostgreSQL:** Recommended for production (update `DATABASE_URL` and Prisma schema)
- **Hosted SQLite:** Services like [Turso](https://turso.tech/) or [LiteFS](https://fly.io/docs/litefs/)

## Project Structure

```
whatsapp/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── contacts/               # Contact API routes
│   │   ├── messages/               # Message sending API
│   │   └── webhook/whatsapp/       # WhatsApp webhook handler
│   ├── dashboard/                  # Dashboard pages
│   ├── login/                      # Login page
│   └── layout.tsx                  # Root layout
├── components/                     # React components
├── lib/                            # Utility functions
├── prisma/
│   └── schema.prisma              # Database schema
├── scripts/
│   └── setup-admin.ts             # Admin user setup script
└── types/                          # TypeScript type definitions
```

## API Routes

- `GET /api/webhook/whatsapp` - Webhook verification
- `POST /api/webhook/whatsapp` - Handle incoming messages
- `POST /api/messages/send` - Send a message
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/[id]/messages` - Get messages for a contact
- `DELETE /api/contacts/[id]` - Delete a contact
- `PATCH /api/contacts/[id]` - Clear chat history

## Database Schema

- **User** - Admin users (authentication)
- **Contact** - WhatsApp contacts (users who have messaged)
- **Message** - All messages (inbound and outbound)

## Troubleshooting

### Webhook not receiving messages

- Verify the webhook URL is accessible (use ngrok for local dev)
- Check that the verify token matches in both `.env` and Meta Business Suite
- Ensure you've subscribed to the "messages" field
- Check the server logs for errors

### Messages not sending

- Verify `WHATSAPP_ACCESS_TOKEN` is valid and not expired
- Check that `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure phone numbers are in the correct format (country code without +)

### Authentication issues

- Make sure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL
- Check that the admin user exists in the database

## License

MIT

## Support

For issues or questions, please check the code comments or create an issue in the repository.
