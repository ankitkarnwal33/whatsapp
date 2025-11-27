'use client'

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

interface ChatListProps {
  contacts: Contact[]
  selectedContact: Contact | null
  onContactSelect: (contact: Contact) => void
  loading: boolean
}

export default function ChatList({
  contacts,
  selectedContact,
  onContactSelect,
  loading,
}: ChatListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500">Loading conversations...</div>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 mt-8">
          <p>No conversations yet</p>
          <p className="text-sm mt-2">
            Messages from WhatsApp will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {contacts.map((contact) => {
        const isSelected = selectedContact?.id === contact.id
        const lastMessage = contact.messages[0]
        const displayName = contact.name || contact.waNumber

        return (
          <button
            key={contact.id}
            onClick={() => onContactSelect(contact)}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {displayName}
                  </h3>
                  {contact.unreadCount > 0 && (
                    <span className="flex-shrink-0 bg-primary-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {lastMessage.content}
                  </p>
                )}
              </div>
              <div className="ml-2 flex-shrink-0 text-xs text-gray-500">
                {formatTime(contact.updatedAt)}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

