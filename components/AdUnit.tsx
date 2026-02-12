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

  return (
    <div className={`group relative overflow-hidden flex flex-col items-center justify-center text-center transition-colors min-h-[100px] ${baseClasses} ${className}`}>

      {/* Background Placeholder: Visible while ad loads or if ad has transparent background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(45deg, #10b981 25%, transparent 25%, transparent 50%, #10b981 50%, #10b981 75%, transparent 75%, transparent)',
        backgroundSize: '20px 20px'
      }}>
      </div>

      <div className="absolute z-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
        <span className="text-gray-500 font-serif italic text-sm">Advertisement</span>
        {ADS_CONFIG.IS_TEST_MODE && <span className="text-xs text-news-accent mt-1">(Test Mode)</span>}
      </div>

      {/* 
         The AdSense Tag 
         - `key={slotId}` ensures React destroys and recreates the DOM node if the slot changes,
           which is critical for AdSense to initialize the new ad correctly.
         - `relative z-10` ensures the ad renders on top of our placeholder.
      */}
      <ins className="adsbygoogle relative z-10"
        ref={adRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={ADS_CONFIG.PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-layout-key={layoutKey}
        data-ad-test={ADS_CONFIG.IS_TEST_MODE ? "on" : "off"}
        data-full-width-responsive="true"
        key={slotId}>
      </ins>
    </div>
  );
};

export default AdUnit;