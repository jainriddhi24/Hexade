"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send,
  Search,
  Users,
  Clock,
  Paperclip,
  Smile,
  MoreVertical,
  Video,
  MessageCircle,
  User
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  messageType: string
  sender: {
    id: string
    name: string
    email: string
    role: string
  }
  hearing: {
    id: string
    scheduledAt: string
    case: {
      id: string
      title: string
      caseNumber: string
    }
  }
}

interface Hearing {
  id: string
  scheduledAt: string
  status: string
  case: {
    id: string
    title: string
    caseNumber: string
    client: { name: string; email: string }
    assignedLawyer?: { name: string; email: string }
  }
  judge?: { name: string; email: string }
  messages: Message[]
}

interface Conversation {
  id: string
  lawyer?: { id: string; name: string; email: string }
  client?: { id: string; name: string; email: string }
  cases: Array<{
    id: string
    title: string
    caseNumber: string
    status: string
  }>
  lastMessage?: any
  unreadCount: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedHearing, setSelectedHearing] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'hearings' | 'conversations'>('conversations')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHearings()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedHearing) {
      fetchMessages(selectedHearing)
    }
  }, [selectedHearing])

  useEffect(() => {
    if (selectedConversation) {
      // Clear existing messages first
      setMessages([])
      fetchConversationMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchHearings = async () => {
    try {
      const response = await fetch('/api/hearings')
      if (response.ok) {
        const data = await response.json()
        setHearings(data.hearings || [])
        if (data.hearings.length > 0 && !selectedHearing) {
          setSelectedHearing(data.hearings[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch hearings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const fetchMessages = async (hearingId: string) => {
    try {
      const response = await fetch(`/api/messages?hearingId=${hearingId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        // Fallback to sample messages if API fails
        const sampleMessages = [
          {
            id: `conv-msg-${Date.now()}-1`,
            content: "Hello! I'm here to help you with your legal queries. How can I assist you today?",
            senderId: 'ai-assistant',
            sender: { id: 'ai-assistant', name: 'AI Legal Assistant', email: 'ai@hexade.com', role: 'AI' },
            createdAt: new Date(Date.now() - 60000).toISOString(),
            messageType: 'text',
            hearing: {
              id: 'default',
              scheduledAt: new Date().toISOString(),
              case: { id: 'default', title: 'General Inquiry', caseNumber: 'N/A' }
            }
          }
        ]
        setMessages(sampleMessages)
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      if (activeTab === 'hearings' && selectedHearing) {
        // Send hearing message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hearingId: selectedHearing,
            content: newMessage.trim()
          })
        })

        if (response.ok) {
          const sentMessage = await response.json()
          setMessages(prev => [sentMessage, ...prev])
          setNewMessage('')
          await fetchHearings() // Refresh hearings to update message count
        }
      } else if (activeTab === 'conversations' && selectedConversation) {
        // Send conversation message
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newMessage.trim()
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          // Add both the original message and auto-reply to messages
          const newMessages: Message[] = []
          if (data.originalMessage) {
            newMessages.push(data.originalMessage)
          }
          if (data.message) {
            newMessages.push(data.message)
          }
          setMessages(prev => [...newMessages, ...prev])
          setNewMessage('')
          await fetchConversations() // Refresh conversations
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LAWYER': return 'bg-blue-100 text-blue-800'
      case 'CLIENT': return 'bg-green-100 text-green-800'
      case 'JUDGE': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'POSTPONED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with clients, lawyers, and judges</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            {activeTab === 'conversations' ? conversations.length : hearings.length} {activeTab === 'conversations' ? 'Conversations' : 'Hearings'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => {
            setActiveTab('conversations')
            setSelectedConversation(conversations.length > 0 ? conversations[0].id : null)
            setSelectedHearing(null)
            setMessages([])
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'conversations'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="h-4 w-4 inline mr-2" />
          Query Messages
        </button>
        <button
          onClick={() => {
            setActiveTab('hearings')
            setSelectedHearing(hearings.length > 0 ? hearings[0].id : null)
            setSelectedConversation(null)
            setMessages([])
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hearings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="h-4 w-4 inline mr-2" />
          Hearing Messages
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations/Hearings List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                {activeTab === 'conversations' ? (
                  <>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Query Messages
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Hearing Messages
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {activeTab === 'conversations' ? (
                  conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start a conversation with your lawyer</p>
                      {user?.role === 'CLIENT' && (
                        <Button 
                          onClick={() => {
                            // Trigger a refresh to get available lawyers
                            fetchConversations()
                          }}
                          className="mt-4 bg-hexade-blue hover:bg-blue-800"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start New Conversation
                        </Button>
                      )}
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation.id)
                          setSelectedHearing(null) // Clear hearing selection
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                          selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {user?.role === 'CLIENT' ? conversation.lawyer?.name : conversation.client?.name}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : 'No messages'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {(conversation as any).isGeneral ? (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  General Query
                                </Badge>
                              ) : (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  {conversation.cases.length} case{conversation.cases.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {(conversation as any).isGeneral 
                                ? 'General legal consultation' 
                                : conversation.cases.map(c => c.caseNumber).join(', ')
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  hearings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hearings with messages</p>
                      <p className="text-sm">Messages will appear here when hearings are scheduled</p>
                    </div>
                  ) : (
                    hearings.map((hearing) => (
                      <div
                        key={hearing.id}
                        onClick={() => {
                          setSelectedHearing(hearing.id)
                          setSelectedConversation(null) // Clear conversation selection
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                          selectedHearing === hearing.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Video className="h-5 w-5 text-gray-600" />
                            </div>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {hearing.case.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(hearing.scheduledAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getStatusColor(hearing.status)}`}>
                                {hearing.status}
                              </Badge>
                              {hearing.messages && hearing.messages.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {hearing.messages.length}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              Case: {hearing.case.caseNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {(selectedHearing || selectedConversation) ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {activeTab === 'conversations' ? (
                            <User className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Video className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {activeTab === 'conversations' ? (
                            selectedConversation ? (
                              conversations.find(c => c.id === selectedConversation) ? (
                                user?.role === 'CLIENT' 
                                  ? conversations.find(c => c.id === selectedConversation)?.lawyer?.name
                                  : conversations.find(c => c.id === selectedConversation)?.client?.name
                              ) : 'Select a conversation'
                            ) : 'Select a conversation'
                          ) : (
                            hearings.find(h => h.id === selectedHearing)?.case.title
                          )}
                        </CardTitle>
                        <CardDescription>
                          {activeTab === 'conversations' ? (
                            selectedConversation ? (
                              (() => {
                                const conversation = conversations.find(c => c.id === selectedConversation)
                                if (!conversation || !conversation.cases || !Array.isArray(conversation.cases)) {
                                  return 'No cases'
                                }
                                return conversation.cases.map(c => c.caseNumber).join(', ')
                              })()
                            ) : 'Select a conversation'
                          ) : (
                            `Case: ${hearings.find(h => h.id === selectedHearing)?.case.caseNumber}`
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        {activeTab === 'conversations' ? (
                          <>
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages yet</p>
                            <p className="text-sm">Send a query message to your lawyer below</p>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation below</p>
                          </>
                        )}
                      </div>
                    ) : (
                      messages
                        .slice()
                        .reverse()
                        .filter((message) => message && typeof message === 'object' && message.id && message.content)
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap">
                                {(() => {
                                  // Handle different content types
                                  const content: any = message.content
                                  if (typeof content === 'string') {
                                    return content
                                  } else if (typeof content === 'object' && content !== null) {
                                    // If content is an object, try to extract text
                                    if (content.text) {
                                      return content.text
                                    } else if (content.message) {
                                      return content.message
                                    } else if (content.content) {
                                      return content.content
                                    } else {
                                      // Fallback: stringify the object
                                      return JSON.stringify(content)
                                    }
                                  } else {
                                    return String(message.content || '')
                                  }
                                })()}
                              </div>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={activeTab === 'conversations' ? "Ask a question or send a query..." : "Type your message..."}
                        disabled={sending}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-hexade-blue hover:bg-blue-800"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  {activeTab === 'conversations' ? (
                    <>
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p>Choose a conversation from the list to send query messages</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a hearing</h3>
                      <p>Choose a hearing from the list to view messages</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}