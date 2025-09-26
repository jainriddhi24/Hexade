"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Clock, DollarSign } from 'lucide-react'
import { PaymentModal } from './payment-modal'
import { PaymentSuccess } from './payment-success'

interface BillingCalculatorProps {
  userRole: string
  onCalculate: (amount: number, description: string, paymentType: string, duration?: number) => void
  isProcessing?: boolean
  fee?: number | null
}

export function BillingCalculator({ userRole, onCalculate, isProcessing = false, fee }: BillingCalculatorProps) {
  const [paymentType, setPaymentType] = React.useState('hourly')
  const [duration, setDuration] = React.useState(1)
  const [calculatedAmount, setCalculatedAmount] = React.useState(fee || 0)
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = React.useState(false)
  const [paymentDescription, setPaymentDescription] = React.useState('')
  const [transactionId, setTransactionId] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState('')
  const [serviceFee, setServiceFee] = React.useState(0)

  const rolePricing = {
    'CLIENT': {
      hourly: 1000, // ₹1,000 per hour
      ai_analysis: 4999 // ₹4,999 fixed
    }
  }

  const calculateAmount = () => {
    const pricing = rolePricing[userRole as keyof typeof rolePricing]
    if (!pricing) return { amount: 0, description: '' }

    // Get the base case fee
    const baseFee = fee || 0
    let currentServiceFee = 0
    let description = ''

    // Calculate service fee based on type and duration
    if (paymentType === 'hourly') {
      currentServiceFee = pricing.hourly * duration
      description = `Base Case Fee + ${duration} hours @ ₹${pricing.hourly}/hour`
    } else if (paymentType === 'ai_analysis') {
      currentServiceFee = pricing.ai_analysis
      description = `Base Case Fee + AI Case Analysis`
    }

    setServiceFee(currentServiceFee)
    const total = baseFee + currentServiceFee
    return { amount: total, description }
  }

  React.useEffect(() => {
    const { amount } = calculateAmount()
    setCalculatedAmount(amount)
  }, [paymentType, duration, fee])

  const handlePayment = () => {
    const { amount, description } = calculateAmount()
    setPaymentDescription(description)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (method: string, txnId: string) => {
    const { amount, description } = calculateAmount()
    onCalculate(amount, description, paymentType, duration)
    setShowPaymentModal(false)
    setTransactionId(txnId)
    setPaymentMethod(method)
    setShowPaymentSuccess(true)
  }

  const getServiceTypes = () => [
    { value: 'hourly', label: 'Hourly Consultation' },
    { value: 'ai_analysis', label: 'AI Case Analysis' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-blue-600" />
          Billing Calculator
        </CardTitle>
        <CardDescription>
          Calculate total payment including case fee and services
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="payment-type">Service Type</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {getServiceTypes().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paymentType === 'hourly' && (
          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          {/* Base Case Fee */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Base Case Fee:</span>
            <span className="font-medium">₹{(fee || 0).toFixed(2)}</span>
          </div>

          {/* Service Fee */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Service Fee:</span>
            <span className="font-medium">₹{serviceFee.toFixed(2)}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-green-600">
              ₹{calculatedAmount.toFixed(2)}
            </span>
          </div>

          {paymentType === 'hourly' && (
            <div className="text-sm text-gray-500 mt-2">
              Service rate: ₹{rolePricing['CLIENT'].hourly}/hour
            </div>
          )}
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isProcessing || calculatedAmount <= 0}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : `Pay ₹${calculatedAmount.toFixed(2)}`}
        </Button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <div className="flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" />
            Secure payment processing
          </div>
          <div className="flex items-center justify-center">
            <DollarSign className="h-3 w-3 mr-1" />
            Real-time calculation
          </div>
        </div>
      </CardContent>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={calculatedAmount}
        description={paymentDescription}
        onPaymentSuccess={handlePaymentSuccess}
        isProcessing={isProcessing}
      />

      <PaymentSuccess
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        amount={calculatedAmount}
        transactionId={transactionId}
        paymentMethod={paymentMethod}
      />
    </Card>
  )
}