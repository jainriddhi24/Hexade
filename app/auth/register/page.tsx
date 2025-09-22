"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Scale, Eye, EyeOff, Check, X, RefreshCw, Copy } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT' as 'CLIENT' | 'LAWYER' | 'JUDGE',
    phone: '',
    // Lawyer fields
    barNumber: '',
    practiceAreas: '',
    districts: '',
    experienceYears: '',
    rating: '',
    consultationFee: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [showDeletedMessage, setShowDeletedMessage] = useState(false)
  const { register } = useAuth()

  useEffect(() => {
    if (searchParams.get('message') === 'account-deleted') {
      setShowDeletedMessage(true)
    }
  }, [searchParams])

  // Password validation
  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    return validations
  }

  const passwordValidations = validatePassword(formData.password)
  const isPasswordValid = Object.values(passwordValidations).every(Boolean)

  // Password generator
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let password = ''
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const [suggestedPassword, setSuggestedPassword] = useState('')

  useEffect(() => {
    setSuggestedPassword(generatePassword())
  }, [])

  const useSuggestedPassword = () => {
    setFormData(prev => ({ ...prev, password: suggestedPassword }))
  }

  const generateNewPassword = () => {
    setSuggestedPassword(generatePassword())
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
        barNumber: formData.barNumber || undefined,
        practiceAreas: formData.practiceAreas || undefined,
        districts: formData.districts || undefined,
        experienceYears: formData.experienceYears || undefined,
        rating: formData.rating || undefined,
        consultationFee: formData.consultationFee || undefined,
      })
      setRegistrationSuccess(true)
      // Redirect to dashboard based on role
      let dashboardUrl = '/dashboard';
      if (formData.role === 'JUDGE') dashboardUrl = '/dashboard/judge';
      else if (formData.role === 'LAWYER') dashboardUrl = '/dashboard/lawyer';
      else if (formData.role === 'CLIENT') dashboardUrl = '/dashboard/client';
      window.location.href = dashboardUrl;
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hexade-blue text-white">
              <Scale className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Hexade</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/auth/login"
            className="font-medium text-hexade-blue hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
        
        {showDeletedMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Account Deleted</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your previous account has been successfully deleted. You can now create a new account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Create your account to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Created Successfully!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your account has been created and your credentials have been saved to your browser's password manager.
                </p>
                <p className="text-xs text-gray-500">
                  You will be redirected to your dashboard shortly...
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" method="post" data-form-type="signup">
              {/* Hidden field to help browser password managers */}
              <input type="text" style={{display: 'none'}} autoComplete="username" />
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone number (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role">Account type</Label>
                <Select value={formData.role} onValueChange={(value: 'CLIENT' | 'LAWYER' | 'JUDGE') => handleInputChange('role', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="LAWYER">Lawyer</SelectItem>
                    <SelectItem value="JUDGE">Judge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lawyer-specific fields */}
              {formData.role === 'LAWYER' && (
                <>
                  <div>
                    <Label htmlFor="barNumber">Bar Number</Label>
                    <Input
                      id="barNumber"
                      name="barNumber"
                      type="text"
                      required
                      value={formData.barNumber}
                      onChange={e => handleInputChange('barNumber', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="practiceAreas">Practice Areas (comma separated)</Label>
                    <Input
                      id="practiceAreas"
                      name="practiceAreas"
                      type="text"
                      required
                      value={formData.practiceAreas}
                      onChange={e => handleInputChange('practiceAreas', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="districts">Districts (comma separated)</Label>
                    <Input
                      id="districts"
                      name="districts"
                      type="text"
                      required
                      value={formData.districts}
                      onChange={e => handleInputChange('districts', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">Experience Years</Label>
                    <Input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      required
                      value={formData.experienceYears}
                      onChange={e => handleInputChange('experienceYears', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      required
                      value={formData.rating}
                      onChange={e => handleInputChange('rating', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                    <Input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      required
                      value={formData.consultationFee}
                      onChange={e => handleInputChange('consultationFee', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={formData.password && !isPasswordValid ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Suggested Password */}
                {!formData.password && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Suggested Password:</span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={generateNewPassword}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Generate new password"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(suggestedPassword)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Copy password"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-white border border-blue-300 rounded text-sm font-mono text-gray-800">
                        {suggestedPassword}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={useSuggestedPassword}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Use This
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      This password meets all security requirements
                    </p>
                  </div>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${passwordValidations.length ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidations.length ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidations.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidations.uppercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidations.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidations.lowercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidations.number ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidations.number ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        One number
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidations.special ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidations.special ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="hexade"
                disabled={loading || !isPasswordValid || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            )}

            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-hexade-blue hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-hexade-blue hover:text-blue-500">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
