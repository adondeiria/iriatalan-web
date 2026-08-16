import { NextResponse } from "next/server";

import { fraseDiaHabil } from "@/lib/dia-habil";

/**
 * POST /api/dia-habil — escribe en el contacto de respond.io cómo se llama el
 * próximo momento en que Iria puede llamarle ("mañana lunes", "el miércoles",
 * "hoy mismo").
 *
 * PARA QUÉ: María no tiene reloj —sus instrucciones le prohíben deducir el día,
 * porque adivinaría— así que el dato se lo dejamos masticado en el campo
 * `proximo_dia_habil` y ella solo lo lee.
 *
 * QUIÉN LO LLAMA: un paso HTTP del "Árbol entrante RIF" de respond.io, justo
 * antes de que María tome la conversación. Se hace en ese momento y no al crear
 * el lead a propósito: entre que alguien llena el formulario y contesta el
 * WhatsApp pueden pasar días, y un día calculado el viernes ya no sirve el
 * lunes.
 *
 * Cuerpo esperado: { "contactId": 512786007 }
 */

export const maxDuration = 15;

const CAMPO = "proximo_dia_habil";

export async function POST(req: Request) {
  const token = process.env.RESPONDIO_API_TOKEN;
  if (!token) {
    console.error("[dia-habil] falta RESPONDIO_API_TOKEN");
    return NextResponse.json({ error: "no configurado" }, { status: 503 });
  }

  let contactId: unknown;
  try {
    const body = (await req.json()) as { contactId?: unknown };
    contactId = body?.contactId;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const id = Number(contactId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: "contactId debe ser un entero positivo" },
      { status: 400 },
    );
  }

  const frase = fraseDiaHabil(new Date());

  const res = await fetch(
    `https://api.respond.io/v2/contact/create_or_update/id:${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ custom_fields: [{ name: CAMPO, value: frase }] }),
      signal: AbortSignal.timeout(8000),
    },
  ).catch((err) => {
    console.error("[dia-habil] respond.io no respondió:", err);
    return null;
  });

  if (!res || res.status >= 300) {
    // Se devuelve la frase igual: si el árbol prefiere usarla directo en vez de
    // leer el campo, que no se quede sin nada por un fallo de escritura.
    console.error(
      `[dia-habil] no se pudo escribir ${CAMPO} en el contacto ${id}`,
      res ? `(${res.status})` : "(sin respuesta)",
    );
    return NextResponse.json({ frase, escrito: false }, { status: 200 });
  }

  return NextResponse.json({ frase, escrito: true });
}
