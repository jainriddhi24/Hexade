"use client"

import React from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react'

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [openItems, setOpenItems] = React.useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is simple! Click the "Sign Up" button in the top right corner, choose your role (Lawyer, Client, or Judge), and fill out the registration form. You\'ll receive a verification email to complete the process.'
        },
        {
          question: 'What roles are available on the platform?',
          answer: 'We support three main roles: Lawyers (who manage cases and clients), Clients (who need legal representation), and Judges (who oversee court proceedings). Each role has access to different features tailored to their needs.'
        },
        {
          question: 'Is there a free trial available?',
          answer: 'Yes! We offer a 14-day free trial for all new users. No credit card required. You can explore all features and decide if Hexade is right for you before committing to a paid plan.'
        },
        {
          question: 'How do I get started with my first case?',
          answer: 'After logging in, go to your dashboard and click "Create New Case" or "Join Existing Case". Fill in the case details, upload relevant documents, and invite other parties to collaborate.'
        }
      ]
    },
    {
      title: 'Video Hearings',
      icon: '📹',
      questions: [
        {
          question: 'How do video hearings work?',
          answer: 'Video hearings are conducted through our secure, built-in video conferencing system. You can schedule hearings, send invitations to all parties, and join directly from your dashboard. The system supports screen sharing, recording, and real-time chat.'
        },
        {
          question: 'What are the technical requirements for video hearings?',
          answer: 'You need a computer, tablet, or smartphone with a camera and microphone, plus a stable internet connection. We recommend using Chrome, Firefox, or Safari browsers for the best experience.'
        },
        {
          question: 'Can I record video hearings?',
          answer: 'Yes, with proper consent from all parties, you can record hearings for later review. Recordings are stored securely and can be accessed through your case files.'
        },
        {
          question: 'What if I have technical issues during a hearing?',
          answer: 'Our support team is available 24/7 to help with technical issues. You can also use the built-in troubleshooting tools or contact support directly from the hearing room.'
        }
      ]
    },
    {
      title: 'AI Features',
      icon: '🤖',
      questions: [
        {
          question: 'What AI features are available?',
          answer: 'Our AI can analyze legal documents, generate case summaries, conduct legal research, review contracts, and provide insights on case strategy. The AI learns from your specific practice area and improves over time.'
        },
        {
          question: 'How accurate is the AI analysis?',
          answer: 'Our AI is trained on extensive legal databases and achieves high accuracy rates. However, it\'s designed to assist, not replace, human legal judgment. Always review AI suggestions with your professional expertise.'
        },
        {
          question: 'Is my data secure when using AI features?',
          answer: 'Absolutely. All data processed by our AI is encrypted and handled according to strict privacy standards. We never share your confidential information with third parties.'
        },
        {
          question: 'Can I customize the AI for my practice area?',
          answer: 'Yes! The AI can be trained on your specific practice area and preferences. You can provide feedback on AI suggestions to improve its accuracy for your particular needs.'
        }
      ]
    },
    {
      title: 'Billing & Payments',
      icon: '💳',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans. All payments are processed securely through encrypted channels.'
        },
        {
          question: 'Can I change my subscription plan?',
          answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
        },
        {
          question: 'Do you offer discounts for annual billing?',
          answer: 'Yes! Save 20% when you pay annually instead of monthly. Contact our sales team for custom enterprise pricing and volume discounts.'
        },
        {
          question: 'What happens if I cancel my subscription?',
          answer: 'You can cancel anytime with no cancellation fees. Your account will remain active until the end of your current billing period, and you can reactivate it anytime.'
        }
      ]
    },
    {
      title: 'Security & Privacy',
      icon: '🔒',
      questions: [
        {
          question: 'How secure is my data?',
          answer: 'We use enterprise-grade security including end-to-end encryption, SOC 2 Type II compliance, regular security audits, and secure data centers. Your data is protected with the same standards used by major financial institutions.'
        },
        {
          question: 'Is the platform compliant with legal industry standards?',
          answer: 'Yes, we\'re fully compliant with legal industry standards including attorney-client privilege protection, data retention policies, and jurisdiction-specific requirements.'
        },
        {
          question: 'Can I control who has access to my cases?',
          answer: 'Absolutely. You have granular control over case access, can set different permission levels for different users, and can revoke access at any time.'
        },
        {
          question: 'Where is my data stored?',
          answer: 'Your data is stored in secure, geographically distributed data centers with multiple backups and redundancy. We never store data in countries with questionable data protection laws.'
        }
      ]
    },
    {
      title: 'Support & Training',
      icon: '🎓',
      questions: [
        {
          question: 'What support options are available?',
          answer: 'We offer 24/7 email support, live chat during business hours, phone support for enterprise customers, and comprehensive documentation. Premium users get priority support.'
        },
        {
          question: 'Do you provide training for new users?',
          answer: 'Yes! We offer onboarding sessions, video tutorials, webinars, and one-on-one training sessions. Our success team will help you get the most out of the platform.'
        },
        {
          question: 'Is there a mobile app available?',
          answer: 'Yes, we have mobile apps for iOS and Android that provide full access to your cases, video hearings, and AI features on the go.'
        },
        {
          question: 'How often do you update the platform?',
          answer: 'We release updates every two weeks with new features, improvements, and security patches. Major feature releases happen quarterly.'
        }
      ]
    }
  ]

  const allQuestions = faqCategories.flatMap((category, categoryIndex) => 
    category.questions.map((q, questionIndex) => ({
      ...q,
      category: category.title,
      globalIndex: categoryIndex * 100 + questionIndex
    }))
  )

  const filteredQuestions = allQuestions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Help Center
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about Hexade's features, pricing, and how to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredQuestions.length} results for "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm ? (
            // Search Results
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
              {filteredQuestions.map((item, index) => (
                <Card key={item.globalIndex} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{item.category}</Badge>
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItem(item.globalIndex)}
                      >
                        {openItems.includes(item.globalIndex) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {openItems.includes(item.globalIndex) && (
                    <CardContent>
                      <p className="text-gray-600">{item.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            // Category View
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => {
                      const globalIndex = categoryIndex * 100 + questionIndex
                      return (
                        <Card key={questionIndex} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{item.question}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItem(globalIndex)}
                              >
                                {openItems.includes(globalIndex) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          {openItems.includes(globalIndex) && (
                            <CardContent>
                              <p className="text-gray-600">{item.answer}</p>
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is here to help. Get in touch with us through any of these channels.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MessageCircle className="h-8 w-8 text-hexade-blue mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Get instant help from our support team</p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-hexade-blue mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Call us at +1 (555) 123-4567</p>
                <Button variant="outline" className="w-full">Call Now</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 text-hexade-blue mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Send us an email at support@hexade.com</p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}