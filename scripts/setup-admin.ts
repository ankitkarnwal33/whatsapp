/**
 * Setup script to create an initial admin user
 * 
 * Run this script once to create your admin account:
 * npx tsx scripts/setup-admin.ts
 * 
 * Or use ts-node:
 * npx ts-node scripts/setup-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('=== WhatsApp Business Dashboard - Admin Setup ===\n')

  const email = await question('Enter admin email: ')
  const password = await question('Enter admin password: ')

  if (!email || !password) {
    console.error('Email and password are required')
    process.exit(1)
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.error('User with this email already exists')
    process.exit(1)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  })

  console.log('\n✅ Admin user created successfully!')
  console.log(`Email: ${email}`)
  console.log('\nYou can now log in to the dashboard.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    rl.close()
  })

