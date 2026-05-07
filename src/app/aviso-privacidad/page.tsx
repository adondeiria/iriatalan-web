import type { Metadata } from "next";
import Link from "next/link";

import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — Iria Talan / RIF",
  description:
    "Aviso de Privacidad Integral conforme a la LFPDPPP. Responsable: Iria Talan Hernández (REINGENIERÍA FINANCIERA). Datos personales tratados, finalidades, transferencias y derechos ARCO.",
  alternates: { canonical: `${SITE_URL}/aviso-privacidad` },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "06 de abril de 2026";
const ARCO_EMAIL = "admin@talan.com.mx";
const ARCO_OWNER = "Violeta Lindero";
const RESPONSABLE_DOMICILIO =
  "Homero 203 -103, Col. Polanco V Sección, Miguel Hidalgo, Ciudad de México, C.P. 11560";

export default function AvisoPrivacidadPage() {
  return (
    <main className="flex flex-col">
      <section className="px-6 py-10 sm:py-20 max-w-3xl mx-auto w-full">
        <p className="text-sm uppercase tracking-wider text-zinc-500">
          Cumplimiento legal
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
          Aviso de Privacidad Integral
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Última actualización: {LAST_UPDATED}
        </p>
      </section>

      <article className="px-6 pb-16 sm:pb-24 max-w-3xl mx-auto w-full space-y-10">
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            1. Identidad y domicilio del Responsable
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            <strong className="text-zinc-900 dark:text-zinc-50">
              Iria Talan Hernández
            </strong>{" "}
            (en lo sucesivo &quot;REINGENIERÍA FINANCIERA&quot; o
            &quot;RIF&quot;), con domicilio en {RESPONSABLE_DOMICILIO}, es
            responsable del uso, protección y tratamiento de sus datos
            personales, conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP), su
            Reglamento y los Lineamientos del Aviso de Privacidad publicados
            por el INAI.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            2. Datos personales que recabamos
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Para las finalidades señaladas más adelante, podemos recabar los
            siguientes datos personales:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Datos de identificación:
              </strong>{" "}
              nombre completo, fecha de nacimiento, nacionalidad, RFC, CURP,
              identificación oficial.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Datos de contacto:
              </strong>{" "}
              domicilio, teléfono, correo electrónico.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Datos patrimoniales y financieros:
              </strong>{" "}
              ingresos, ocupación, información bancaria limitada para cobro
              de primas, beneficiarios designados.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Datos de salud (sensibles):
              </strong>{" "}
              cuestionarios médicos requeridos por las aseguradoras para la
              suscripción de pólizas de Gastos Médicos Mayores y Vida.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Datos de familiares:
              </strong>{" "}
              cuando se designan como beneficiarios o asegurados
              dependientes.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Para los datos personales sensibles relativos a la salud, se
            recabará su consentimiento expreso por escrito.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            3. Finalidades del tratamiento
          </h2>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            3.1 Finalidades primarias (necesarias)
          </h3>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>
              Brindar asesoría financiera, patrimonial y de seguros conforme
              a la solicitud del titular.
            </li>
            <li>
              Cotizar, contratar, gestionar, renovar y atender reclamaciones
              de pólizas de seguros con las aseguradoras autorizadas.
            </li>
            <li>
              Cumplir obligaciones derivadas de la relación comercial
              (facturación, cobranza, comprobantes fiscales).
            </li>
            <li>
              Cumplir obligaciones legales y regulatorias frente a la CNSF,
              SAT, CONDUSEF y demás autoridades.
            </li>
            <li>
              Atender solicitudes de información, dudas, quejas o ejercicio
              de derechos ARCO.
            </li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            3.2 Finalidades secundarias (opcionales)
          </h3>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>
              Envío de comunicaciones comerciales, contenidos educativos,
              novedades de productos y promociones por correo electrónico,
              WhatsApp o llamada.
            </li>
            <li>
              Invitaciones a eventos, webinars o consultas de seguimiento.
            </li>
            <li>Realización de encuestas de satisfacción.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Si usted no desea que sus datos personales sean tratados para
            estas finalidades secundarias, puede manifestarlo enviando un
            correo a{" "}
            <a
              href={`mailto:${ARCO_EMAIL}`}
              className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              {ARCO_EMAIL}
            </a>
            . La negativa para el tratamiento de finalidades secundarias no
            será motivo para negar los servicios solicitados.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            4. Transferencias de datos personales
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Sus datos personales podrán ser transferidos a las siguientes
            terceras personas, siempre con apego a la LFPDPPP y a los
            principios establecidos en su artículo 36:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Aseguradoras autorizadas:
              </strong>{" "}
              GNP, Seguros Monterrey New York Life (SMNYL), BUPA, AXA,
              MetLife, Allianz y Keralty, exclusivamente para la cotización,
              contratación, administración y atención de reclamaciones de
              pólizas.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Autoridades:
              </strong>{" "}
              CNSF, SAT, CONDUSEF, INAI y autoridades judiciales o
              administrativas competentes, cuando exista mandato legal.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-50">
                Proveedores tecnológicos:
              </strong>{" "}
              servicios de CRM, mensajería, contabilidad y firma electrónica
              que actúan como encargados del tratamiento bajo
              confidencialidad contractual.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Estas transferencias son necesarias para mantener y dar
            cumplimiento a la relación jurídica entre el titular y el
            Responsable, por lo que no requieren su consentimiento.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            5. Ejercicio de derechos ARCO
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Usted tiene derecho a conocer qué datos personales tenemos de
            usted, para qué los utilizamos y las condiciones del uso que les
            damos (
            <strong className="text-zinc-900 dark:text-zinc-50">
              Acceso
            </strong>
            ); a solicitar la corrección de su información personal en caso
            de que esté desactualizada, sea inexacta o incompleta (
            <strong className="text-zinc-900 dark:text-zinc-50">
              Rectificación
            </strong>
            ); a solicitar la eliminación de la misma de nuestros registros
            o bases de datos cuando considere que no está siendo utilizada
            adecuadamente (
            <strong className="text-zinc-900 dark:text-zinc-50">
              Cancelación
            </strong>
            ); así como oponerse al uso de sus datos personales para fines
            específicos (
            <strong className="text-zinc-900 dark:text-zinc-50">
              Oposición
            </strong>
            ).
          </p>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Para el ejercicio de cualquiera de los derechos ARCO, así como
            la revocación del consentimiento, deberá enviar una solicitud al
            correo{" "}
            <a
              href={`mailto:${ARCO_EMAIL}`}
              className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              {ARCO_EMAIL}
            </a>{" "}
            dirigida a {ARCO_OWNER}, acompañada de:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li>Nombre completo del titular y medio para recibir respuesta.</li>
            <li>
              Copia de identificación oficial vigente del titular o de su
              representante legal.
            </li>
            <li>
              Descripción clara y precisa de los datos personales sobre los
              que se ejerce el derecho.
            </li>
            <li>Cualquier elemento que facilite la localización de los datos.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Daremos respuesta a su solicitud en un plazo máximo de{" "}
            <strong className="text-zinc-900 dark:text-zinc-50">
              20 días hábiles
            </strong>{" "}
            contados a partir de la fecha de recepción.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            6. Conservación de los datos
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Sus datos personales serán conservados durante el tiempo
            necesario para el cumplimiento de las finalidades primarias y
            por un plazo adicional de hasta{" "}
            <strong className="text-zinc-900 dark:text-zinc-50">
              72 meses
            </strong>{" "}
            posteriores a la terminación de la relación comercial, conforme
            a las obligaciones legales aplicables a la actividad
            aseguradora.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            7. Uso de cookies y tecnologías similares
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            El sitio{" "}
            <strong className="text-zinc-900 dark:text-zinc-50">
              www.iriatalan.com.mx
            </strong>{" "}
            utiliza cookies, web beacons y tecnologías similares con fines
            analíticos y para mejorar la experiencia del usuario. Estas
            tecnologías permiten obtener datos como tipo de navegador,
            páginas visitadas, idioma preferido, fecha y hora de la
            navegación.
          </p>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Puede deshabilitar el uso de cookies modificando la
            configuración de su navegador. Le informamos que el rechazo de
            cookies puede limitar algunas funcionalidades del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            8. Modificaciones al Aviso de Privacidad
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Nos reservamos el derecho de efectuar en cualquier momento
            modificaciones al presente aviso de privacidad. Cualquier
            cambio sustancial será comunicado a través de este sitio web
            indicando la fecha de la última actualización.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            9. Consentimiento
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Al proporcionar sus datos personales por cualquier medio (web,
            correo, WhatsApp, formularios o entrevista presencial),
            manifiesta haber leído, entendido y aceptado los términos
            expuestos en el presente Aviso de Privacidad, otorgando su
            consentimiento expreso para el tratamiento de sus datos
            personales conforme a las finalidades aquí descritas.
          </p>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <p className="text-sm text-zinc-500">
          Versión {LAST_UPDATED}. Para dudas o cualquier asunto relacionado
          con la protección de sus datos personales, escríbanos a{" "}
          <a
            href={`mailto:${ARCO_EMAIL}`}
            className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            {ARCO_EMAIL}
          </a>
          . <Link href="/" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">Volver al inicio</Link>.
        </p>
      </article>
    </main>
  );
}
