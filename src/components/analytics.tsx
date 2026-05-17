"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const COOKIE_NAME = "rif-cookie-consent";

function hasAcceptedAnalytics(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  return match.split("=")[1] === "accepted";
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Sync cookie-derived consent → React state on mount.
    // Cookies are unavailable during SSR, so initial render must be `false`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsented(hasAcceptedAnalytics());
    const onChange = () => setConsented(hasAcceptedAnalytics());
    window.addEventListener("rif-consent-change", onChange);
    return () => window.removeEventListener("rif-consent-change", onChange);
  }, []);

  if (!consented) return null;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {clarityId ? (
        <Script id="ms-clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      ) : null}
    </>
  );
}
