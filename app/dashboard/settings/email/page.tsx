"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Settings,
  AlertCircle
} from 'lucide-react'

export default function EmailSettingsPage() {
  const { user } = useAuth()
  const [testEmail, setTestEmail] = useState('')
  const [testSubject, setTestSubject] = useState('Test Email from Hexade Portal')
  const [testMessage, setTestMessage] = useState('This is a test message to verify email functionality.')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      setResult({ success: false, message: 'Please enter an email address' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          message: testMessage
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult({ 
          success: true, 
          message: `Test email sent successfully! Message ID: ${data.messageId}` 
        })
      } else {
        setResult({ 
          success: false, 
          message: `Failed to send email: ${data.error || 'Unknown error'}` 
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-gray-600">Configure and test email notifications</p>
      </div>

      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Configuration Status
          </CardTitle>
          <CardDescription>
            Current email notification settings and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email Notifications</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Check Environment Variables
            </Badge>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Required Environment Variables:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div><code className="bg-blue-100 px-2 py-1 rounded">ENABLE_EMAIL_NOTIFICATIONS=true</code></div>
              <div><code className="bg-blue-100 px-2 py-1 rounded">EMAIL_SMTP_HOST=smtp.gmail.com</code></div>
              <div><code className="bg-blue-100 px-2 py-1 rounded">EMAIL_SMTP_PORT=587</code></div>
              <div><code className="bg-blue-100 px-2 py-1 rounded">EMAIL_SMTP_USER=your-email@gmail.com</code></div>
              <div><code className="bg-blue-100 px-2 py-1 rounded">EMAIL_SMTP_PASS=your-app-password</code></div>
              <div><code className="bg-blue-100 px-2 py-1 rounded">EMAIL_FROM=noreply@hexade.com</code></div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Gmail Setup Instructions:</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Enable 2-Factor Authentication on your Gmail account</li>
              <li>Generate an App Password for this application</li>
              <li>Use your Gmail address as EMAIL_SMTP_USER</li>
              <li>Use the App Password as EMAIL_SMTP_PASS</li>
              <li>Set EMAIL_FROM to your Gmail address</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your email configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Recipient Email</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="testSubject">Subject</Label>
              <Input
                id="testSubject"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder="Test Email Subject"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="testMessage">Message</Label>
            <textarea
              id="testMessage"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your test message..."
            />
          </div>

          <Button 
            onClick={handleSendTestEmail}
            disabled={sending || !testEmail.trim()}
            className="w-full md:w-auto"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg flex items-start ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 mt-0.5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {result.success ? 'Success!' : 'Error'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Email Templates
          </CardTitle>
          <CardDescription>
            Preview of available email notification templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Welcome Email</h4>
              <p className="text-sm text-gray-600">Sent when a new user registers</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Case Created</h4>
              <p className="text-sm text-gray-600">Sent when a new case is created</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Hearing Scheduled</h4>
              <p className="text-sm text-gray-600">Sent when a hearing is scheduled</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Message Received</h4>
              <p className="text-sm text-gray-600">Sent when a new message is received</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Auto-Reply</h4>
              <p className="text-sm text-gray-600">Sent as automated response to client queries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
