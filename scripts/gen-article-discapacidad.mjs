// Actualiza el draft "¿Qué pasará con mi hijo con discapacidad / neurodivergencia
// cuando yo falte?" en Sanity (Portable Text). Versión v2 (neurodivergencia +
// engranaje de pilares + 5 errores específicos). Hace SET. Requiere --apply.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PID, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const ID = "article-hijo-discapacidad-cuando-yo-falte";

let k = 0;
const key = (p) => `${p}${++k}`;
const h2 = (t) => ({ _type:"block",_key:key("b"),style:"h2",markDefs:[],children:[{_type:"span",_key:key("s"),text:t,marks:[]}] });
const h3 = (t) => ({ _type:"block",_key:key("b"),style:"h3",markDefs:[],children:[{_type:"span",_key:key("s"),text:t,marks:[]}] });
const p = (t) => ({ _type:"block",_key:key("b"),style:"normal",markDefs:[],children:[{_type:"span",_key:key("s"),text:t,marks:[]}] });
const li = (t) => ({ _type:"block",_key:key("b"),style:"normal",listItem:"bullet",level:1,markDefs:[],children:[{_type:"span",_key:key("s"),text:t,marks:[]}] });
const lin = (b,r) => ({ _type:"block",_key:key("b"),style:"normal",listItem:"number",level:1,markDefs:[],children:[{_type:"span",_key:key("s"),text:b,marks:["strong"]},{_type:"span",_key:key("s"),text:r,marks:[]}] });
const llink = (t,href) => { const lk=key("l"); return { _type:"block",_key:key("b"),style:"normal",listItem:"bullet",level:1,markDefs:[{_type:"link",_key:lk,href}],children:[{_type:"span",_key:key("s"),text:t,marks:[lk]}] }; };
const table = (caption,headers,rows) => ({ _type:"comparisonTable",_key:key("b"),caption,headers,rows:rows.map(r=>({_type:"row",_key:key("r"),cells:r})) });

const body = [
  { _type:"keyTakeaways",_key:key("b"),items:[
    "La pregunta clave no es quién hereda tu patrimonio, sino quién cuidará a tu hij@ y cómo se administrarán los recursos cuando tú no estés.",
    "Dejar dinero no es lo mismo que dejar protección: hace falta estructura, instrucciones y una red de apoyo humana.",
    "La estrategia combina testamento vigente, cálculo del costo real de vida, un mecanismo de administración (fideicomiso) y liquidez inmediata vía seguro de vida.",
    "No necesitas ser millonario para empezar: necesitas claridad metodológica. Lo importante es trazar la línea de defensa hoy.",
  ]},
  p("Si tienes un hij@ con neurodivergencia o necesidades especiales, la pregunta más importante no es quién heredará tu patrimonio, sino quién lo cuidará y cómo se administrarán los recursos cuando tú ya no estés."),
  p("La protección real de tu legado combina una red de apoyo humana, un testamento vigente, liquidez inmediata y, fundamentalmente, una estructura de administración patrimonial diseñada específicamente para su condición —ya sea autismo, TDAH severo, síndrome de Down o cualquier reto del espectro neurodivergente—. Si alguna vez te has preguntado quién cuidará de tu hijo cuando tú ya no estés, este artículo es para ti."),

  h2("El miedo que nadie quiere decir en voz alta"),
  p("Muchos padres de hijos con neurodivergencia viven con una preocupación sorda que rara vez comparten en reuniones sociales o de negocios: ¿qué pasará con mi hij@ cuando yo falte? ¿Quién lo cuidará y dónde vivirá? ¿Quién administrará el dinero sin caer en tentaciones o malas decisiones? ¿Cómo garantizo que sus terapias y medicamentos sigan pagándose en automático?"),
  p("Es natural evadir estos pensamientos, pero ignorarlos no disuelve el riesgo. La planeación patrimonial especializada no consiste en anticipar la muerte; consiste en asegurar la continuidad de la calidad de vida de quienes más amas, incluso cuando tú ya no estés físicamente para supervisarla."),

  h2("Lo que suele ocurrir cuando no existe una estrategia"),
  p("En mi trayectoria como estratega patrimonial he visto familias con patrimonios muy sólidos ver diluirse sus esfuerzos por un solo error: asumir. Asumen que los hermanos «se pondrán de acuerdo», que algún tío «sabrá qué hacer» o que las propiedades se administrarán solas. Cuando falta la estructura, la realidad suele ser fría:"),
  li("Surgen fricciones familiares severas por el control de los recursos."),
  li("Las decisiones médicas y de cuidado diario quedan en un limbo legal y operativo."),
  li("El patrimonio se fragmenta o se usa para fines ajenos al bienestar del hij@."),
  li("En el peor escenario, el miembro más vulnerable termina dependiendo de la pura buena voluntad de terceros."),
  p("El diagnóstico es claro: el problema casi nunca es la falta de activos; es la ausencia de instrucciones, estructura y coordinación legal."),

  h2("La diferencia crítica entre dejar dinero y dejar protección"),
  p("Existe una brecha enorme entre heredar recursos y construir un ecosistema de protección. Dejar una casa, una cuenta bancaria o un portafolio de inversión es un excelente primer paso, pero los inmuebles no supervisan terapias, las cuentas de banco no coordinan médicos y las inversiones no toman decisiones con empatía. Por ello, estas familias requieren una planeación mucho más profunda que una sucesión tradicional."),

  h2("Los cuatro pilares para proteger el futuro de tu hijo"),
  p("Para que el futuro de tu hij@ funcione casi en piloto automático, tu estrategia debe sostenerse firmemente sobre cuatro pilares:"),
  table("La estructura de protección total",
    ["1. Testamento actualizado","2. Cálculo real futuro","3. Fideicomiso familiar","4. Liquidez inmediata"],
    [["Base jurídica y tutores","Costo de vida a 20-50 años","Administra y blinda los recursos","Efectivo desde el primer día"]]),
  h3("1. Un testamento actualizado"),
  p("Es la base jurídica primaria. Te permite nombrar tutores testamentarios y expresar tu voluntad legal. Sin embargo, por sí solo es un documento estático: designa a quién le dejas los bienes, pero no tiene la capacidad de operar el cómo se gasta el dinero día con día."),
  h3("2. Recursos calculados al futuro (costo real de vida)"),
  p("La mayoría de los padres calcula la escuela o la universidad. Pocos se sientan a proyectar 20, 30 o 50 años de terapias, medicamentos, vivienda adaptada, transporte y cuidadores especializados. Cuando aplicamos análisis financiero a esos flujos de gasto recurrentes, la cifra suele ser considerablemente mayor de lo estimado a simple vista. Saber ese número es lo que te da la pauta de acción."),
  p("He visto padres de más de 65 años con hijos de 35 años o más que siguen siendo económicamente dependientes. Cuando haces los números correctamente, descubres que no estás planeando para 10 años más, sino para 30 o 40 años."),
  h3("3. Un mecanismo de administración (el fideicomiso)"),
  p("Para proteger los recursos de malas ejecuciones, se estructuran vehículos como los fideicomisos de administración. Tú dejas las reglas escritas hoy —cuánto se libera al mes, bajo qué condiciones, qué facturas se pagan directamente— y una institución fiduciaria se encarga de cumplirlas, blindando el dinero frente a demandas, divorcios de otros hijos o abusos de terceros."),
  h3("4. Liquidez inmediata"),
  p("Un riesgo crítico es tener «riqueza atrapada». Las propiedades pueden tardar años en venderse y los juicios sucesorios congelan cuentas bancarias durante meses. Aquí los seguros de vida actúan como herramientas de alta ingeniería financiera: inyectan capital en efectivo a los pocos días del fallecimiento, garantizando que el flujo para los cuidados de tu hij@ jamás se detenga."),

  h2("Más allá del dinero: la Carta de Intención"),
  p("La arquitectura financiera es vital, pero la gestión humana lo es todo. Nadie conoce las rutinas, los disparadores de ansiedad, las preferencias o los canales de comunicación de tu hij@ mejor que tú."),
  p("Toda esa sabiduría debe quedar plasmada en una Carta de Intención: no es un contrato legal rígido, sino una guía de navegación detallada para la red de apoyo (familiares, amigos, especialistas) que asumirá el acompañamiento diario. Es el manual de usuario que tú escribes para asegurar que su mundo siga siendo predecible y seguro."),

  h2("No necesitas ser millonario para empezar"),
  p("Un error común es pensar que este nivel de planeación está reservado para patrimonios masivos. Es falso. Lo que necesitas no es una fortuna inicial, sino claridad metodológica. Una primera versión de tu plan puede arrancar hoy mismo con:"),
  li("Un testamento con cláusulas específicas para su condición."),
  li("Beneficiarios correctamente alineados en tus cuentas actuales."),
  li("Un seguro de vida dimensionado al costo real de sus cuidados futuros."),
  li("Tu primera Carta de Intención redactada."),
  p("Lo importante no es tener el esquema perfecto y definitivo mañana, sino trazar la línea de defensa hoy."),

  h2("Los 5 errores más comunes que veo en la práctica"),
  lin("Confiar ciegamente en la «buena voluntad».", " El amor de la familia extendida es real, pero las circunstancias cambian. La buena voluntad sin estructura jurídica se quiebra ante las crisis."),
  lin("Dejar herencias directas a nombre del hij@.", " Si requiere apoyos significativos para tomar decisiones, heredarle bienes directamente puede frenar los activos en procesos judiciales prolongados."),
  lin("No actualizar designaciones por años.", " Divorcios, mudanzas de país o fallecimientos de antiguos beneficiarios pueden volver obsoleto un plan de la noche a la mañana."),
  lin("Saturar al «hermano responsable».", " Asumir que un hermano absorberá toda la carga financiera, legal y emocional sin una conversación estratégica previa es una receta para el resentimiento."),
  lin("Improvisar el cálculo de largo plazo.", " No considerar la inflación médica en los fondos de reserva suele dejar las estrategias a mitad de camino cuando los padres faltan."),

  { _type:"checklistDiscapacidad",_key:"checklistdiscapacidad1" },

  { _type:"ctaWhatsApp",_key:key("b"),
    heading:"¿Hablamos de tu situación?",
    text:"Cada familia neurodivergente vive una realidad única: la estrategia perfecta depende de la edad de tu hij@, el nivel de autonomía que proyecte para su vida adulta, tu estructura patrimonial y la solidez de tu red de apoyo. Si quieres dejar de adivinar y diseñar un plan personalizado, agenda una sesión de diagnóstico inicial sin costo. Una hora de planeación puede borrar años de preocupación silenciosa.",
    buttonLabel:"Agenda tu sesión estratégica (sin costo)",
    preFilledMessage:"Hola Iria, tengo un hij@ neurodivergente y quiero diseñar un plan para protegerlo a largo plazo." },

  { _type:"disclaimer",_key:key("b"),variant:"legal",text:"Este artículo es de carácter informativo y de divulgación financiera; no sustituye la asesoría legal, notarial o fiscal personalizada. Las figuras jurídicas mencionadas deben estructurarse conforme a la legislación vigente aplicable en tu localidad y a la situación particular de cada familia." },

  h2("Recursos relacionados"),
  llink("Asesoría para familias con hijos neurodivergentes", "/personas/hijos-neurodivergentes"),
  llink("Asesoría patrimonial: protege y ordena el futuro de tu familia", "/patrimonial"),
  llink("Por qué tu testamento no protege tus seguros ni tus cuentas", "/blog/testamento-no-protege-seguros-vida-cuentas"),
];

const set = {
  title:"¿Qué pasará con mi hijo autista o con discapacidad cuando yo falte?",
  seoTitle:"¿Cómo proteger a mi hijo autista o con discapacidad?",
  excerpt:"Cómo proteger el futuro de un hijo con autismo, síndrome de Down o discapacidad cuando tú ya no estés.",
  seoDescription:"Cómo proteger el futuro de un hijo con autismo, síndrome de Down o discapacidad cuando tú ya no estés: testamento, seguro de vida, fideicomiso y red de apoyo.",
  tldr:"Si tienes un hijo con autismo, síndrome de Down u otra discapacidad, la pregunta clave no es quién heredará tu patrimonio, sino quién lo cuidará y cómo se administrarán los recursos cuando tú no estés. La protección combina red de apoyo, testamento vigente, liquidez inmediata y una estructura patrimonial sólida.",
  questionsAnswered:[
    "¿Qué pasará con mi hijo con discapacidad o neurodivergencia cuando yo falte?",
    "¿Cómo protejo a mi hijo neurodivergente cuando yo no esté?",
    "¿Cuáles son los pilares para proteger el futuro de un hijo con discapacidad?",
    "¿Qué es una Carta de Intención para mi hijo?",
    "¿Cuáles son los errores más comunes al planear para un hijo neurodivergente?",
  ],
  body,
};

const lens=[["seoTitle",set.seoTitle,60],["excerpt",set.excerpt,160],["seoDescription",set.seoDescription,160],["tldr",set.tldr,320]];
let ok=true;
for (const [n,v,m] of lens){ const f=v.length<=m?"OK":"EXCEDE"; if(v.length>m)ok=false; console.log(`${f} ${n}: ${v.length}/${m}`); }
const words=body.filter(b=>b._type==="block").flatMap(b=>b.children?.map(c=>c.text)??[]).join(" ").split(/\s+/).length;
console.log(`body: ${body.length} bloques · ~${words} palabras`);
if(!ok){ console.error("Hay campos que exceden el limite."); process.exit(1); }

if(!process.argv.includes("--apply")){ console.log("\nDRY-RUN. Corre con --apply para actualizar el draft."); process.exit(0); }
const r=await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`,{method:"POST",headers:{Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({mutations:[{patch:{id:ID,set}}]})});
if(!r.ok){ console.error("ERROR",r.status,await r.text()); process.exit(1); }
console.log("\nOK · draft actualizado (v2 neurodivergencia). _id:",ID);
