'use client'

import { useState, useEffect } from 'react'
import ChatList from '@/components/ChatList'
import ChatWindow from '@/components/ChatWindow'

interface Contact {
  id: string
  waNumber: string
  name: string | null
  unreadCount: number
  updatedAt: string
  messages: Array<{
    id: string
    content: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchContacts = async () => {
    try {
      const url = searchQuery
        ? `/api/contacts?search=${encodeURIComponent(searchQuery)}`
        : '/api/contacts'
      const response = await fetch(url)
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    // Refresh contacts every 5 seconds to get new messages
    const interval = setInterval(fetchContacts, 5000)
    return () => clearInterval(interval)
  }, [searchQuery])

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
  }

  const handleMessageSent = () => {
    // Refresh contacts and messages after sending
    fetchContacts()
    if (selectedContact) {
      // This will trigger ChatWindow to refetch messages
      setSelectedContact({ ...selectedContact })
    }
  }

  const handleChatDeleted = () => {
    setSelectedContact(null)
    fetchContacts()
  }

  return (
    <div className="flex h-full">
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <ChatList
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          loading={loading}
        />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            onMessageSent={handleMessageSent}
            onChatDeleted={handleChatDeleted}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

