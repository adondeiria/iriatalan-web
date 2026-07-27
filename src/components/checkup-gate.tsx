"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { CampoTrampa, useAntispam } from "@/components/antispam";

/**
 * Lead magnet gateado: el visitante deja nombre + email + WhatsApp para
 * descargar el "Check-up Patrimonial de Beneficiarios". Reenvía a /api/contact
 * con un mensaje de contexto, y al tener éxito revela los botones de descarga
 * (PDF + Excel).
 *
 * El endpoint decide a qué CRM va (Pipedrive + Zoho de respaldo).
 */

const SERVICIO_FIJO = "Otro / no estoy seguro";
const MENSAJE_CONTEXTO =
  "Descargó el Check-up Patrimonial de Beneficiarios (lead magnet).";
const PDF = "/descargas/check-up-patrimonial-beneficiarios.pdf";
const XLSX = "/descargas/check-up-patrimonial-beneficiarios.xlsx";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function CheckupGate() {
  const antispam = useAntispam();
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
      source: "checkup",
      origin_path: window.location.pathname,
      ...getAttribution(),
      ...antispam.datos(formData),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        trackEvent("generate_lead", { method: "form_checkup_beneficiarios" });
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
          ¡Listo! Tu check-up está abajo.
        </h3>
        <p className="mt-3 text-warm-brown dark:text-cream-light/80 leading-relaxed">
          Descárgalo en el formato que prefieras. También te lo guardé para
          mandártelo y, si quieres, revisamos juntos lo que detectes.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={PDF}
            download
            className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-cream-light px-6 py-3.5 font-medium hover:bg-burgundy-deep transition"
          >
            Descargar en PDF
          </a>
          <a
            href={XLSX}
            download
            className="inline-flex items-center justify-center rounded-full border border-burgundy/30 text-burgundy dark:text-cream-light px-6 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
          >
            Descargar en Excel (para llenar)
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 bg-cream-light dark:bg-coffee/30 p-6 sm:p-8 text-left space-y-5"
      noValidate
    >
      <CampoTrampa idPrefix="checkup" />

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
          {submitState === "submitting"
            ? "Enviando…"
            : "Descargar mi Check-up gratis"}
        </button>
        {submitState === "error" && (
          <p className="text-sm text-burgundy text-center">{errorMsg}</p>
        )}
        <p className="text-xs text-warm-brown/70 dark:text-cream-light/55 text-center leading-relaxed">
          Tu información es confidencial. No comparto datos con terceros. Cédula
          CNSF <strong>V388618</strong>.
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
        htmlFor={`checkup-${name}`}
        className="block text-sm font-medium text-warm-brown dark:text-cream-light/80 mb-1.5"
      >
        {label}
        {required && <span className="text-burgundy ml-1">*</span>}
      </label>
      <input
        id={`checkup-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-warm-brown/20 bg-cream-light dark:bg-coffee/20 px-4 py-3 text-ink dark:text-cream-light placeholder-warm-brown/45 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy/50 transition-colors duration-300"
      />
    </div>
  );
}
