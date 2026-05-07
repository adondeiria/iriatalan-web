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
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const handle = (value: "accepted" | "rejected") => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur shadow-lg p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          Usamos cookies para analizar el uso del sitio y mejorar tu
          experiencia. Puedes aceptarlas o rechazarlas; tu decisión se
          guarda por 12 meses. Detalles en nuestro{" "}
          <Link
            href="/aviso-privacidad"
            className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Aviso de Privacidad
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => handle("rejected")}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => handle("accepted")}
            className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
