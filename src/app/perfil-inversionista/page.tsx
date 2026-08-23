import type { Metadata } from "next";

import { FAQ_PERFIL } from "@/lib/perfil-textos";
import {
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

import { MarcoDelPerfil } from "./marco";

/**
 * Puerta pública del cuestionario de perfil del inversionista — lead magnet
 * enlazado desde el blog y desde `/recursos`.
 *
 * No pide monto ni datos de contacto: al terminar, la persona decide si manda
 * su resultado por WhatsApp o se lo lleva en PDF. Nada se almacena.
 *
 * **Por qué esta página lleva texto además del cuestionario:** el cuestionario
 * es una aplicación, y lo que se pinta al hacer clic no lo lee ni Google ni un
 * modelo de lenguaje. Sin la introducción y el FAQ de abajo, la URL sería
 * invisible para las búsquedas que la gente sí hace —"qué tipo de inversionista
 * soy", "test de perfil de riesgo"— y la herramienta dependería por completo de
 * que alguien la enlace.
 */

/**
 * El `title` va con la palabra clave primero —es lo que Google enseña como
 * enlace azul y lo que la gente escanea—, mientras que el H1 de la página se
 * queda con el gancho. Es la forma de no hacer competir posicionamiento contra
 * conversión: cada uno se queda con el trabajo que sabe hacer.
 */
const TITULO = "Test de perfil del inversionista";

/**
 * La descripción abre con la contradicción: en la página de resultados de
 * Google compite contra otros diez enlaces, y ahí el trabajo no es explicar
 * sino detener el escaneo.
 *
 * Igual que el subtítulo, NO resuelve la contradicción — la pospone. Adelantar
 * el "no se puede" desde el buscador le da a la persona la conclusión sin el
 * clic, y de paso la posiciona como una advertencia en vez de una invitación.
 */
const DESCRIPCION =
  "¿Buscas 15% anual o más pero no aceptas perder ni un peso? Primero descubre tu perfil de inversionista: 10 preguntas, 3 minutos y sin registro.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: `${SITE_URL}/perfil-inversionista` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/perfil-inversionista`,
    title: `${TITULO} | ${SITE_NAME}`,
    description: DESCRIPCION,
  },
};

export default function PerfilInversionistaPage() {
  // `buildGraph` recibe los nodos como argumentos sueltos, no como arreglo:
  // pasarle un array los anida (`"@graph":[[…]]`) y Google descarta el bloque
  // entero sin avisar.
  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Recursos", path: "/recursos" },
      { name: TITULO, path: "/perfil-inversionista" },
    ]),
    buildFAQPageSchema(
      FAQ_PERFIL.map((f) => ({ question: f.pregunta, answerText: f.respuesta })),
    ),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // El JSON-LD va como texto: React escaparía las comillas y Google
        // dejaría de leerlo.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <MarcoDelPerfil modoSesion={false} />
      <ContenidoIndexable />
    </>
  );
}

/**
 * Texto que sí ven los buscadores. Va después del cuestionario a propósito:
 * quien llega a usar la herramienta la encuentra primero, y quien llega de una
 * búsqueda encuentra la respuesta escrita sin tener que contestar nada.
 */
function ContenidoIndexable() {
  return (
    <section className="border-t border-burgundy/12 bg-cream-light px-5 py-14 dark:bg-espresso print:hidden">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-serif text-3xl leading-tight text-ink dark:text-cream-light">
          Qué mide este cuestionario
        </h2>
        <p className="mt-4 leading-relaxed text-warm-brown dark:text-cream-light/80">
          Tu perfil de inversionista no es un rasgo de carácter: es el resultado
          de tres cosas medibles y distintas entre sí. El{" "}
          <strong className="font-medium text-ink dark:text-cream-light">
            plazo
          </strong>{" "}
          es cuándo vas a necesitar ese dinero. La{" "}
          <strong className="font-medium text-ink dark:text-cream-light">
            capacidad
          </strong>{" "}
          es qué tanto aguanta tu situación si esa inversión sale mal. La{" "}
          <strong className="font-medium text-ink dark:text-cream-light">
            tolerancia
          </strong>{" "}
          es cuánta caída soportas sin cambiar de plan.
        </p>
        <p className="mt-4 leading-relaxed text-warm-brown dark:text-cream-light/80">
          Se miden por separado porque miden cosas distintas, y el perfil final
          es el menor de los tres. Por eso la misma persona puede ser
          conservadora con el dinero de la universidad de sus hijos y dinámica
          con el de su retiro: cambia el plazo, cambia el perfil.
        </p>

        <h2 className="mt-12 font-serif text-3xl leading-tight text-ink dark:text-cream-light">
          Preguntas frecuentes
        </h2>
        <dl className="mt-6 divide-y divide-burgundy/12">
          {FAQ_PERFIL.map((f) => (
            <div key={f.pregunta} className="py-5">
              <dt className="font-medium text-ink dark:text-cream-light">
                {f.pregunta}
              </dt>
              <dd className="mt-2 leading-relaxed text-warm-brown dark:text-cream-light/80">
                {f.respuesta}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-sm leading-relaxed text-rif-gris">
          Herramienta de asesoría de Iria Talan, agente de seguros con cédula
          CNSF V388618, basada en los criterios de perfilamiento que usan las
          aseguradoras en México. Complementa —no sustituye— el cuestionario
          oficial que se firma junto con la solicitud.
        </p>
      </div>
    </section>
  );
}
