"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Clear read notifications
  const clearRead = useCallback(() => {
    setNotifications(prev => prev.filter(notif => !notif.read))
  }, [])

  // Simulate live notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Random notification types
      const notificationTypes = [
        {
          type: 'success' as const,
          title: 'Payment Successful',
          message: 'Your advance payment has been processed successfully.'
        },
        {
          type: 'info' as const,
          title: 'New Case Assignment',
          message: 'You have been assigned to a new case.'
        },
        {
          type: 'warning' as const,
          title: 'Payment Pending',
          message: 'Advance payment is required to proceed with case.'
        },
        {
          type: 'info' as const,
          title: 'Case Update',
          message: 'Your case status has been updated.'
        },
        {
          type: 'success' as const,
          title: 'Document Uploaded',
          message: 'New documents have been uploaded to your case.'
        }
      ]

      // 10% chance of getting a notification every 30 seconds
      if (Math.random() < 0.1) {
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        addNotification(randomNotification)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead
  }
}
