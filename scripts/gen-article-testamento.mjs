// Genera el draft "testamento no protege seguros/cuentas" en Portable Text
// y lo agrega (append idempotente) a sanity/seeds/draft-articles.ndjson.
// No sube nada a Sanity — solo prepara el seed. Correr: node scripts/gen-article-testamento.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ndjsonPath = path.join(__dirname, "..", "sanity", "seeds", "draft-articles.ndjson");

let k = 0;
const key = (p) => `${p}${++k}`;

// Helpers Portable Text
const h2 = (text) => ({
  _type: "block", _key: key("b"), style: "h2",
  markDefs: [], children: [{ _type: "span", _key: key("s"), text, marks: [] }],
});
const p = (text) => ({
  _type: "block", _key: key("b"), style: "normal",
  markDefs: [], children: [{ _type: "span", _key: key("s"), text, marks: [] }],
});
// Párrafo con un link interno
const pLink = (pre, linkText, href, post) => {
  const lk = key("l");
  return {
    _type: "block", _key: key("b"), style: "normal",
    markDefs: [{ _type: "link", _key: lk, href }],
    children: [
      { _type: "span", _key: key("s"), text: pre, marks: [] },
      { _type: "span", _key: key("s"), text: linkText, marks: [lk] },
      { _type: "span", _key: key("s"), text: post, marks: [] },
    ],
  };
};

const body = [
  {
    _type: "keyTakeaways", _key: key("b"),
    items: [
      "Tu testamento NO controla tus seguros de vida ni los beneficiarios de tus cuentas bancarias o tu Afore.",
      "La aseguradora paga a quien aparece en la carátula de la póliza, aunque tu testamento diga otra cosa (arts. 175 y 176 LCS).",
      "El banco entrega el saldo completo a tus beneficiarios designados, sin juicio y sin límite de monto (art. 56 LIC).",
      "Un beneficiario desactualizado —o un menor sin administrador designado— puede dejar fuera a quien más quieres.",
    ],
  },
  p("En México hay una idea muy peligrosa: creer que con tener testamento «ya quedó todo resuelto». No es así. El testamento no modifica lo que dicen los contratos privados —como tu póliza de seguro de vida o el contrato de tu cuenta bancaria—."),
  p("Si en tu testamento dejas «todos mis bienes a mi cónyuge», pero en tu póliza pusiste como beneficiarios a tus papás o a una expareja, la aseguradora está obligada a pagarle a quien aparezca en la carátula de la póliza, no a lo que diga el testamento."),

  h2("¿El testamento controla mi seguro de vida?"),
  p("No. El dinero de un seguro de vida normalmente no entra a la masa hereditaria: el beneficiario que designaste adquiere un derecho propio sobre el capital asegurado (arts. 175 y 176 de la Ley sobre el Contrato de Seguro). Por eso ese dinero llega directo a quien nombraste en la póliza, sin pasar por el testamento ni por el juicio sucesorio. La consecuencia práctica: si no actualizas a tus beneficiarios tras un divorcio, un nuevo hijo o un fallecimiento, el capital puede terminar en manos equivocadas."),

  h2("¿Quién recibe el dinero de mi cuenta bancaria cuando fallezco?"),
  p("En los bancos puedes designar beneficiarios con nombre y porcentaje directamente en el contrato. Si están bien registrados, el banco entrega el saldo —completo, sin importar el monto y sin juicio sucesorio— a esas personas, con solo presentar identificación oficial y el acta de defunción (art. 56 de la Ley de Instituciones de Crédito). El remanente solo entra a sucesión si tienes otras cuentas o bienes sin beneficiario designado."),
  p("El riesgo aparece cuando no hay beneficiarios, o cuando los que designaste ya fallecieron: el dinero puede irse a juicio sucesorio y diluirse en tiempo y honorarios. Y si nadie reclama los recursos, tras los plazos que marca la ley pueden pasar a la beneficencia pública (art. 61 de la Ley de Instituciones de Crédito)."),

  h2("¿Qué pasa si dejé a un menor de edad como beneficiario?"),
  p("Dos errores frecuentes en las pólizas: (1) designaciones genéricas como «mis hijos» o «mi familia» en lugar de nombres completos con datos de identificación, lo que abre la puerta a aclaraciones y retrasos; y (2) dejar a un menor de edad como beneficiario directo sin designar quién administrará el dinero. Al fallecer el asegurado, eso obliga a un proceso legal de tutela para decidir quién gestiona los recursos —justo lo contrario de la liquidez inmediata que buscabas—."),

  h2("¿Cómo cobran mi Afore mi pareja e hijos?"),
  p("Para cobrar el saldo de tu Afore o ciertas prestaciones, tus beneficiarios deben estar correctamente registrados en el IMSS o el ISSSTE, según corresponda. Si tu pareja e hijos nunca se dieron de alta, o no se actualizó tu estado civil, con frecuencia tienen que acudir a juicios para acceder a recursos que en teoría deberían fluir solos. Dicho simple: no basta con que te tengan en el corazón; tienen que estar en tus expedientes."),

  h2("¿Cómo alineo testamento, seguros, bancos y Afore?"),
  p("El testamento sigue siendo la pieza central para repartir inmuebles, vehículos, acciones de empresa y demás bienes. Pero su función es coordinar lo que no está definido en contratos específicos. El diseño fino consiste en alinear las cuatro piezas: testamento + pólizas + contratos bancarios + registros en IMSS/ISSSTE."),
  p("La tranquilidad patrimonial no se logra con un solo documento, sino alineando todas las piezas. Hacer reingeniería financiera es asumir que el peor escenario puede pasar y dejarlo resuelto con precisión técnica y emocional. No se trata de desconfiar: se trata de evitar que tus seres queridos tengan que pelear por lo que hoy todavía puedes ordenar con calma."),
  pLink("Y si justo ahora estás acompañando el fallecimiento de un familiar, mi ", "guía de trámites paso a paso", "/guia", " te puede orientar con calma."),

  {
    _type: "disclaimer", _key: key("b"), variant: "legal",
    text: "Este contenido es informativo y no constituye asesoría legal o fiscal individualizada. Las reglas de beneficiarios, sucesión y prestaciones varían según tu caso y la legislación vigente. Confirma siempre tu situación particular con tu asesor y las instituciones correspondientes.",
  },
  {
    _type: "ctaWhatsApp", _key: key("b"),
    heading: "Check-up Patrimonial gratuito",
    text: "¿Hace cuánto no revisas quién aparece como beneficiario en tus pólizas, cuentas bancarias y Afore? Un solo nombre desactualizado puede dejar fuera a quien más quieres.",
    buttonLabel: "Revisemos mis beneficiarios",
    preFilledMessage: "Hola Iria, quiero hacer mi Check-up Patrimonial y revisar mis beneficiarios.",
  },
];

const doc = {
  _id: "article-testamento-no-protege-seguros-cuentas",
  _type: "article",
  draft: true,
  title: "¿Por qué tu testamento no protege tus seguros de vida ni tus cuentas bancarias?",
  slug: { _type: "slug", current: "testamento-no-protege-seguros-vida-cuentas" },
  topic: "patrimonial",
  format: "errores",
  seoTitle: "El testamento no controla tus seguros ni cuentas",
  excerpt: "En México tu testamento no manda sobre tus seguros de vida, cuentas bancarias ni Afore: los rigen los beneficiarios designados. Revisa los tuyos.",
  seoDescription: "En México tu testamento no manda sobre tus seguros de vida, cuentas bancarias ni Afore: los rigen los beneficiarios designados. Revisa los tuyos.",
  tldr: "En México tu testamento no manda sobre tus seguros de vida ni sobre los beneficiarios de tus cuentas bancarias o tu Afore. Esos los rigen los contratos y los registros, no tu última voluntad. Un solo beneficiario desactualizado puede dejar fuera a quien más quieres.",
  questionsAnswered: [
    "¿El testamento controla mi seguro de vida?",
    "¿Quién recibe el dinero de mi cuenta bancaria cuando fallezco?",
    "¿Qué pasa si dejé un menor de edad como beneficiario?",
    "¿Cómo cobran mi Afore mi pareja e hijos?",
    "¿Cómo alineo testamento, seguros, bancos y Afore?",
  ],
  body,
  sources: [],
};

// Validaciones de longitud (límites del schema)
const checks = [
  ["seoTitle", doc.seoTitle, 60],
  ["excerpt", doc.excerpt, 160],
  ["seoDescription", doc.seoDescription, 160],
  ["tldr", doc.tldr, 320],
];
let ok = true;
for (const [name, val, max] of checks) {
  const len = val.length;
  const flag = len <= max ? "✅" : "❌ EXCEDE";
  if (len > max) ok = false;
  console.log(`${flag} ${name}: ${len}/${max}`);
}
if (!ok) { console.error("\n❌ Hay campos que exceden el límite. No se escribió nada."); process.exit(1); }

// Append idempotente: si ya existe el _id en el ndjson, lo reemplaza
const existing = fs.readFileSync(ndjsonPath, "utf8").split("\n").filter((l) => l.trim());
const filtered = existing.filter((l) => {
  try { return JSON.parse(l)._id !== doc._id; } catch { return true; }
});
filtered.push(JSON.stringify(doc));
fs.writeFileSync(ndjsonPath, filtered.join("\n") + "\n", "utf8");

const words = body.filter((b) => b._type === "block").flatMap((b) => b.children?.map((c) => c.text) ?? []).join(" ").split(/\s+/).length;
console.log(`\n✅ Draft agregado a draft-articles.ndjson`);
console.log(`   _id: ${doc._id}`);
console.log(`   bloques body: ${body.length} · ~${words} palabras`);
console.log(`   total drafts en archivo: ${filtered.length}`);
