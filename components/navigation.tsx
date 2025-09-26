"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, X, Scale, User, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Notifications } from './notifications'
import { useNotifications } from '@/hooks/use-notifications'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications()

  const getNavigation = () => {
    if (!user) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/features' },
        { name: 'How it Works', href: '/how-it-works' },
        { name: 'Lawyers', href: '/lawyers' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' },
        { name: 'FAQ', href: '/faq' },
      ]
    }

    // Role-specific navigation
    switch (user.role) {
      case 'JUDGE':
        return [
          { name: 'Dashboard', href: '/dashboard/judge' },
          { name: 'Lawyers', href: '/dashboard/judge/lawyers' },
          { name: 'Cases', href: '/dashboard/cases' },
          { name: 'Hearings', href: '/dashboard/hearings' },
          { name: 'Analytics', href: '/dashboard/analytics' },
        ]
      case 'LAWYER':
        return [
          { name: 'Dashboard', href: '/dashboard/lawyer' },
          { name: 'Directory', href: '/dashboard/lawyer/directory' },
          { name: 'Cases', href: '/dashboard/cases' },
          { name: 'Clients', href: '/dashboard/clients' },
          { name: 'Hearings', href: '/dashboard/hearings' },
        ]
      case 'CLIENT':
        return [
          { name: 'Dashboard', href: '/dashboard/client' },
          { name: 'Find Lawyers', href: '/dashboard/client/lawyers' },
          { name: 'My Cases', href: '/dashboard/cases' },
          { name: 'Messages', href: '/dashboard/messages' },
          { name: 'Documents', href: '/dashboard/documents' },
        ]
      default:
        return [
          { name: 'Home', href: '/' },
          { name: 'Features', href: '/features' },
          { name: 'How it Works', href: '/how-it-works' },
          { name: 'Lawyers', href: '/lawyers' },
          { name: 'Pricing', href: '/pricing' },
          { name: 'FAQ', href: '/faq' },
        ]
    }
  }

  const navigation = getNavigation()

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hexade-blue text-white">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hexade</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-hexade-blue',
                  pathname === item.href
                    ? 'text-hexade-blue'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Notifications 
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClearAll={clearAll}
                />
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-hexade-blue"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-700 hover:text-hexade-blue"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="hexade" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium transition-colors hover:text-hexade-blue',
                    pathname === item.href
                      ? 'text-hexade-blue bg-blue-50'
                      : 'text-gray-700'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
