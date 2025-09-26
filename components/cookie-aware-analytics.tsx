'use client';

import { useCookieConsent } from '@/hooks/use-cookie-consent';

export function CookieAwareAnalytics() {
  const { canUseAnalytics } = useCookieConsent();

  if (!canUseAnalytics) {
    return null;
  }

  // Only load analytics when cookies are accepted
  return (
    <>
      {/* Add your analytics scripts here */}
    </>
  );
}