'use client'

import { useState, useEffect } from 'react'

interface ConfigInfo {
  phoneNumberId: string | null
  businessAccountId: string | null
  hasPhoneNumberId: boolean
  hasBusinessAccountId: boolean
  webhookUrl: string | null
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigInfo>({
    phoneNumberId: null,
    businessAccountId: null,
    hasPhoneNumberId: false,
    hasBusinessAccountId: false,
    webhookUrl: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get webhook URL
    const webhookUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/webhook/whatsapp`
      : null

    // Fetch config from API
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const data = await response.json()
          setConfig({
            ...data,
            webhookUrl,
          })
        } else {
          setConfig({
            phoneNumberId: null,
            businessAccountId: null,
            hasPhoneNumberId: false,
            hasBusinessAccountId: false,
            webhookUrl,
          })
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        setConfig({
          phoneNumberId: null,
          businessAccountId: null,
          hasPhoneNumberId: false,
          hasBusinessAccountId: false,
          webhookUrl,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const maskValue = (value: string | null) => {
    if (!value) return 'Not configured'
    if (value.length <= 8) return '••••••••'
    return `${value.substring(0, 4)}${'•'.repeat(value.length - 8)}${value.substring(value.length - 4)}`
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Configuration Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              WhatsApp Business API Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
                  {loading ? 'Loading...' : (config.hasPhoneNumberId 
                    ? (config.phoneNumberId || 'Configured')
                    : 'Not configured')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set WHATSAPP_PHONE_NUMBER_ID in your .env file
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Account ID
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
                  {loading ? 'Loading...' : (config.hasBusinessAccountId
                    ? (config.businessAccountId || 'Configured')
                    : 'Not configured')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Set WHATSAPP_BUSINESS_ACCOUNT_ID in your .env file
                </p>
              </div>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Webhook Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm break-all">
                  {config.webhookUrl || 'Loading...'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this URL when configuring your webhook in Meta Business Suite
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  How to Configure Webhook in Meta Business Suite:
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Go to{' '}
                    <a
                      href="https://business.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Meta Business Suite
                    </a>
                  </li>
                  <li>Navigate to WhatsApp {'>'} API Setup</li>
                  <li>Click &quot;Edit&quot; on the Webhook section</li>
                  <li>Set Webhook URL to: <code className="bg-blue-100 px-1 rounded">{config.webhookUrl}</code></li>
                  <li>Set Verify Token to: <code className="bg-blue-100 px-1 rounded">(your WHATSAPP_VERIFY_TOKEN from .env)</code></li>
                  <li>Subscribe to the &quot;messages&quot; field</li>
                  <li>Click &quot;Verify and Save&quot;</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Environment Variables Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Required Environment Variables
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <span className="text-gray-600">DATABASE_URL=</span>
                <span className="text-gray-900">&quot;file:./dev.db&quot;</span>
              </div>
              <div>
                <span className="text-gray-600">NEXTAUTH_SECRET=</span>
                <span className="text-gray-900">(generate with: openssl rand -base64 32)</span>
              </div>
              <div>
                <span className="text-gray-600">NEXTAUTH_URL=</span>
                <span className="text-gray-900">&quot;http://localhost:3000&quot;</span>
              </div>
              <div>
                <span className="text-gray-600">WHATSAPP_PHONE_NUMBER_ID=</span>
                <span className="text-gray-900">(from Meta Business Suite)</span>
              </div>
              <div>
                <span className="text-gray-600">WHATSAPP_BUSINESS_ACCOUNT_ID=</span>
                <span className="text-gray-900">(from Meta Business Suite)</span>
              </div>
              <div>
                <span className="text-gray-600">WHATSAPP_ACCESS_TOKEN=</span>
                <span className="text-gray-900">(from Meta Business Suite)</span>
              </div>
              <div>
                <span className="text-gray-600">WHATSAPP_VERIFY_TOKEN=</span>
                <span className="text-gray-900">(your custom token for webhook verification)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              See .env.example file for a complete template
            </p>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              App Information
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-medium">Version:</span> 1.0.0
              </p>
              <p>
                <span className="font-medium">Framework:</span> Next.js (App Router)
              </p>
              <p>
                <span className="font-medium">Database:</span> SQLite (via Prisma)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

