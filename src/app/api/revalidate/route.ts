// /api/revalidate
//
// Endpoint para forzar la regeneración de un path específico tras publicar
// contenido nuevo en Sanity. Lo llama `scripts/draft-push.mjs --publish` después
// de un mutate exitoso para que producción muestre el contenido sin esperar el
// ISR (30s). Iria también puede llamarlo a mano para forzar refresh.
//
// Auth: query param `secret` debe coincidir con `process.env.REVALIDATE_SECRET`.
// Métodos: GET (debug) y POST (producción). Mismo handler.
//
// Uso:
//   POST /api/revalidate?path=/blog/<slug>&secret=<REVALIDATE_SECRET>
//   POST /api/revalidate?path=/blog&secret=<REVALIDATE_SECRET>
//   POST /api/revalidate?path=/&secret=<REVALIDATE_SECRET>

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const secret = searchParams.get("secret");

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      {
        revalidated: false,
        message:
          "Server-side error — REVALIDATE_SECRET no está configurado en Vercel env vars.",
      },
      { status: 500 }
    );
  }

  if (!secret || secret !== expected) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401 }
    );
  }

  if (!path || !path.startsWith("/")) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Missing or invalid `path` query param. Debe empezar con `/`.",
      },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    return NextResponse.json({
      revalidated: true,
      path,
      now: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        revalidated: false,
        path,
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handler(req);
}

export async function GET(req: NextRequest) {
  return handler(req);
}
