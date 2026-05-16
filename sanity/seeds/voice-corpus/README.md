# Voice corpus — cómo escribe Iria Talan

Esta carpeta es el "cerebro de voz" del agente `iriatalan-seo-blog`. Cada archivo aquí es markdown editable a mano (por Iria o por el agente cuando se ejecuta `/draft-learn`).

## Por qué existe

Los modelos LLM no se reentrenan desde el cliente. Lo que sí podemos hacer es alimentarle al agente, antes de redactar cada draft, un conjunto de referencias sobre cómo escribe Iria. Cada draft mejor que el anterior no es porque el modelo aprendió — es porque tiene mejor referencia en su context window.

## Cómo funciona el flujo

1. El agente, al entrar a **Modo 2 (DRAFT)** o **Modo 5 (BRIEF)**, lee estos archivos en pre-flight.
2. Cuando Iria corrige un draft y lo regresa, ella puede invocar `/draft-learn <slug>` para que el comando extraiga del diff los cambios y los categorice.
3. Cada cambio se escribe al archivo correspondiente:
   - Frase que Iria reemplazó → `iria-voice-dont.md` (la original) + `iria-voice-do.md` (la nueva)
   - Término nuevo o ajustado → `iria-vocabulary.md`
   - Párrafo completo con voz clara → `iria-example-paragraphs.md`

## Archivos

| Archivo | Qué guarda |
|---|---|
| `iria-voice-do.md` | Frases, modos de decir, transiciones, ritmos que SÍ son de Iria |
| `iria-voice-dont.md` | Frases que Iria NUNCA usaría (incluye correcciones reales) |
| `iria-vocabulary.md` | Terminología específica (productos, carriers, nichos, conceptos legales) |
| `iria-example-paragraphs.md` | Párrafos modelo completos para style transfer |

## Reglas de mantenimiento

- **Sin cifras YMYL aquí**. El corpus es sobre voz, no sobre datos. Las cifras viven en los drafts con `[VERIFICAR_CIFRA]` cuando aplica.
- **Sin PII de clientes reales**. Si capturas un patrón de caso real, anonimiza ("un cliente Régimen 73 con 700 semanas", no "Juan Pérez con NSS 1234").
- **Una observación por línea o por bloque corto**. Más fácil de leer y de combinar en context.
- **Datar las entradas grandes**. `(2026-05-14)` al final de la línea ayuda a entender cuándo se aprendió.
- **El agente puede agregar** entradas pero NO borrar/editar las existentes sin OK explícito de Iria.

## Por qué archivos separados y no uno solo

Para que el agente pueda priorizar al cargar contexto. En sesiones donde el draft es corto, puede cargar solo `iria-voice-do.md` y `iria-voice-dont.md`. En sesiones de un draft pillar puede cargar los 4. Separados también facilitan que `/draft-learn` escriba a la sección correcta sin merge conflicts.

---

Mantenimiento: Iria + agente vía `/draft-learn`.
