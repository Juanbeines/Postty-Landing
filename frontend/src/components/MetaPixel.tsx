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
          // Advanced matching: a stable pseudonymous browser id, read from (or
          // seeded into) the same localStorage key lib/pixel.ts uses, so the
          // browser pixel and the CAPI mirror report the SAME external_id and
          // Meta can join them. Inlined here rather than set from an effect so
          // it is present on the very first event. Random UUID only — no PII.
          // Wrapped because Safari private mode throws on localStorage access.
          var __pxid = null;
          try {
            __pxid = localStorage.getItem('postty_ext_id');
            if (!__pxid) {
              __pxid = (crypto && crypto.randomUUID)
                ? crypto.randomUUID()
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                  });
              localStorage.setItem('postty_ext_id', __pxid);
            }
          } catch (e) { __pxid = null; }
          if (__pxid) {
            fbq('init', '${PIXEL_ID}', { external_id: __pxid });
          } else {
            fbq('init', '${PIXEL_ID}');
          }
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
