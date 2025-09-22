'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { setCookie, hasCookie } from 'cookies-next';

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isBrowser) {
      const hasConsent = hasCookie('cookie-consent');
      console.log('Cookie consent exists:', hasConsent);
      setIsVisible(!hasConsent);
    }
  }, []);

  // Function to remove all non-essential cookies
  const removeNonEssentialCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Essential cookies that should not be deleted
    const essentialCookies = ['cookie-consent'];
    
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (!essentialCookies.includes(cookieName)) {
        // Remove the cookie by setting its expiry to past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  };

  const acceptAll = () => {
    try {
      // Set consent cookie
      setCookie('cookie-consent', 'accepted', { 
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
        sameSite: 'strict'
      });
      
      // Set other cookies only when accepted
      setCookie('analytics-cookies', 'accepted', { 
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        sameSite: 'strict'
      });
      
      console.log('Cookies accepted');
      setIsVisible(false);
    } catch (error) {
      console.error('Error setting cookies:', error);
    }
  };

  const rejectAll = () => {
    try {
      // Remove all existing non-essential cookies
      removeNonEssentialCookies();
      
      // Set only the consent cookie to remember user's choice
      setCookie('cookie-consent', 'rejected', { 
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
        sameSite: 'strict'
      });
      
      console.log('Cookies rejected and removed');
      setIsVisible(false);
    } catch (error) {
      console.error('Error handling cookie rejection:', error);
    }
  };

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 space-y-1 max-w-2xl">
            <h2 className="text-sm font-semibold">We value your privacy</h2>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, analyze site traffic, and improve our services. 
              By clicking "Accept all" you consent to our use of cookies.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="min-w-[100px]"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="min-w-[100px]"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}