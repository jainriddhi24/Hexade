"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Payment } from '@/hooks/use-payments'

interface PaymentHistoryProps {
  payments: Payment[]
  userRole: string
  onViewDetails?: (payment: Payment) => void
}

export function PaymentHistory({ payments, userRole, onViewDetails }: PaymentHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getRoleSpecificInfo = (payment: Payment) => {
    switch (userRole) {
      case 'CLIENT':
        return {
          title: payment.description,
          subtitle: payment.lawyerName ? `Lawyer: ${payment.lawyerName}` : `Judge: ${payment.judgeName}`,
          amount: payment.amount
        }
      case 'LAWYER':
        return {
          title: payment.description,
          subtitle: `Client: ${payment.clientName}`,
          amount: payment.amount
        }
      case 'JUDGE':
        return {
          title: payment.description,
          subtitle: `Client: ${payment.clientName}`,
          amount: payment.amount
        }
      default:
        return {
          title: payment.description,
          subtitle: 'Payment',
          amount: payment.amount
        }
    }
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-blue-600" />
            Payment History
          </CardTitle>
          <CardDescription>
            {userRole === 'CLIENT' ? 'Your payment history' : 'Payments received from clients'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-600">
              {userRole === 'CLIENT' 
                ? 'Start by making your first payment for legal services.'
                : 'You haven\'t received any payments from clients yet.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="mr-2 h-5 w-5 text-blue-600" />
          Payment History
        </CardTitle>
        <CardDescription>
          {userRole === 'CLIENT' ? 'Your payment history' : 'Payments received from clients'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.slice(0, 10).map((payment) => {
            const info = getRoleSpecificInfo(payment)
            return (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {info.title}
                      </p>
                      <Badge className={`ml-2 ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.subtitle}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTime(payment.timestamp)}
                      </div>
                      {payment.duration && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {payment.duration} hours
                        </div>
                      )}
                      <div className="flex items-center">
                        <Receipt className="h-3 w-3 mr-1" />
                        {payment.transactionId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.paymentType.replace('-', ' ')}
                    </p>
                  </div>
                  {onViewDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(payment)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {payments.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              View All Payments ({payments.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
