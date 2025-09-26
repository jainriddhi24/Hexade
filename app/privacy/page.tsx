import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hexade ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                case management and hearing platform (the "Service").
              </p>
              <p>
                By using our Service, you agree to the collection and use of information in accordance 
                with this Privacy Policy. If you do not agree with the terms of this Privacy Policy, 
                please do not access the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">2.1 Personal Information</h3>
              <p>We may collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Professional information (bar number, practice areas, experience)</li>
                <li>Case-related information and documents</li>
                <li>Communication preferences and settings</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-lg font-semibold">2.2 Usage Information</h3>
              <p>We automatically collect certain information about your use of the Service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Video and audio data during hearings (with consent)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Process and manage case-related activities</li>
                <li>Facilitate video hearings and real-time communication</li>
                <li>Send important notifications and updates</li>
                <li>Improve our Service and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-semibold">4.1 Service Providers</h3>
              <p>We may share information with trusted third-party service providers who assist us in operating our Service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud storage providers (AWS S3)</li>
                <li>Email service providers (SendGrid)</li>
                <li>Payment processors</li>
                <li>Analytics providers</li>
              </ul>

              <h3 className="text-lg font-semibold">4.2 Legal Requirements</h3>
              <p>We may disclose your information if required by law or in response to valid legal requests.</p>

              <h3 className="text-lg font-semibold">4.3 Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure data transmission (HTTPS/TLS)</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication</li>
                <li>Data backup and recovery procedures</li>
              </ul>
              <p>
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we cannot 
                guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide our Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain case records as required by law</li>
              </ul>
              <p>
                When you delete your account, we will delete or anonymize your personal information, 
                except where retention is required by law or for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@hexade.com. We will respond to 
                your request within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure that such transfers comply with applicable data protection laws and implement 
                appropriate safeguards, such as standard contractual clauses or adequacy decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@hexade.com</li>
                <li><strong>Address:</strong> Hexade Legal Technologies, 123 Legal Street, Suite 100, Legal City, LC 12345</li>
                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
