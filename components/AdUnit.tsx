'use client';
import React, { useEffect, useRef } from 'react';
import { ADS_CONFIG } from '../data/adsConfig';

interface AdUnitProps {
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  slotId?: string; // This should be the specific Ad Unit ID from AdSense dashboard
  layoutKey?: string; // Optional: used for In-Feed ads
  variant?: 'card' | 'transparent';
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdUnit: React.FC<AdUnitProps> = ({ className = '', format = 'auto', slotId = '1234567890', layoutKey, variant = 'card' }) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // 1. Safety: Check if window exists (SSR protection)
    if (typeof window === 'undefined') return;

    // 2. Guard: Prevent double-pushing in React Strict Mode or fast re-renders
    // If we have already pushed for this specific instance, do not push again.
    if (isPushed.current) return;

    try {
      const adsbygoogle = window.adsbygoogle || [];

      // 3. Push the ad
      adsbygoogle.push({});

      // 4. Mark as pushed to prevent duplicate requests
      isPushed.current = true;
    } catch (e) {
      console.error("GreenShift AdSense Integration Error:", e);
    }
  }, [slotId]); // Re-run effect only if slotId changes

  const baseClasses = variant === 'card'
    ? 'bg-zinc-900/30 border border-white/5 rounded-sm hover:bg-zinc-900/50'
    : '';

  // Temporarily hiding ad placeholders until ad strategy is finalized
  return null;
};

export default AdUnit;