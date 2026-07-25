import Link from "next/link";

/**
 * RelatedServices — server component.
 *
 * Enlaza cada artículo del blog a 2-3 páginas de servicio comercial relevantes
 * según su `topic`. Es el puente blog → páginas de dinero:
 *  - Empuja tráfico informativo hacia conversión (agenda / cotización).
 *  - Da a las páginas comerciales huérfanas (/seguros-vida, /fondos-de-inversion,
 *    /planes-educacionales) enlaces contextuales entrantes desde contenido
 *    temático — señal de autoridad que hoy no reciben (solo llegaban por el
 *    mega-menú sitewide).
 *  - `/guia` (lead-magnet de sucesión) entra como destino en temas patrimoniales
 *    y de casos, donde el intent calza.
 *
 * Citabilidad LLM: enlaces contextuales tema→servicio con anchor text descriptivo
 * refuerzan el cluster temático que los answer engines siguen para validar
 * profundidad del autor.
 */

type ServiceLink = { href: string; title: string; blurb: string };

// Registro único de páginas destino. La clave es interna; el href es la ruta real.
const SERVICES: Record<string, ServiceLink> = {
  "seguros-vida": {
    href: "/seguros-vida",
    title: "Seguros de vida",
    blurb:
      "Protección familiar, liquidez sucesoria y continuidad del negocio — la cobertura a tu medida, no la que más comisión deja.",
  },
  gmm: {
    href: "/gmm",
    title: "Gastos Médicos Mayores",
    // 5, no 6: de las 6 aseguradoras que represento, Allianz no vende GMM en México.
    blurb:
      "Comparo las 5 aseguradoras que venden GMM en México y armo la cobertura que te conviene, no la que más se vende.",
  },
  retiro: {
    href: "/retiro",
    title: "Planeación de retiro",
    blurb:
      "PPR deducibles, Modalidad 40 y estrategias de retiro para profesionistas y empresarios.",
  },
  patrimonial: {
    href: "/patrimonial",
    title: "Planeación patrimonial",
    blurb:
      "Fideicomisos, sucesión y blindaje para patrimonios complejos y familias con necesidades especiales.",
  },
  "planes-educacionales": {
    href: "/planes-educacionales",
    title: "Planes educacionales",
    blurb:
      "Asegura la universidad de tus hijos con un plan que no se quede corto frente a la inflación educativa.",
  },
  fondos: {
    href: "/fondos-de-inversion",
    title: "Fondos de inversión",
    blurb:
      "Vehículos para hacer crecer y ordenar tu capital según tu horizonte y tolerancia al riesgo.",
  },
  empresas: {
    href: "/empresas",
    title: "Empresas y socios",
    blurb:
      "Persona clave, vida grupo, GMM colectivo y planes de retiro empresarial.",
  },
  guia: {
    href: "/guia",
    title: "Guía gratuita: trámites por fallecimiento",
    blurb:
      "Checklist de los 8 trámites cuando fallece un familiar + check-up de beneficiarios. Descarga gratis.",
  },
};

// topic → claves de servicio (2-3 c/u). Prioriza las huérfanas como destino
// para que reciban enlaces entrantes desde varios temas.
const TOPIC_SERVICES: Record<string, string[]> = {
  vida: ["seguros-vida", "patrimonial", "gmm"],
  gmm: ["gmm", "seguros-vida", "empresas"],
  retiro: ["retiro", "fondos", "seguros-vida"],
  patrimonial: ["patrimonial", "seguros-vida", "guia"],
  educacionales: ["planes-educacionales", "fondos", "seguros-vida"],
  fideicomisos: ["patrimonial", "seguros-vida", "empresas"],
  empresas: ["empresas", "retiro", "gmm"],
  casos: ["patrimonial", "seguros-vida", "guia"],
};

export function RelatedServices({ topic }: { topic?: string }) {
  const keys = topic ? TOPIC_SERVICES[topic] : null;
  if (!keys || keys.length === 0) return null;

  const services = keys
    .map((k) => SERVICES[k])
    .filter((s): s is ServiceLink => Boolean(s));
  if (services.length === 0) return null;

  return (
    <section
      className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream/40 dark:bg-coffee/20"
      aria-label="Servicios relacionados"
    >
      <div className="max-w-5xl mx-auto w-full">
        <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
          Cómo te puedo ayudar
        </p>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
          Servicios relacionados con este tema
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
            >
              <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                {s.blurb}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-burgundy group-hover:underline">
                Ver más →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
