"use client"

import React from 'react'
import { BillingCalculator } from '@/components/billing-calculator'

export default function TestPaymentPage() {
  const [paymentProcessing, setPaymentProcessing] = React.useState(false)

  const handlePayment = async (amount: number, description: string, paymentType: string, duration?: number, billingCycle?: string) => {
    setPaymentProcessing(true)
    console.log('Payment Details:', { amount, description, paymentType, duration, billingCycle })
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false)
      alert(`Payment of ₹${amount} processed successfully!`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Payment Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Payment</h2>
            <BillingCalculator
              userRole="CLIENT"
              onCalculate={handlePayment}
              isProcessing={paymentProcessing}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Lawyer Payment</h2>
            <BillingCalculator
              userRole="LAWYER"
              onCalculate={handlePayment}
              isProcessing={paymentProcessing}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Judge Payment</h2>
            <BillingCalculator
              userRole="JUDGE"
              onCalculate={handlePayment}
              isProcessing={paymentProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
