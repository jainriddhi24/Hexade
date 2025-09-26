import React from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  MousePointer, 
  Volume2, 
  Contrast, 
  Languages, 
  CheckCircle,
  Monitor,
  Smartphone,
  Keyboard
} from 'lucide-react'

export default function AccessibilityPage() {
  const features = [
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'Comprehensive support for users with visual impairments',
      features: [
        'High contrast mode toggle',
        'Screen reader compatibility (NVDA, JAWS, VoiceOver)',
        'Keyboard navigation support',
        'Focus indicators and skip links',
        'Alternative text for all images',
        'Scalable fonts and responsive design'
      ]
    },
    {
      icon: MousePointer,
      title: 'Motor Accessibility',
      description: 'Full support for users with motor disabilities',
      features: [
        'Keyboard-only navigation',
        'Large click targets (minimum 44px)',
        'Voice control compatibility',
        'Switch navigation support',
        'Customizable interaction timeouts',
        'Drag-and-drop alternatives'
      ]
    },
    {
      icon: Volume2,
      title: 'Audio Accessibility',
      description: 'Support for users with hearing impairments',
      features: [
        'Live captions during video hearings',
        'Visual notifications for audio alerts',
        'Transcript generation and storage',
        'Sign language interpretation support',
        'Audio description for video content',
        'Vibration alerts for mobile devices'
      ]
    },
    {
      icon: Contrast,
      title: 'Cognitive Accessibility',
      description: 'Features to support users with cognitive disabilities',
      features: [
        'Clear and simple language',
        'Consistent navigation patterns',
        'Progress indicators and breadcrumbs',
        'Error prevention and clear messaging',
        'Customizable interface complexity',
        'Help and guidance throughout the process'
      ]
    }
  ]

  const standards = [
    {
      name: 'WCAG 2.1 AA',
      description: 'Web Content Accessibility Guidelines Level AA compliance',
      status: 'Compliant'
    },
    {
      name: 'Section 508',
      description: 'US Federal accessibility standards compliance',
      status: 'Compliant'
    },
    {
      name: 'ADA',
      description: 'Americans with Disabilities Act compliance',
      status: 'Compliant'
    },
    {
      name: 'EN 301 549',
      description: 'European accessibility standard compliance',
      status: 'Compliant'
    }
  ]

  const assistiveTechnologies = [
    {
      name: 'Screen Readers',
      technologies: ['NVDA', 'JAWS', 'VoiceOver', 'TalkBack', 'Orca']
    },
    {
      name: 'Voice Control',
      technologies: ['Dragon NaturallySpeaking', 'Voice Control (macOS)', 'Voice Access (Android)']
    },
    {
      name: 'Switch Navigation',
      technologies: ['Switch Control (iOS)', 'Switch Access (Android)', 'External switches']
    },
    {
      name: 'Magnification',
      technologies: ['ZoomText', 'MAGic', 'Built-in browser zoom', 'OS magnification']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Accessibility First
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Accessibility Statement
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Hexade is committed to ensuring digital accessibility for all users. We strive to provide 
            an inclusive experience that works for everyone, regardless of ability or technology used.
          </p>
        </div>

        {/* Standards Compliance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Accessibility Standards Compliance
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((standard) => (
              <Card key={standard.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{standard.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{standard.description}</p>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {standard.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Accessibility Features
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      {React.createElement(feature.icon, { className: "h-6 w-6 text-hexade-blue" })}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Support */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Platform & Technology Support
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Monitor className="h-12 w-12 text-hexade-blue" />
                </div>
                <h3 className="font-semibold text-lg mb-4">Desktop</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Windows 10/11</li>
                  <li>• macOS 10.15+</li>
                  <li>• Linux (Ubuntu, Fedora)</li>
                  <li>• Chrome, Firefox, Safari, Edge</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Smartphone className="h-12 w-12 text-hexade-blue" />
                </div>
                <h3 className="font-semibold text-lg mb-4">Mobile</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• iOS 14+</li>
                  <li>• Android 8+</li>
                  <li>• Progressive Web App</li>
                  <li>• Native app features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Keyboard className="h-12 w-12 text-hexade-blue" />
                </div>
                <h3 className="font-semibold text-lg mb-4">Input Methods</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Keyboard navigation</li>
                  <li>• Voice control</li>
                  <li>• Switch navigation</li>
                  <li>• Touch and gesture</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assistive Technologies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Supported Assistive Technologies
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assistiveTechnologies.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {category.technologies.map((tech) => (
                      <li key={tech} className="text-sm text-gray-600">
                        • {tech}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">We Value Your Feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We are continuously working to improve the accessibility of our platform. 
              If you encounter any accessibility barriers or have suggestions for improvement, 
              please let us know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:accessibility@hexade.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-hexade-blue hover:bg-blue-800"
              >
                Report Accessibility Issue
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact Support
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-2">
            This accessibility statement is reviewed and updated regularly to reflect our ongoing commitment to accessibility.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
