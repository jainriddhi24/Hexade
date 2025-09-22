"use client"

import React from 'react'
import { CheckCircle, X, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PaymentSuccessProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  transactionId: string
  paymentMethod: string
}

export function PaymentSuccess({ 
  isOpen, 
  onClose, 
  amount, 
  transactionId, 
  paymentMethod 
}: PaymentSuccessProps) {
  if (!isOpen) return null

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
    alert('Transaction ID copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment Successful!
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Your payment of <span className="font-semibold">₹{amount.toFixed(2)}</span> has been processed successfully.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyTransactionId}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 font-mono break-all">
              {transactionId}
            </p>
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <Badge variant="outline" className="capitalize">
                {paymentMethod.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  )
}
