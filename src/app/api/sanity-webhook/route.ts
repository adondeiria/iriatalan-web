// /api/sanity-webhook
//
// Lo llama Sanity (webhook configurado en sanity.io/manage → API → Webhooks)
// cada vez que se publica o cambia un `article` o `glossaryTerm` en el Studio.
// Hace lo mismo que `/api/revalidate` hace para `draft-push --publish`:
//   1. refresca la página al momento (sin esperar el ISR de ~30 s), y
//   2. en producción, avisa a IndexNow (Bing) de la URL.
// Sin esto, publicar desde el Studio nunca llegaba a IndexNow.
//
// Auth: firma HMAC de Sanity, validada con SANITY_WEBHOOK_SECRET (Vercel env).
// Una petición sin firma válida responde 401 y no hace nada.
//
// Configuración del webhook en Sanity:
//   URL:        https://iriatalan.com.mx/api/sanity-webhook
//   Dataset:    production
//   Trigger on: Create, Update
//   Filter:     _type in ["article", "glossaryTerm"]
//   Projection: {_id, _type, "slug": slug.current, draft}
//   Secret:     el mismo valor que SANITY_WEBHOOK_SECRET
//   HTTP method: POST · API version: v2025-02-19 · Drafts: NO

import { revalidatePath } from "next/cache";
import { after, NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { siteUrl, submitToIndexNow } from "@/lib/indexnow";
import { planDesdeWebhook, type SanityWebhookBody } from "@/lib/sanity-webhook";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "SANITY_WEBHOOK_SECRET no está configurado en Vercel." },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<SanityWebhookBody>(req, secret);
  if (isValidSignature !== true) {
    return NextResponse.json({ ok: false, message: "Firma inválida." }, { status: 401 });
  }

  const plan = planDesdeWebhook(body);
  if (!plan) {
    return NextResponse.json({ ok: true, ignorado: true, _type: body?._type ?? null });
  }

  for (const path of plan.revalidar) revalidatePath(path, "layout");

  if (process.env.VERCEL_ENV === "production") {
    after(async () => {
      const result = await submitToIndexNow(plan.avisar.map(siteUrl));
      if (!result.ok) {
        console.warn("[indexnow] aviso no aceptado (webhook Sanity)", { avisar: plan.avisar, ...result });
      }
    });
  }

  return NextResponse.json({ ok: true, revalidado: plan.revalidar, avisado: plan.avisar });
}
