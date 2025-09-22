'use client';

import { useState, useEffect } from 'react';
import { hasCookie, getCookie } from 'cookies-next';

export function useCookieConsent() {
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsent = hasCookie('cookie-consent');
      if (hasConsent) {
        const consentValue = getCookie('cookie-consent');
        setCookiesAccepted(consentValue === 'accepted');
      }
    }
  }, []);

  // Only return true if cookies were explicitly accepted
  const canUseAnalytics = cookiesAccepted === true;

  return {
    cookiesAccepted,
    canUseAnalytics
  };
}