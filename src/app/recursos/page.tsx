import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { RESOURCES_LIST_QUERY } from "../../../sanity/lib/queries";
import { buildBreadcrumbSchema, buildGraph, SITE_URL } from "@/lib/seo";

type ResourceItem = {
  _id: string;
  title: string;
  slug: string;
  carrier: string;
  category: string;
  productLine: string;
  year?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  externalUrl?: string | null;
  seoDescription?: string | null;
};

type SearchParams = Promise<{
  carrier?: string;
  category?: string;
  productLine?: string;
}>;

const CATEGORY_LABELS: Record<string, string> = {
  condiciones_generales: "Condiciones Generales",
  formato_reclamacion: "Formato de Reclamación",
  formato_alta_baja: "Formato Alta / Baja",
  cuadro_medico: "Cuadro Médico / Red Hospitalaria",
  tabulador: "Tabulador / Tarifas",
  folleto_producto: "Folleto Producto",
  guia_usuario: "Guía de Usuario",
  aviso_privacidad: "Aviso de Privacidad",
  otro: "Otro",
};

const PRODUCT_LINE_LABELS: Record<string, string> = {
  vida: "Vida individual",
  gmm: "GMM individual",
  vida_grupo: "Vida grupo",
  gmm_empresarial: "GMM empresarial",
  autos: "Autos",
  dano_hogar: "Daños / Hogar",
  retiro: "Retiro / AFORE",
  educacional: "Educacional",
  otro: "—",
};

type WhatsAppChannel = {
  carrier: string;
  ramo: string;
  url: string;
};

const WHATSAPP_CHANNELS: WhatsAppChannel[] = [
  { carrier: "BUPA",    ramo: "Médico",         url: "https://whatsapp.com/channel/0029VaGVom8GehELQJ7iCA2v" },
  { carrier: "GNP",     ramo: "Médico + Autos", url: "https://whatsapp.com/channel/0029VaBhwM6Dp2Q4uSPaB92l" },
  { carrier: "SMNYL",   ramo: "Médico",         url: "https://whatsapp.com/channel/0029VaGvIyNAYlUPmGEDFQ2p" },
  { carrier: "AXA",     ramo: "Médico + Autos", url: "https://whatsapp.com/channel/0029VaBbyzT0LKZCIHeDxz1p" },
  { carrier: "MetLife", ramo: "Vida + GMM",     url: "https://whatsapp.com/channel/0029VaCLFhMAe5Vps0msnG3D" },
  { carrier: "Keralty", ramo: "Médico",         url: "https://whatsapp.com/channel/0029Vb7fJI27dmeRo6pleH3X" },
  { carrier: "Allianz", ramo: "Autos",          url: "https://whatsapp.com/channel/0029VaQkrFJLNSZyWtUvKq41" },
];

export const metadata: Metadata = {
  title: "Recursos — Documentos de aseguradoras",
  description:
    "Biblioteca pública de Condiciones Generales, formatos, cuadros médicos y tabuladores de las aseguradoras autorizadas: BUPA, MetLife, Allianz, Seguros Monterrey NYL, AXA, GNP.",
  alternates: { canonical: `${SITE_URL}/recursos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/recursos`,
    title: "Recursos — Documentos de aseguradoras | Iria Talan / RIF",
    description:
      "Condiciones Generales, formatos y cuadros médicos. Acceso público a documentación oficial de carriers.",
  },
};

function formatFileSize(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function getDownloadUrl(r: ResourceItem): string | null {
  return r.fileUrl ?? r.externalUrl ?? null;
}

function buildItemListSchema(resources: ResourceItem[]) {
  if (!resources.length) return null;
  return {
    "@type": "ItemList" as const,
    "@id": `${SITE_URL}/recursos#itemlist`,
    name: "Recursos de aseguradoras",
    numberOfItems: resources.length,
    itemListElement: resources.map((r, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "DigitalDocument",
        name: r.title,
        url: getDownloadUrl(r) ?? `${SITE_URL}/recursos`,
        about: r.seoDescription ?? CATEGORY_LABELS[r.category],
        provider: { "@type": "Organization", name: r.carrier },
        datePublished: r.year ? `${r.year.slice(0, 4)}-01-01` : undefined,
        publisher: { "@id": `${SITE_URL}#organization` },
      },
    })),
  };
}

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const carrierFilter = params.carrier?.trim() || null;
  const categoryFilter = params.category?.trim() || null;
  const productFilter = params.productLine?.trim() || null;

  const allResources =
    (await sanityFetch<ResourceItem[]>({
      query: RESOURCES_LIST_QUERY,
      tags: ["resource"],
    }).catch(() => null)) ?? [];

  const resources = allResources.filter((r) => {
    if (carrierFilter && r.carrier !== carrierFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (productFilter && r.productLine !== productFilter) return false;
    return true;
  });

  const grouped = resources.reduce<Record<string, ResourceItem[]>>((acc, r) => {
    if (!acc[r.carrier]) acc[r.carrier] = [];
    acc[r.carrier].push(r);
    return acc;
  }, {});
  const carriers = Object.keys(grouped).sort();

  const carriersAvailable = Array.from(
    new Set(allResources.map((r) => r.carrier))
  ).sort();
  const categoriesAvailable = Array.from(
    new Set(allResources.map((r) => r.category))
  ).sort();

  const hasFilter = Boolean(carrierFilter || categoryFilter || productFilter);
  const isEmpty = allResources.length === 0;

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Recursos", path: "/recursos" },
    ]),
    buildItemListSchema(resources)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Recursos
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Documentos oficiales de las aseguradoras
          </h1>
          <p className="mt-5 text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Condiciones Generales, formatos, cuadros médicos y tabuladores —
            acceso público a la documentación oficial de las 6 aseguradoras
            autorizadas con las que trabajo.
          </p>
        </section>

        <section className="px-6 py-8 sm:py-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Avisos directos
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Canales oficiales de WhatsApp por aseguradora
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Cada aseguradora publica avisos importantes (siniestros, cambios
              de red, vencimientos, alertas) en su canal oficial de WhatsApp.
              Únete a los canales de los productos que tienes contigo.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WHATSAPP_CHANNELS.map((c) => (
                <a
                  key={c.carrier}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.carrier}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {c.ramo}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-rif-rojo group-hover:underline whitespace-nowrap">
                    Únete →
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Los canales son administrados directamente por cada aseguradora;
              al unirte aceptas sus términos. No publicamos contenido en estos
              canales — solo compartimos los enlaces oficiales.
            </p>
          </div>
        </section>

        {!isEmpty && (
          <section className="px-6 pb-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-zinc-500 mr-2">Filtrar:</span>
              <Link
                href="/recursos"
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  !hasFilter
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                    : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                Todos
              </Link>
              {carriersAvailable.map((c) => (
                <Link
                  key={c}
                  href={`/recursos?carrier=${encodeURIComponent(c)}`}
                  className={`text-sm px-3 py-1.5 rounded-full border ${
                    carrierFilter === c
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                      : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
            {categoriesAvailable.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-zinc-500 mr-2">Categoría:</span>
                {categoriesAvailable.map((cat) => (
                  <Link
                    key={cat}
                    href={`/recursos?category=${encodeURIComponent(cat)}`}
                    className={`text-sm px-3 py-1.5 rounded-full border ${
                      categoryFilter === cat
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                        : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
          {isEmpty ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Aún no hay documentos publicados
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Estoy organizando la biblioteca de Condiciones Generales y
                formatos de cada aseguradora. Si necesitas un documento
                específico, escríbeme.
              </p>
              <Link
                href="/sobre-iria"
                className="mt-6 inline-block text-sm font-medium underline"
              >
                Contactar a Iria →
              </Link>
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
              <p className="text-zinc-700 dark:text-zinc-300">
                Ningún documento coincide con el filtro seleccionado.
              </p>
              <Link
                href="/recursos"
                className="mt-4 inline-block text-sm font-medium underline"
              >
                Ver todos los recursos
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {carriers.map((carrier) => (
                <div key={carrier}>
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {carrier}
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {grouped[carrier].map((r) => {
                      const url = getDownloadUrl(r);
                      const size = formatFileSize(r.fileSize);
                      const card = (
                        <>
                          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                            {CATEGORY_LABELS[r.category] ?? r.category}
                            {r.productLine &&
                              r.productLine !== "otro" &&
                              ` · ${PRODUCT_LINE_LABELS[r.productLine] ?? r.productLine}`}
                            {r.year && ` · ${r.year}`}
                          </div>
                          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                            {r.title}
                          </h3>
                          {r.seoDescription && (
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {r.seoDescription}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-3 text-sm">
                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                              {r.fileUrl ? "Descargar PDF" : "Ver documento"}
                            </span>
                            {size && (
                              <span className="text-zinc-500">({size})</span>
                            )}
                            {!r.fileUrl && r.externalUrl && (
                              <span className="text-zinc-500 text-xs">
                                → sitio de {r.carrier}
                              </span>
                            )}
                          </div>
                        </>
                      );
                      const className =
                        "block p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition";
                      if (!url) {
                        return (
                          <div key={r._id} className={`${className} opacity-60`}>
                            {card}
                          </div>
                        );
                      }
                      return (
                        <a
                          key={r._id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {card}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="px-6 py-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Los documentos aquí publicados son provistos por las aseguradoras
              con fines informativos. La versión vigente de cada póliza
              prevalece sobre cualquier copia descargada. Para confirmar
              vigencia o resolver dudas, agenda una consulta gratuita.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
