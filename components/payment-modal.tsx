"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle, 
  X,
  Lock,
  Shield,
  Clock
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  onPaymentSuccess: (paymentMethod: string, transactionId: string) => void
  isProcessing?: boolean
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  description, 
  onPaymentSuccess, 
  isProcessing = false 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = React.useState('credit_card')
  const [cardDetails, setCardDetails] = React.useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [upiId, setUpiId] = React.useState('')
  const [walletType, setWalletType] = React.useState('phonepe')

  if (!isOpen) return null

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, MasterCard, American Express',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Smartphone,
      description: 'PhonePe, Google Pay, Paytm, BHIM',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Banknote,
      description: 'All major banks',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const handlePayment = async () => {
    try {
      // Step 1: Check for existing payment
      const checkRes = await fetch('/api/payments/create-or-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: description, // Use description or pass actual caseId
          paymentType: selectedMethod,
        }),
      });
      const checkResult = await checkRes.json();
      if (!checkResult.success) {
        alert(checkResult.message);
        return;
      }

      // Step 2: Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Step 3: Create payment
      const createRes = await fetch('/api/payments/create-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          paymentType: selectedMethod,
          transactionId,
        }),
      });
      const createResult = await createRes.json();
      if (createResult.success) {
        onPaymentSuccess(selectedMethod, transactionId);
      } else {
        alert('Payment failed!');
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  } 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Complete Payment</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Secure payment processing powered by Stripe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Amount to Pay:</span>
              <span className="text-2xl font-bold text-green-600">₹{amount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Payment Method</Label>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${method.bgColor}`}>
                    <method.icon className={`h-5 w-5 ${method.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMethod === method.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Form */}
          {selectedMethod === 'credit_card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
            </div>
          )}

          {selectedMethod === 'upi' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              
              <div>
                <Label>UPI Apps</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['phonepe', 'gpay', 'paytm', 'bhim'].map((wallet) => (
                    <Button
                      key={wallet}
                      variant={walletType === wallet ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWalletType(wallet)}
                      className="capitalize"
                    >
                      {wallet}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="space-y-4">
              <div>
                <Label>Select Bank</Label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              SSL Secured
            </div>
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              PCI Compliant
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Instant Processing
            </div>
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
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
                Pay ₹{amount.toFixed(2)}
              </>
            )}
          </Button>

          {/* Payment Methods Icons */}
          <div className="flex justify-center space-x-4 text-gray-400">
            <div className="text-xs">Visa</div>
            <div className="text-xs">MasterCard</div>
            <div className="text-xs">UPI</div>
            <div className="text-xs">NetBanking</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
