"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

/**
 * Form de la landing /guia — captura al lector del lead magnet que quiere
 * asesoría/plan y lo reenvía a /api/contact (mismo proxy a Zoho que el form
 * de contacto). Servicio fijo "Otro / no estoy seguro" + mensaje con contexto
 * de que viene de la guía de fallecimiento.
 *
 * Cuando se migre a Pipedrive, basta actualizar /api/contact — este form
 * viaja gratis porque usa el mismo endpoint.
 */

type SubmitState = "idle" | "submitting" | "success" | "error";

const SERVICIO_FIJO = "Otro / no estoy seguro";
const MENSAJE_CONTEXTO =
  "Descargó la Guía de 8 trámites por fallecimiento — solicita asesoría / plan.";

export function GuiaLeadForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("submitting");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: String(formData.get("nombre") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      ciudad: "",
      servicio: SERVICIO_FIJO,
      condicion_medica: "" as const,
      aportacion: "",
      mensaje: MENSAJE_CONTEXTO,
      privacy_accepted: privacyAccepted,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitState("success");
      } else {
        setSubmitState("error");
        setErrorMsg(
          data.error ??
            "Error al enviar. Intenta de nuevo o escríbeme por WhatsApp.",
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
      <div className="rounded-2xl border border-burgundy/20 bg-cream dark:bg-coffee/40 p-8 text-center">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-burgundy/10 text-burgundy mb-4">
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
        <h3 className="font-serif text-2xl text-ink dark:text-cream-light leading-tight">
          Recibí tus datos.
        </h3>
        <p className="mt-3 text-warm-brown dark:text-cream-light/80 leading-relaxed">
          Te contacto en máximo <strong>24 horas hábiles</strong>. Si es urgente,
          escríbeme por WhatsApp y respondo más rápido.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 bg-cream-light dark:bg-coffee/30 p-6 sm:p-8 text-left space-y-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" required placeholder="Tu nombre" />
        <Field
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          placeholder="+52 55 XXXX XXXX"
        />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        required
        placeholder="tu@correo.com"
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="privacy_accepted"
          checked={privacyAccepted}
          onChange={(e) => setPrivacyAccepted(e.target.checked)}
          required
          className="mt-1 size-4 accent-burgundy flex-shrink-0"
        />
        <span className="text-sm text-warm-brown dark:text-cream-light/75 leading-relaxed">
          He leído y acepto el{" "}
          <Link
            href="/aviso-privacidad"
            target="_blank"
            className="text-burgundy underline hover:no-underline"
          >
            Aviso de Privacidad
          </Link>
          .<span className="text-burgundy ml-0.5">*</span>
        </span>
      </label>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={submitState === "submitting" || !privacyAccepted}
          className="w-full inline-flex items-center justify-center rounded-full bg-rif-rojo text-cream-light px-7 py-4 font-medium tracking-[0.04em] hover:bg-burgundy-deep transition shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitState === "submitting" ? "Enviando…" : "Quiero que me contacten"}
        </button>
        {submitState === "error" && (
          <p className="text-sm text-burgundy text-center">{errorMsg}</p>
        )}
        <p className="text-xs text-warm-brown/70 dark:text-cream-light/55 text-center leading-relaxed">
          Tu información es confidencial. No comparto datos con terceros. Cédula
          CNSF <strong>V388618</strong>. Respuesta en máximo 24 horas hábiles.
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
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-warm-brown dark:text-cream-light/80 mb-1.5"
      >
        {label}
        {required && <span className="text-burgundy ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-warm-brown/20 bg-cream-light dark:bg-coffee/20 px-4 py-3 text-ink dark:text-cream-light placeholder-warm-brown/45 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy/50 transition-colors duration-300"
      />
    </div>
  );
}
