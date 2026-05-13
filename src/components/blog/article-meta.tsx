import Image from "next/image";
import Link from "next/link";

import { formatDateMx, topicHref, TOPIC_LABELS } from "@/lib/blog";

/**
 * Componentes de metadata visible en /blog/[slug] y /blog/categoria/[slug]:
 *  - TLDRBox: la respuesta autocontenida arriba del fold, marcada speakable
 *  - CategoryBadge: chip sobrio con label + link a la categoría
 *  - LastUpdated: timestamp prominente "Actualizado: DD mes YYYY"
 *  - AuthorCard: footer del artículo con foto + credenciales clave + link a /sobre-iria
 */

// =========================================================
// TLDRBox
// =========================================================
export function TLDRBox({ children }: { children: string }) {
  if (!children) return null;
  return (
    <aside
      data-speakable="tldr"
      className="mt-8 mb-2 rounded-2xl border border-burgundy/20 bg-cream/40 dark:bg-coffee/20 dark:border-burgundy/30 px-6 py-5"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
        Respuesta corta
      </p>
      <p className="mt-3 text-lg text-ink dark:text-cream-light leading-relaxed">
        {children}
      </p>
    </aside>
  );
}

// =========================================================
// CategoryBadge
// =========================================================
export function CategoryBadge({
  topic,
  size = "md",
}: {
  topic?: string | null;
  size?: "sm" | "md";
}) {
  if (!topic) return null;
  const label = TOPIC_LABELS[topic] ?? topic;
  const href = topicHref(topic);
  const sizeClass =
    size === "sm"
      ? "text-[10px] tracking-[0.2em] py-1"
      : "text-[11px] tracking-[0.24em] py-1.5";
  const content = (
    <span
      className={`inline-block uppercase font-medium text-burgundy ${sizeClass}`}
    >
      {label}
    </span>
  );
  if (!href) return content;
  return (
    <Link
      href={href}
      className="hover:opacity-75 transition-opacity duration-300"
    >
      {content}
    </Link>
  );
}

// =========================================================
// LastUpdated
// =========================================================
export function LastUpdated({
  publishedAt,
  updatedAt,
  lastReviewed,
}: {
  publishedAt?: string;
  updatedAt?: string;
  lastReviewed?: string;
}) {
  const showReviewed =
    lastReviewed && lastReviewed !== publishedAt && lastReviewed !== updatedAt;
  const showUpdated =
    updatedAt && updatedAt !== publishedAt && !showReviewed;

  return (
    <div className="text-xs text-warm-brown/70 dark:text-cream-light/65 leading-relaxed">
      {publishedAt && (
        <span>
          Publicado{" "}
          <time dateTime={publishedAt}>{formatDateMx(publishedAt)}</time>
        </span>
      )}
      {showUpdated && (
        <>
          <span aria-hidden> · </span>
          <span className="italic">
            Actualizado{" "}
            <time dateTime={updatedAt}>{formatDateMx(updatedAt)}</time>
          </span>
        </>
      )}
      {showReviewed && (
        <>
          <span aria-hidden> · </span>
          <span className="italic">
            Revisado{" "}
            <time dateTime={lastReviewed}>{formatDateMx(lastReviewed)}</time>
          </span>
        </>
      )}
    </div>
  );
}

// =========================================================
// AuthorCard
// =========================================================
type AuthorCardCredential = {
  title?: string;
  issuer?: string;
  category?: string;
};

type AuthorCardProps = {
  author?: {
    name?: string;
    title?: string;
    bio?: string;
    photo?: { asset?: { url?: string }; alt?: string } | null;
    credentials?: AuthorCardCredential[];
  } | null;
  reviewedBy?: { name?: string; title?: string } | null;
};

const PRIORITY_CREDENTIAL_KEYWORDS = [
  "MDRT",
  "AMASFAC",
  "CNSF",
  "Yale",
  "LSE",
  "Tec de Monterrey",
  "Tecnológico de Monterrey",
];

function prioritizeCredentials(
  credentials?: AuthorCardCredential[]
): AuthorCardCredential[] {
  if (!credentials || credentials.length === 0) return [];
  const sorted = [...credentials].sort((a, b) => {
    const aPrio = PRIORITY_CREDENTIAL_KEYWORDS.some(
      (kw) => a.title?.includes(kw) || a.issuer?.includes(kw)
    );
    const bPrio = PRIORITY_CREDENTIAL_KEYWORDS.some(
      (kw) => b.title?.includes(kw) || b.issuer?.includes(kw)
    );
    if (aPrio && !bPrio) return -1;
    if (!aPrio && bPrio) return 1;
    return 0;
  });
  return sorted.slice(0, 4);
}

export function AuthorCard({ author, reviewedBy }: AuthorCardProps) {
  if (!author?.name) return null;
  const topCredentials = prioritizeCredentials(author.credentials);
  const photoUrl = author.photo?.asset?.url;

  return (
    <aside
      className="mt-12 mb-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 p-6 sm:p-7 bg-white/30 dark:bg-coffee/20"
      aria-label={`Sobre ${author.name}`}
    >
      <div className="flex items-start gap-5">
        {photoUrl && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-warm-brown/10">
            <Image
              src={photoUrl}
              alt={author.photo?.alt ?? author.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
            Sobre la autora
          </p>
          <h3 className="mt-1 font-serif text-xl sm:text-2xl text-ink dark:text-cream-light leading-tight">
            <Link
              href="/sobre-iria"
              className="hover:underline underline-offset-4 decoration-burgundy/40"
            >
              {author.name}
            </Link>
          </h3>
          {author.title && (
            <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/70">
              {author.title}
            </p>
          )}
          {author.bio && (
            <p className="mt-3 text-sm text-warm-brown dark:text-cream-light/85 leading-relaxed">
              {author.bio}
            </p>
          )}
          {topCredentials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-warm-brown/85 dark:text-cream-light/70">
              {topCredentials.map((c, i) => (
                <li key={i} className="leading-snug">
                  · {c.title}
                  {c.issuer && (
                    <span className="text-warm-brown/55 dark:text-cream-light/50">
                      {" "}— {c.issuer}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {reviewedBy?.name && (
            <p className="mt-4 text-xs text-warm-brown/70 dark:text-cream-light/65 italic">
              Contenido revisado por {reviewedBy.name}
              {reviewedBy.title ? `, ${reviewedBy.title}` : ""}.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
