"use client";

import { useState } from "react";
import type { FormEvent } from "react";

/**
 * Form de pre-cualificación — captura todos los leads (sin rechazo automático)
 * y los envía via Web3Forms a soporte@talan.com.mx para triage manual.
 *
 * Conditional logic según servicio:
 * - GMM → pregunta informativa sobre enfermedad/accidente
 * - PPR/Vida/Mod40/Educacional → ¿Cuánto te gustaría aportar al mes o al año?
 * - Empresarial / HNWI / Otros → solo confirmación de respuesta en 24 hrs
 */

const SERVICIOS = [
  { id: "retiro", label: "Retiro / PPR" },
  { id: "gmm", label: "GMM — gastos médicos mayores" },
  { id: "vida", label: "Seguro de vida" },
  { id: "educacional", label: "Seguro educacional / SEGUBECAS" },
  { id: "modalidad40", label: "Modalidad 40 IMSS" },
  { id: "empresarial", label: "Empresarial / Persona Clave" },
  { id: "patrimonial", label: "Patrimonial / HNWI / Fideicomisos" },
  { id: "familias-diversas", label: "Familias diversas" },
  { id: "neurodivergentes", label: "Hijos neurodivergentes" },
  { id: "mexicanos-extranjero", label: "Mexicanos en el extranjero" },
  { id: "mujeres", label: "Mujeres — asesoría enfocada" },
  { id: "otro", label: "Otro / no estoy seguro" },
] as const;

type ServicioId = (typeof SERVICIOS)[number]["id"];

const SERVICIOS_APORTACION: ServicioId[] = [
  "retiro",
  "vida",
  "educacional",
  "modalidad40",
];

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactForm({ accessKey }: { accessKey: string }) {
  const [servicio, setServicio] = useState<ServicioId | "">("");
  const [tieneCondicion, setTieneCondicion] = useState<"si" | "no" | "">("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const isGMM = servicio === "gmm";
  const askAportacion = servicio !== "" && SERVICIOS_APORTACION.includes(servicio);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const servicioLabel =
      SERVICIOS.find((s) => s.id === servicio)?.label ?? "(sin seleccionar)";

    const payload: Record<string, string> = {
      access_key: accessKey,
      subject: `iriatalan.com.mx — Nuevo lead: ${servicioLabel}`,
      from_name: "iriatalan.com.mx",
      nombre: String(formData.get("nombre") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      email: String(formData.get("email") ?? ""),
      ciudad: String(formData.get("ciudad") ?? ""),
      servicio: servicioLabel,
      mensaje: String(formData.get("mensaje") ?? ""),
    };

    if (isGMM) {
      payload.condicion_medica =
        tieneCondicion === "si"
          ? "Sí"
          : tieneCondicion === "no"
            ? "No"
            : "(no respondida)";
      payload.condicion_detalle = String(formData.get("condicion_detalle") ?? "");
    }
    if (askAportacion) {
      payload.aportacion = String(formData.get("aportacion") ?? "");
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitState("success");
      } else {
        setSubmitState("error");
        setErrorMsg(
          data.message ??
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
          Te contactaré en máximo <strong>24 horas hábiles</strong>. Si es urgente,
          escríbeme por WhatsApp y respondo más rápido.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
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
            placeholder="+52 55 XXXX XXXX"
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
        </legend>
        <p className="text-sm text-warm-brown/85 mb-4">
          Selecciona la opción más cercana — después podemos refinar.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICIOS.map((s) => (
            <label
              key={s.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-300 ${
                servicio === s.id
                  ? "border-burgundy bg-burgundy/5 text-ink"
                  : "border-warm-brown/15 hover:border-burgundy/40 text-warm-brown"
              }`}
            >
              <input
                type="radio"
                name="servicio"
                value={s.id}
                checked={servicio === s.id}
                onChange={() => {
                  setServicio(s.id);
                  setTieneCondicion("");
                }}
                required
                className="size-4 accent-burgundy"
              />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Conditional: GMM */}
      {isGMM && (
        <fieldset className="space-y-4 rounded-xl bg-cream p-5 border border-warm-brown/15">
          <legend className="px-2 text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
            GMM — pregunta informativa
          </legend>
          <p className="text-sm text-warm-brown leading-relaxed">
            ¿Tienes o has tenido alguna enfermedad o accidente importante?
          </p>
          <div className="flex gap-3">
            {(["si", "no"] as const).map((opt) => (
              <label
                key={opt}
                className={`flex-1 text-center rounded-lg border px-4 py-2.5 cursor-pointer transition-all duration-300 text-sm ${
                  tieneCondicion === opt
                    ? "border-burgundy bg-burgundy/5 text-ink font-medium"
                    : "border-warm-brown/15 hover:border-burgundy/40 text-warm-brown"
                }`}
              >
                <input
                  type="radio"
                  name="condicion_medica"
                  value={opt}
                  checked={tieneCondicion === opt}
                  onChange={() => setTieneCondicion(opt)}
                  className="sr-only"
                />
                {opt === "si" ? "Sí" : "No"}
              </label>
            ))}
          </div>
          {tieneCondicion === "si" && (
            <Field
              label="¿Cuál? (opcional)"
              name="condicion_detalle"
              placeholder="Diabetes, hipertensión, cirugía previa, etc."
            />
          )}
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

      {/* Submit */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="w-full inline-flex items-center justify-center rounded-full bg-burgundy text-cream-light px-7 py-4 font-medium tracking-[0.06em] uppercase text-sm hover:bg-burgundy-deep transition-all duration-500 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:shadow-[0_20px_48px_-12px_rgba(158,27,30,0.75)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitState === "submitting" ? "Enviando…" : "Agendar sesión inicial"}
        </button>
        {submitState === "error" && (
          <p className="text-sm text-burgundy text-center">{errorMsg}</p>
        )}
        <p className="text-xs text-warm-brown/70 text-center leading-relaxed">
          Tu información es estrictamente confidencial. No comparto datos con terceros.
          Cédula CNSF <strong>V388618</strong>. Respuesta en máximo 24 horas hábiles.
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
