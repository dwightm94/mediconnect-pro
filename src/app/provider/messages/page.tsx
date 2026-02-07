'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardBody, Chip, Loading, EmptyState } from '@/components/ui'
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ChevronLeft, FileText } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderType: 'patient' | 'provider'
  content: string
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  patientName: string
  patientId: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

export default function ProviderMessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const mockConversations: Conversation[] = [
    {
      id: '1',
      patientName: 'Jane Doe',
      patientId: 'p1',
      lastMessage: 'Thank you for the information, Doctor!',
      lastMessageTime: '2026-02-07T10:45:00',
      unreadCount: 1,
      messages: [
        { id: 'm1', senderId: 'p1', senderName: 'Jane Doe', senderType: 'patient', content: 'Hi Dr. Chen, I have a question about my medication.', timestamp: '2026-02-07T09:00:00', read: true },
        { id: 'm2', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'Hello Jane! Of course, what would you like to know?', timestamp: '2026-02-07T09:15:00', read: true },
        { id: 'm3', senderId: 'p1', senderName: 'Jane Doe', senderType: 'patient', content: 'Should I take the Lisinopril with food or on an empty stomach?', timestamp: '2026-02-07T09:20:00', read: true },
        { id: 'm4', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'You can take Lisinopril with or without food, but try to take it at the same time each day for best results. Most patients take it in the morning.', timestamp: '2026-02-07T10:30:00', read: true },
        { id: 'm5', senderId: 'p1', senderName: 'Jane Doe', senderType: 'patient', content: 'Thank you for the information, Doctor!', timestamp: '2026-02-07T10:45:00', read: false },
      ]
    },
    {
      id: '2',
      patientName: 'John Smith',
      patientId: 'p2',
      lastMessage: 'I\'ll see you at my appointment tomorrow.',
      lastMessageTime: '2026-02-06T16:30:00',
      unreadCount: 0,
      messages: [
        { id: 'm6', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'Hi John, just a reminder about your follow-up appointment tomorrow at 3:30 PM.', timestamp: '2026-02-06T15:00:00', read: true },
        { id: 'm7', senderId: 'p2', senderName: 'John Smith', senderType: 'patient', content: 'Thanks for the reminder! Should I bring anything specific?', timestamp: '2026-02-06T15:30:00', read: true },
        { id: 'm8', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'Please bring your blood pressure log if you\'ve been tracking it, and a list of any symptoms you\'ve noticed.', timestamp: '2026-02-06T16:00:00', read: true },
        { id: 'm9', senderId: 'p2', senderName: 'John Smith', senderType: 'patient', content: 'I\'ll see you at my appointment tomorrow.', timestamp: '2026-02-06T16:30:00', read: true },
      ]
    },
    {
      id: '3',
      patientName: 'Maria Garcia',
      patientId: 'p4',
      lastMessage: 'Is there anything I should do before my first visit?',
      lastMessageTime: '2026-02-06T11:00:00',
      unreadCount: 2,
      messages: [
        { id: 'm10', senderId: 'p4', senderName: 'Maria Garcia', senderType: 'patient', content: 'Hello! I\'m a new patient and I have my first appointment scheduled for tomorrow.', timestamp: '2026-02-06T10:00:00', read: true },
        { id: 'm11', senderId: 'p4', senderName: 'Maria Garcia', senderType: 'patient', content: 'Is there anything I should do before my first visit?', timestamp: '2026-02-06T11:00:00', read: false },
      ]
    },
    {
      id: '4',
      patientName: 'David Wilson',
      patientId: 'p5',
      lastMessage: 'The new medication seems to be working well.',
      lastMessageTime: '2026-02-05T14:20:00',
      unreadCount: 0,
      messages: [
        { id: 'm12', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'Hi David, how are you feeling on the new blood pressure medication?', timestamp: '2026-02-05T13:00:00', read: true },
        { id: 'm13', senderId: 'p5', senderName: 'David Wilson', senderType: 'patient', content: 'The new medication seems to be working well. My readings have been around 125/80 this week.', timestamp: '2026-02-05T14:20:00', read: true },
      ]
    },
    {
      id: '5',
      patientName: 'Robert Chen',
      patientId: 'p3',
      lastMessage: 'I\'ll schedule the follow-up blood work.',
      lastMessageTime: '2026-02-04T09:30:00',
      unreadCount: 0,
      messages: [
        { id: 'm14', senderId: 'provider', senderName: 'You', senderType: 'provider', content: 'Robert, your cholesterol levels were a bit elevated in your last test. I\'d like to recheck in 3 months.', timestamp: '2026-02-04T09:00:00', read: true },
        { id: 'm15', senderId: 'p3', senderName: 'Robert Chen', senderType: 'patient', content: 'I\'ll schedule the follow-up blood work. Should I make any dietary changes?', timestamp: '2026-02-04T09:30:00', read: true },
      ]
    },
  ]

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const loadConversations = async () => {
    try {
      const data = await apiCall('/provider/messages').catch(() => null)
      setConversations(data?.conversations || mockConversations)
    } catch (error) {
      setConversations(mockConversations)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `new-${Date.now()}`,
      senderId: 'provider',
      senderName: 'You',
      senderType: 'provider',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    }

    try {
      await apiCall('/provider/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage
        })
      }).catch(() => null)

      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, message],
        lastMessage: newMessage,
        lastMessageTime: message.timestamp
      }

      setSelectedConversation(updatedConversation)
      setConversations(prev =>
        prev.map(c => c.id === selectedConversation.id ? updatedConversation : c)
      )
      setNewMessage('')
    } catch (error) {
      console.error('Send failed:', error)
    }
  }

  const selectConversation = (conversation: Conversation) => {
    const updatedConversation = {
      ...conversation,
      unreadCount: 0,
      messages: conversation.messages.map(m => ({ ...m, read: true }))
    }
    setSelectedConversation(updatedConversation)
    setConversations(prev =>
      prev.map(c => c.id === conversation.id ? updatedConversation : c)
    )
    setShowMobileChat(true)
  }

  const filteredConversations = conversations.filter(c =>
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  if (isLoading) {
    return <Loading text="Loading messages..." />
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Messages</h1>
        <p className="text-gray-500">
          {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Communicate with your patients'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
            />
          </div>

          <Card className="flex-1 overflow-hidden">
            <CardBody className="p-0 h-full overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations found</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-[rgba(14,234,202,0.10)]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold flex-shrink-0">
                          {conversation.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">{conversation.patientName}</h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full bg-[#0A6E6E] text-white text-xs flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className={`flex-1 flex flex-col overflow-hidden ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold">
                    {selectedConversation.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.patientName}</h3>
                    <p className="text-sm text-gray-500">Patient ID: {selectedConversation.patientId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message, index) => {
                  const showDate = index === 0 ||
                    formatMessageDate(message.timestamp) !== formatMessageDate(selectedConversation.messages[index - 1].timestamp)

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            {formatMessageDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${message.senderType === 'provider' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%]`}>
                          {message.senderType === 'patient' && (
                            <p className="text-xs text-gray-500 mb-1 ml-1">{message.senderName}</p>
                          )}
                          <div className={`p-3 rounded-2xl ${
                            message.senderType === 'provider'
                              ? 'bg-[#0A6E6E] text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${
                            message.senderType === 'provider' ? 'text-right mr-1' : 'ml-1'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="💬"
                title="Select a conversation"
                description="Choose a patient conversation to start messaging"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
