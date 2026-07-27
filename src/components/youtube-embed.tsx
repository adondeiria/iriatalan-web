"use client";

import Image from "next/image";
import { useState } from "react";

import { youtubeThumbnail, type ArticleVideoData } from "@/lib/seo";

/**
 * YouTubeFacade — el video del canal que cubre el mismo tema que la página.
 *
 * Por qué existe: el canal de YouTube y el sitio venían explicando lo mismo sin
 * conocerse. Enlazarlos suma las dos superficies en vez de repetirlas — y el
 * `VideoObject` que emite `buildVideoSchema` le dice al buscador que el texto y
 * el video son la misma respuesta.
 *
 * Patrón facade (no iframe hasta el clic), por dos razones:
 *  1. Consentimiento: el sitio tiene banner de cookies. Un iframe de YouTube
 *     montado de entrada dispara cookies de terceros sin que nadie las acepte.
 *  2. Rendimiento: el player de YouTube pesa cientos de KB de JS. Cargarlo en
 *     toda página que tenga video castigaría el LCP de las que la mayoría lee
 *     sin ver el video.
 *
 * La miniatura pasa por el optimizador de Next (`next/image` + remotePattern de
 * `i.ytimg.com`), así que el navegador tampoco contacta a YouTube para la
 * imagen: la trae el servidor. Antes del clic hay CERO peticiones a YouTube.
 */
export function YouTubeFacade({
  video,
  eyebrow = "Este tema, en video",
  fallbackTitle,
}: {
  video?: ArticleVideoData | null;
  /** Etiqueta pequeña sobre el video. Cambia según la página. */
  eyebrow?: string;
  /** Título para el `aria-label` si el video no trae `name`. */
  fallbackTitle: string;
}) {
  const [activo, setActivo] = useState(false);

  if (!video?.videoId) return null;

  const titulo = video.name ?? fallbackTitle;
  const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <div className="w-full">
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
        {eyebrow}
      </p>

      <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden bg-warm-brown/10 dark:bg-coffee/40">
        {activo ? (
          <iframe
            // youtube-nocookie: dominio sin cookies de seguimiento de YouTube.
            // autoplay=1 porque el visitante YA dio clic en reproducir — sin
            // esto tendría que darlo dos veces.
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivo(true)}
            aria-label={`Reproducir video: ${titulo}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={youtubeThumbnail(video.videoId)}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 48rem"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-ink/25 transition group-hover:bg-ink/10" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/95 shadow-lg transition group-hover:scale-105 group-hover:bg-burgundy">
                {/* Triángulo de play, ligeramente descentrado para que se vea
                    ópticamente centrado dentro del círculo. */}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-7 w-7 translate-x-[2px] fill-cream-light"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-warm-brown/80 dark:text-cream-light/65 leading-relaxed">
        {video.name && (
          <span className="text-ink dark:text-cream-light">{video.name}</span>
        )}
        {video.name && " — "}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-burgundy dark:hover:text-burgundy"
        >
          verlo en YouTube
        </a>
      </p>
    </div>
  );
}
