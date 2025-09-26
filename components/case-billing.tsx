"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calculator, 
  Percent, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { PaymentModal } from './payment-modal'

interface CaseBillingProps {
  caseTitle: string
  caseDescription: string
  onPaymentSuccess: (amount: number, transactionId: string) => void
  isProcessing?: boolean
}

export function CaseBilling({ 
  caseTitle, 
  caseDescription, 
  onPaymentSuccess, 
  isProcessing = false 
}: CaseBillingProps) {
  const [totalAmount, setTotalAmount] = React.useState(0)
  const [advanceAmount, setAdvanceAmount] = React.useState(0)
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [paymentDescription, setPaymentDescription] = React.useState('')

  React.useEffect(() => {
    // Calculate 50% advance
    const advance = totalAmount * 0.5
    setAdvanceAmount(advance)
  }, [totalAmount])

  const handleAdvancePayment = () => {
    setPaymentDescription(`${caseTitle} - 50% Advance Payment`)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentMethod: string, transactionId: string) => {
    onPaymentSuccess(advanceAmount, transactionId)
    setShowPaymentModal(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-blue-600" />
          Case Billing
        </CardTitle>
        <CardDescription>
          Set case fees and process advance payment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Case Details */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{caseTitle}</h4>
          <p className="text-sm text-gray-600 mt-1">{caseDescription}</p>
        </div>

        {/* Billing Input */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Case Fee (₹)</Label>
          <Input
            id="totalAmount"
            type="number"
            placeholder="Enter total case fee"
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>

        {/* Advance Payment Calculation */}
        {totalAmount > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Total Case Fee:</span>
              <span className="text-lg font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Advance Payment (50%):</span>
              <span className="text-lg font-bold text-green-600">₹{advanceAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Remaining Amount:</span>
              <span>₹{(totalAmount - advanceAmount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Requirements */}
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Advance Payment Required</p>
            <p>50% advance payment must be made before case assignment. Remaining amount will be billed upon case completion.</p>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleAdvancePayment}
          disabled={isProcessing || totalAmount <= 0}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{advanceAmount.toFixed(2)} Advance
            </>
          )}
        </Button>

        {/* Payment Methods */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Secure Payment
          </div>
          <div className="flex items-center">
            <Percent className="h-3 w-3 mr-1 text-blue-500" />
            50% Advance
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-orange-500" />
            Instant Processing
          </div>
        </div>
      </CardContent>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={advanceAmount}
        description={paymentDescription}
        onPaymentSuccess={handlePaymentSuccess}
        isProcessing={isProcessing}
      />
    </Card>
  )
}
