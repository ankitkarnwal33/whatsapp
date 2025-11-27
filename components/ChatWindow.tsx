'use client'

import { useState, useEffect, useRef } from 'react'

interface Contact {
  id: string
  waNumber: string
  name: string | null
}

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  content: string
  timestamp: string
  status?: string | null
}

interface ChatWindowProps {
  contact: Contact
  onMessageSent: () => void
  onChatDeleted: () => void
}

export default function ChatWindow({
  contact,
  onMessageSent,
  onChatDeleted,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const displayName = contact.name || contact.waNumber

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}/messages`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
    // Refresh messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [contact.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.waNumber,
          message: messageText,
          contactId: contact.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to send message: ${error.error}`)
        return
      }

      setMessageText('')
      onMessageSent()
      // Refresh messages after a short delay
      setTimeout(fetchMessages, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const handleDeleteChat = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      setShowDeleteModal(false)
      onChatDeleted()
    } catch (error) {
      console.error('Error deleting chat:', error)
      alert('Failed to delete chat. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClearHistory = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear history')
      }

      setShowDeleteModal(false)
      fetchMessages()
    } catch (error) {
      console.error('Error clearing history:', error)
      alert('Failed to clear history. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500">{contact.waNumber}</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOutbound = message.direction === 'outbound'
              return (
                <div
                  key={message.id}
                  className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOutbound
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center justify-end mt-1 space-x-1 ${
                        isOutbound ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-xs">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {isOutbound && message.status && (
                        <span className="text-xs">
                          {message.status === 'read' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex space-x-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Chat
            </h3>
            <p className="text-gray-600 mb-6">
              What would you like to do with this conversation?
            </p>
            <div className="space-y-3">
              <button
                onClick={handleClearHistory}
                disabled={deleting}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">Clear History</div>
                <div className="text-sm text-gray-500">
                  Delete all messages but keep the contact
                </div>
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={deleting}
                className="w-full px-4 py-2 text-left border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-red-600">Delete Chat</div>
                <div className="text-sm text-gray-500">
                  Permanently delete the contact and all messages
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="mt-4 w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

