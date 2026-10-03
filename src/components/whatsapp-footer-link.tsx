"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { WA_NUMBER_FALLBACK, mensajeWhatsAppParaRuta, waHref } from "@/lib/whatsapp";

/**
 * Botón de WhatsApp del footer. El layout es un Server Component y no conoce la
 * ruta, así que mandaba siempre el genérico en español ("vi tu sitio") — también
 * en las páginas en inglés, a extranjeros que llegaban recomendados. Aquí se usa
 * el mensaje de la página donde está el visitante, en su idioma.
 */
export function WhatsAppFooterLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <a
      href={waHref(WA_NUMBER_FALLBACK, mensajeWhatsAppParaRuta(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
