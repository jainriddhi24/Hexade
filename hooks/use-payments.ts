
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface Payment {
  id: string
  amount: number
  description: string
  paymentType: string
  duration?: number
  billingCycle?: string
  clientId: string
  clientName: string
  clientEmail: string
  lawyerId?: string
  lawyerName?: string
  judgeId?: string
  judgeName?: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
  transactionId: string
  caseId?: string
  caseTitle?: string
  caseFee?: number
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const { user } = useAuth()

// ...existing code...

  // Add a new payment (frontend only, for demo)
  const addPayment = useCallback((payment: Omit<Payment, 'id' | 'timestamp' | 'transactionId'>) => {
    // For backend, payments should be created via API
    setPayments(prev => [
      {
        ...payment,
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      ...prev
    ])
  }, [])

  // Get payments for a specific role
  const getPaymentsForRole = useCallback((userId: string, role: string) => {
    switch (role) {
      case 'CLIENT':
        return payments.filter(p => p.clientId === userId)
      case 'LAWYER':
        return payments.filter(p => p.lawyerId === userId)
      case 'JUDGE':
        return payments.filter(p => p.judgeId === userId)
      default:
        return []
    }
  }, [payments])

  // Get total earnings for lawyer/judge
  const getTotalEarnings = useCallback((userId: string, role: string) => {
    const rolePayments = getPaymentsForRole(userId, role)
    return rolePayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }, [getPaymentsForRole])

  // Get monthly earnings
  const getMonthlyEarnings = useCallback((userId: string, role: string) => {
    const rolePayments = getPaymentsForRole(userId, role)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return rolePayments
      .filter(p => {
        const paymentDate = new Date(p.timestamp)
        return p.status === 'completed' && 
               paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + p.amount, 0)
  }, [getPaymentsForRole])

  // Fetch payments from backend for logged-in lawyer
  useEffect(() => {
    async function fetchPayments() {
      if (!user || user.role !== 'LAWYER') return;
      try {
        const response = await fetch('/api/payments/lawyer-payments');
        if (response.ok) {
          const data = await response.json();
          // Map backend payments to Payment interface
          setPayments(
            data.payments.map((p: any) => ({
              id: p.id,
              amount: p.amount,
              description: p.description,
              paymentType: p.paymentType,
              status: p.status === 'paid' ? 'completed' : p.status,
              transactionId: p.transactionId || '',
              clientId: p.clientId,
              clientName: p.client?.name || '',
              clientEmail: p.client?.email || '',
              lawyerId: p.lawyerId,
              lawyerName: p.lawyer?.name || '',
              judgeId: p.judgeId,
              judgeName: p.judge?.name || '',
              timestamp: new Date(p.createdAt),
              caseId: p.caseId,
              caseTitle: p.case?.title || '',
              caseFee: p.case?.fee || 0,
            }))
          );
        }
      } catch (error) {
        // Optionally handle error
      }
    }
    fetchPayments();
  }, [user]);
// ...existing code...

  return {
    payments,
    addPayment,
    getPaymentsForRole,
    getTotalEarnings,
    getMonthlyEarnings
  }
}
