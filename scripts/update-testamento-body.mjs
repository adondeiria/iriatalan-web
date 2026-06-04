// Reescribe el body del artículo de testamento con 3 mejoras editoriales:
// (1) ejemplo emocional, (2) sección "Los 5 errores más comunes",
// (3) sección "Artículos relacionados" con enlaces internos.
// Preserva el bloque checkupDownload. Hace SET del body. Requiere --apply.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PID, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const ID = "article-testamento-no-protege-seguros-cuentas";

let k = 0;
const key = (p) => `${p}${++k}`;
const h2 = (text) => ({ _type:"block", _key:key("b"), style:"h2", markDefs:[], children:[{_type:"span",_key:key("s"),text,marks:[]}] });
const p = (text) => ({ _type:"block", _key:key("b"), style:"normal", markDefs:[], children:[{_type:"span",_key:key("s"),text,marks:[]}] });
// list item numerado con una parte en negrita + resto normal
const liNum = (bold, rest) => ({ _type:"block", _key:key("b"), style:"normal", listItem:"number", level:1, markDefs:[],
  children:[{_type:"span",_key:key("s"),text:bold,marks:["strong"]},{_type:"span",_key:key("s"),text:rest,marks:[]}] });
// párrafo con link interno
const pLink = (pre, linkText, href, post) => { const lk=key("l"); return { _type:"block", _key:key("b"), style:"normal",
  markDefs:[{_type:"link",_key:lk,href}], children:[{_type:"span",_key:key("s"),text:pre,marks:[]},{_type:"span",_key:key("s"),text:linkText,marks:[lk]},{_type:"span",_key:key("s"),text:post,marks:[]}] }; };
// list item con link interno
const liLink = (linkText, href, suffix) => { const lk=key("l"); return { _type:"block", _key:key("b"), style:"normal", listItem:"bullet", level:1,
  markDefs:[{_type:"link",_key:lk,href}], children:[{_type:"span",_key:key("s"),text:linkText,marks:[lk]},{_type:"span",_key:key("s"),text:suffix,marks:[]}] }; };

const body = [
  { _type:"keyTakeaways", _key:key("b"), items:[
    "Tu testamento NO controla tus seguros de vida ni los beneficiarios de tus cuentas bancarias o tu Afore.",
    "La aseguradora paga a quien aparece en la carátula de la póliza, aunque tu testamento diga otra cosa (arts. 175 y 176 LCS).",
    "El banco entrega el saldo completo a tus beneficiarios designados, sin juicio y sin límite de monto (art. 56 LIC).",
    "Un beneficiario desactualizado —o un menor sin administrador designado— puede dejar fuera a quien más quieres.",
  ]},
  p("En México hay un mito peligroso: creer que con tener testamento «ya quedó todo resuelto». No es así. El testamento no manda sobre tus contratos privados —tu seguro de vida, tu cuenta bancaria, tu Afore—. Si dejas «todo a mi cónyuge» en el testamento, pero tu póliza nombra a tus papás o a una expareja, la aseguradora le paga a quien está en la carátula, no a lo que diga el testamento."),

  h2("¿El testamento controla mi seguro de vida?"),
  p("No. El beneficiario que designaste adquiere un derecho propio sobre el capital (arts. 175 y 176 LCS): el dinero llega directo a quien nombraste, sin testamento ni juicio sucesorio. Lo he visto en la práctica: una expareja terminó cobrando una póliza solo porque el beneficiario nunca se actualizó tras el divorcio. Si no los actualizas tras un divorcio, un hijo nuevo o un fallecimiento, el capital puede terminar en manos equivocadas."),

  h2("¿Quién recibe el dinero de mi cuenta bancaria cuando fallezco?"),
  p("En los bancos puedes designar beneficiarios directamente en el contrato. Si están registrados correctamente, el banco entrega el saldo a esas personas sin necesidad de juicio sucesorio. El problema aparece cuando no hay beneficiarios o los datos están desactualizados: ahí el proceso puede complicarse y retrasarse."),

  h2("¿Qué pasa si dejé a un menor de edad como beneficiario?"),
  p("Dejar a un menor como beneficiario directo puede generar retrasos importantes. Si no existe una estructura adecuada para administrar esos recursos, será necesario un proceso legal para determinar quién los gestionará hasta que alcance la mayoría de edad. Por eso conviene revisar esta situación con anticipación."),

  h2("Los 5 errores más comunes con beneficiarios"),
  liNum("No actualizarlos tras un divorcio.", " La expareja puede seguir cobrando una póliza que ya no querías que recibiera."),
  liNum("Nombrar a un menor sin administrador.", " Obliga a un proceso de tutela para liberar el dinero."),
  liNum("Poner «mis hijos» en lugar de nombres completos.", " Las designaciones genéricas causan retrasos."),
  liNum("No revisarlos durante años.", " La vida cambia —matrimonios, hijos, fallecimientos— y el papel se queda viejo."),
  liNum("Pensar que el testamento lo corrige todo.", " No manda sobre tus pólizas, cuentas ni Afore."),

  h2("¿Cómo alineo testamento, seguros, bancos y Afore?"),
  p("El testamento sigue siendo fundamental para repartir inmuebles, empresas y otros bienes. Sin embargo, pólizas, cuentas bancarias y algunos recursos previsionales se rigen por beneficiarios designados. La clave es mantener alineados testamento, seguros, bancos y registros institucionales para evitar conflictos futuros."),

  { _type:"checkupDownload", _key:"checkupdl1" },

  { _type:"disclaimer", _key:key("b"), variant:"legal", text:"Este contenido es informativo y no constituye asesoría legal o fiscal individualizada. Las reglas de beneficiarios, sucesión y prestaciones varían según tu caso y la legislación vigente. Confirma siempre tu situación particular con tu asesor y las instituciones correspondientes." },

  h2("Artículos y recursos relacionados"),
  liLink("¿Qué hacer cuando fallece un familiar? — guía de 8 trámites", "/guia", ""),
  liLink("Asesoría patrimonial: blinda y ordena tu patrimonio", "/patrimonial", ""),

  { _type:"ctaWhatsApp", _key:"b36",
    heading:"¿Ordenamos tu estrategia patrimonial?",
    text:"Revisar quién aparece como beneficiario en tus pólizas, cuentas y Afore es algo que puedes empezar hoy con tus propias instituciones. Lo que yo hago es ayudarte a diseñar y alinear tu protección patrimonial. Si ya eres mi cliente, revisamos juntos tus pólizas; si aún no, te oriento para empezar.",
    buttonLabel:"Quiero asesoría patrimonial",
    preFilledMessage:"Hola Iria, quiero asesoría para ordenar mi estrategia patrimonial." },
];

if (!process.argv.includes("--apply")) {
  console.log(`🟡 DRY-RUN · body con ${body.length} bloques (incluye 5 errores, ejemplo emocional, relacionados, checkupDownload).`);
  process.exit(0);
}
// questionsAnswered alineado con los H2 reales (sin Afore, que se vuelve artículo aparte).
const questionsAnswered = [
  "¿El testamento controla mi seguro de vida?",
  "¿Quién recibe el dinero de mi cuenta bancaria cuando fallezco?",
  "¿Qué pasa si dejé un menor de edad como beneficiario?",
  "¿Cuáles son los errores más comunes con beneficiarios?",
  "¿Cómo alineo testamento, seguros y bancos?",
];
const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method:"POST", headers:{ Authorization:`Bearer ${TOKEN}`, "Content-Type":"application/json" },
  body: JSON.stringify({ mutations:[{ patch:{ id:ID, set:{ body, questionsAnswered } } }] }),
});
if (!r.ok) { console.error(`❌ ${r.status} ${await r.text()}`); process.exit(1); }
console.log(`✅ Body actualizado · ${body.length} bloques · emoción + 5 errores + relacionados + check-up preservado.`);
