"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

/**
 * Form de pre-cualificación — captura todos los leads y los reenvía a Zoho Forms
 * via /api/contact (server-side proxy). El form en Zoho está configurado para
 * auto-create Lead en Zoho CRM con el mapping de campos del Workflow.
 *
 * Conditional logic según servicio:
 * - GMM → pregunta condición médica (Sí/No/N/A)
 * - PPR/Vida/Mod40/Educacional → ¿Cuánto te gustaría aportar al mes o al año?
 * - Empresarial / HNWI / Otros → solo confirmación de respuesta en 24 hrs
 *
 * Los IDs/labels de servicios coinciden EXACTAMENTE con los valores del
 * dropdown en Zoho Forms — no modificar sin actualizar también allá.
 */

const SERVICIOS = [
  "Retiro / PPR",
  "Gastos medicos mayores",
  "Seguro de vida",
  "Seguro / Fideicomiso educacional",
  "Ahorro para Modalidad 40",
  "Empresarial / Persona Clave",
  "Patrimonial / HNWI / Fideicomisos",
  "Familias diversas",
  "Hijos neurodivergentes",
  "Mexicanos en el extranjero",
  "Mujeres - asesoria enfocada",
  "Foreigners living in Mexico",
  "Otro / no estoy seguro",
] as const;

type Servicio = (typeof SERVICIOS)[number];

const SERVICIO_GMM: Servicio = "Gastos medicos mayores";

const SERVICIOS_APORTACION: Servicio[] = [
  "Retiro / PPR",
  "Seguro de vida",
  "Seguro / Fideicomiso educacional",
  "Ahorro para Modalidad 40",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normaliza un móvil mexicano a 10 dígitos; devuelve null si no es válido.
 * Espejo de la validación server-side en /api/contact.
 */
function normalizeMxMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.length === 13 && d.startsWith("521")) d = d.slice(3);
  else if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 ? d : null;
}

type SubmitState = "idle" | "submitting" | "success" | "error";
type CondicionMedica = "SI" | "NO" | "N/A" | "";

export function ContactForm() {
  const [servicio, setServicio] = useState<Servicio | "">("");
  const [condicionMedica, setCondicionMedica] = useState<CondicionMedica>("");
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Marca de tiempo de render — el server rechaza submits < 3s (anti-bot).
  const [loadedAt] = useState<number>(() => Date.now());

  const isGMM = servicio === SERVICIO_GMM;
  const askAportacion =
    servicio !== "" && SERVICIOS_APORTACION.includes(servicio as Servicio);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();

    // Validación client-side (el form usa noValidate, así que la hacemos aquí).
    if (nombre.length < 2) {
      setSubmitState("error");
      setErrorMsg("Escribe tu nombre para poder contactarte.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setSubmitState("error");
      setErrorMsg("Revisa tu correo — parece que tiene un error de formato.");
      return;
    }
    if (!normalizeMxMobile(whatsappRaw)) {
      setSubmitState("error");
      setErrorMsg(
        "Ingresa un WhatsApp válido a 10 dígitos (ej. 55 1234 5678).",
      );
      return;
    }
    if (!servicio) {
      setSubmitState("error");
      setErrorMsg("Selecciona qué quieres resolver.");
      return;
    }

    const payload = {
      nombre,
      whatsapp: whatsappRaw,
      email,
      ciudad: String(formData.get("ciudad") ?? "").trim(),
      servicio: servicio || "",
      condicion_medica: isGMM ? condicionMedica : "",
      aportacion: askAportacion
        ? String(formData.get("aportacion") ?? "").trim()
        : "",
      mensaje: String(formData.get("mensaje") ?? "").trim(),
      privacy_accepted: privacyAccepted,
      // Anti-spam: honeypot (debe ir vacío), tiempo de llenado, y origen.
      website: String(formData.get("website") ?? ""),
      elapsed_ms: Date.now() - loadedAt,
      source: "contacto",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        trackEvent("generate_lead", {
          method: "form_contacto",
          servicio: payload.servicio || "no_especificado",
        });
        setSubmitState("success");
      } else {
        setSubmitState("error");
        setErrorMsg(
          data.error ??
            "Error al enviar. Por favor intenta de nuevo o escríbenos por WhatsApp.",
        );
      }
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Error de red. Verifica tu conexión e intenta de nuevo.",
      );
    }
  }

  if (submitState === "success") {
    return (
      <div className="rounded-2xl border border-burgundy/20 bg-cream p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-burgundy/10 text-burgundy mb-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
          Recibí tu mensaje.
        </h3>
        <p className="mt-4 text-warm-brown leading-relaxed max-w-md mx-auto">
          Te contactaré en máximo <strong>24 horas hábiles</strong>. Si es
          urgente, escríbeme por WhatsApp y respondo más rápido.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      {/* Honeypot anti-bot — invisible para humanos; los bots lo llenan y el
          server responde éxito falso sin reenviar a Zoho. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">No llenar este campo</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/* Datos básicos */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-medium uppercase tracking-[0.24em] text-burgundy mb-4">
          Datos básicos
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" name="nombre" required placeholder="Tu nombre" />
          <Field
            label="Ciudad"
            name="ciudad"
            placeholder="CDMX, Monterrey, etc."
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            required
            placeholder="55 1234 5678"
            helperText="A 10 dígitos — es mi vía principal de contacto."
          />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
          />
        </div>
      </fieldset>

      {/* Servicio */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium uppercase tracking-[0.24em] text-burgundy mb-1">
          ¿Qué quieres resolver?
          <span className="text-burgundy ml-1">*</span>
        </legend>
        <p className="text-sm text-warm-brown/85 mb-4">
          Selecciona la opción más cercana — después podemos refinar.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICIOS.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-300 ${
                servicio === s
                  ? "border-burgundy bg-burgundy/5 text-ink"
                  : "border-warm-brown/15 hover:border-burgundy/40 text-warm-brown"
              }`}
            >
              <input
                type="radio"
                name="servicio"
                value={s}
                checked={servicio === s}
                onChange={() => {
                  setServicio(s);
                  setCondicionMedica("");
                }}
                required
                className="size-4 accent-burgundy"
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Conditional: GMM */}
      {isGMM && (
        <fieldset className="space-y-4 rounded-xl bg-cream p-5 border border-warm-brown/15">
          <legend className="px-2 text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
            Condición médica
          </legend>
          <p className="text-sm text-warm-brown leading-relaxed">
            ¿Tienes o has tenido alguna enfermedad o accidente importante?
          </p>
          <div className="flex gap-3">
            {(["SI", "NO", "N/A"] as const).map((opt) => (
              <label
                key={opt}
                className={`flex-1 text-center rounded-lg border px-4 py-2.5 cursor-pointer transition-all duration-300 text-sm ${
                  condicionMedica === opt
                    ? "border-burgundy bg-burgundy/5 text-ink font-medium"
                    : "border-warm-brown/15 hover:border-burgundy/40 text-warm-brown"
                }`}
              >
                <input
                  type="radio"
                  name="condicion_medica_radio"
                  value={opt}
                  checked={condicionMedica === opt}
                  onChange={() => setCondicionMedica(opt)}
                  className="sr-only"
                />
                {opt === "SI" ? "Sí" : opt === "NO" ? "No" : "N/A"}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Conditional: aportación */}
      {askAportacion && (
        <fieldset className="space-y-3 rounded-xl bg-cream p-5 border border-warm-brown/15">
          <legend className="px-2 text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
            Aportación
          </legend>
          <Field
            label="¿Cuánto te gustaría aportar al mes o al año?"
            name="aportacion"
            placeholder="Ej. $3,000 al mes, o $50,000 al año"
            helperText="Aproximado está bien — lo refinamos en la sesión."
          />
        </fieldset>
      )}

      {/* Mensaje libre */}
      <fieldset>
        <Field
          label="Cuéntame contexto adicional (opcional)"
          name="mensaje"
          textarea
          placeholder="Edad, etapa de vida, urgencia, lo que quieras compartir."
        />
      </fieldset>

      {/* Privacy / T&C */}
      <fieldset>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="privacy_accepted"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-1 size-4 accent-burgundy flex-shrink-0"
          />
          <span className="text-sm text-warm-brown leading-relaxed">
            He leído y acepto el{" "}
            <Link
              href="/aviso-privacidad"
              target="_blank"
              className="text-burgundy underline hover:no-underline"
            >
              Aviso de Privacidad
            </Link>
            .
            <span className="text-burgundy ml-0.5">*</span>
          </span>
        </label>
      </fieldset>

      {/* Submit */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={submitState === "submitting" || !privacyAccepted}
          className="w-full inline-flex items-center justify-center rounded-full bg-burgundy text-cream-light px-7 py-4 font-medium tracking-[0.06em] uppercase text-sm hover:bg-burgundy-deep transition-all duration-500 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:shadow-[0_20px_48px_-12px_rgba(158,27,30,0.75)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitState === "submitting" ? "Enviando…" : "Agendar sesión inicial"}
        </button>
        {submitState === "error" && (
          <p className="text-sm text-burgundy text-center">{errorMsg}</p>
        )}
        <p className="text-xs text-warm-brown/70 text-center leading-relaxed">
          Tu información es estrictamente confidencial. No comparto datos con
          terceros. Cédula CNSF <strong>V388618</strong>. Respuesta en máximo 24
          horas hábiles.
        </p>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  textarea?: boolean;
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  helperText,
  textarea = false,
}: FieldProps) {
  const baseClass =
    "w-full rounded-xl border border-warm-brown/20 bg-cream-light px-4 py-3 text-ink placeholder-warm-brown/45 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy/50 transition-colors duration-300";

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-warm-brown mb-1.5"
      >
        {label}
        {required && <span className="text-burgundy ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          rows={4}
          placeholder={placeholder}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {helperText && (
        <p className="mt-1.5 text-xs text-warm-brown/65">{helperText}</p>
      )}
    </div>
  );
}
