"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_NAME = "rif-cookie-consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readConsent(): "accepted" | "rejected" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

function writeConsent(value: "accepted" | "rejected") {
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Intentional: sync external cookie state → React state on mount.
    // Initial state must be `false` to avoid SSR/hydration mismatch (cookies
    // unavailable during server render). The single setVisible after mount
    // is the correct pattern here, not an anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const handle = (value: "accepted" | "rejected") => {
    writeConsent(value);
    setVisible(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rif-consent-change"));
    }
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-warm-brown/15 dark:border-warm-brown/30 bg-white/97 dark:bg-espresso/97 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(20,17,15,0.25)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 sm:py-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <p className="text-[12px] sm:text-[13px] leading-[1.45] text-warm-brown dark:text-cream-light/85 sm:flex-1">
          Usamos cookies para analizar el uso del sitio y mejorar tu
          experiencia. Puedes aceptarlas o rechazarlas; tu decisión se
          guarda por 12 meses. Detalles en nuestro{" "}
          <Link
            href="/aviso-privacidad"
            className="underline underline-offset-4 hover:text-burgundy"
          >
            Aviso de Privacidad
          </Link>
          .
        </p>
        <div className="flex gap-2.5 sm:flex-shrink-0">
          <button
            type="button"
            onClick={() => handle("rejected")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-5 py-2.5 text-[13px] font-medium text-warm-brown dark:text-cream-light/85 hover:bg-cream dark:hover:bg-coffee/40 transition"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => handle("accepted")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-5 py-2.5 text-[13px] font-medium hover:opacity-90 transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
