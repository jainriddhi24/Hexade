"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Users, 
  Settings, 
  Scale,
  Calendar,
  MessageSquare,
  BarChart3,
  User,
  Gavel,
  Briefcase
} from 'lucide-react'

const navigation = {
  CLIENT: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Cases', href: '/dashboard/cases', icon: FileText },
    { name: 'Hearings', href: '/dashboard/hearings', icon: Video },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Find Lawyers', href: '/lawyers', icon: Users },
  ],
  LAWYER: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Cases', href: '/dashboard/cases', icon: FileText },
    { name: 'Hearings', href: '/dashboard/hearings', icon: Video },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ],
  JUDGE: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Hearings', href: '/dashboard/hearings', icon: Video },
    { name: 'Cases', href: '/dashboard/cases', icon: FileText },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Cases', href: '/dashboard/cases', icon: FileText },
    { name: 'Hearings', href: '/dashboard/hearings', icon: Video },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const userNavigation = navigation[user.role as keyof typeof navigation] || navigation.CLIENT

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm border-r">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hexade-blue text-white">
              <Scale className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">Hexade</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {userNavigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-hexade-blue text-white'
                            : 'text-gray-700 hover:text-hexade-blue hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        {React.createElement(item.icon, {
                          className: cn(
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-hexade-blue',
                            'h-6 w-6 shrink-0'
                          ),
                          'aria-hidden': 'true'
                        })}
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                href="/dashboard/settings"
                className={cn(
                  pathname === '/dashboard/settings'
                    ? 'bg-hexade-blue text-white'
                    : 'text-gray-700 hover:text-hexade-blue hover:bg-gray-50',
                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                )}
              >
                <Settings
                  className={cn(
                    pathname === '/dashboard/settings' ? 'text-white' : 'text-gray-400 group-hover:text-hexade-blue',
                    'h-6 w-6 shrink-0'
                  )}
                  aria-hidden="true"
                />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
