'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { PIXEL_ID, persistFbclid, trackPageView } from '@/lib/pixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Capture fbclid from the URL the user landed on, persist 90d.
  useEffect(() => {
    persistFbclid();
  }, []);

  // Hybrid PageView (fbq + CAPI, deduped via shared event_id) on every route change.
  // The fbq queue created by the init script below buffers calls until fbevents.js loads,
  // so this works even on the very first render.
  useEffect(() => {
    trackPageView();
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
