# Spec A — Blog conductor Nivel 0 (validación en TALAN)

**Fecha**: 2026-05-15
**Autor**: Iria Talan + Claude (brainstorming guiado por skill `superpowers:brainstorming`)
**Estado**: 🟡 Pendiente de aprobación final por Iria antes de invocar `writing-plans`

---

## Contexto

Iria invierte 2 días por blog manualmente. El cuello de botella se reparte entre research + fact-check, humanización del texto, push a Sanity y propagación a producción. La sesión 2026-05-15 construyó el agente conductor + 9 slash commands + scripts + endpoint revalidate para reducir ese ciclo.

Esta spec valida que el sistema funciona en TALAN como cliente #0 (dogfooding) antes de planear el producto comercial multi-tenant (Spec C futura). Forma parte de un proyecto más grande "empresa de agentes IA para asesores de seguros MX/LATAM" decompuesto así:

- **Spec A (esta)**: Cerrar Nivel 0 en TALAN + producir 2-4 blogs reales.
- **Spec B (futura)**: Validación comercial — landing + waitlist + entrevistas 10-20 asesores.
- **Spec C (futura)**: Producto multi-tenant Nivel 1 — auth, billing, adaptador WordPress.

---

## Sección 1 — Objetivo y criterio de éxito

**Objetivo**: el agente escritor SEO produce contenido semanal proactivo basado en backlog de ideas + criterios editoriales (seasonality MX, topic gap, nicho), no en órdenes reactivas de Iria.

**Cadencia objetivo**: 1 blog publicado live por semana = 4-5 al mes (cadencia óptima para SEO compounding según opinión común de la industria; no se afirma como spec oficial).

**Métrica de éxito**:
- Blog #2 producido en ≤ 4 horas activas de Iria (vs los 2 días = 16h+ del flujo manual).
- ≥1 blog publicado live por semana durante las 4 semanas del piloto.

**Criterios de aceptación**:
- 4 blogs reales publicados live en `iriatalan.com.mx/blog` vía el conductor.
- Cada blog pasa fact-check YMYL (≥3 fuentes oficiales citadas, sin `[VERIFICAR_CIFRA]` residual).
- Cada blog suena a voz Iria (≥4/5 valoración manual de Iria).
- Tiempo activo registrado por blog en campos `metrics.*` del state file.
- 0 intervención manual en Sanity Studio post-publish (todo automático).

**Out of scope**:
- Multi-tenant, auth, billing.
- Adaptador WordPress / Wix / otros CMS.
- Landing /asesores y sign-up funnel.
- Onboarding self-serve.

---

## Sección 2 — Inventario de lo construido (sesión 2026-05-15)

| Pieza | Estado | Ruta |
|---|---|---|
| Agente conductor | ✅ Creado | `.claude/agents/iriatalan-blog-conductor.md` |
| Agente escritor SEO | ✅ Pre-existente (Modos 1-5) | `.claude/agents/iriatalan-seo-blog.md` |
| Agente publisher Sanity | ✅ Pre-existente | `.claude/agents/iriatalan-sanity-publisher.md` |
| 9 slash commands `/blog-*` | ✅ Creados | `.claude/commands/blog-*.md` |
| State file pipeline | ✅ Creado | `sanity/seeds/blog-pipeline-state.json` |
| Script export Word | ✅ Creado | `scripts/draft-export-docx.mjs` |
| Script verify producción | ✅ Creado | `scripts/draft-verify-live.mjs` |
| `draft-push.mjs --publish` | ✅ Extendido | `scripts/draft-push.mjs` |
| Endpoint `/api/revalidate` | ✅ Creado | `src/app/api/revalidate/route.ts` |
| Doc BLOG.md actualizada | ✅ Actualizada | `docs/BLOG.md` |
| `.gitignore /borradores/` | ✅ Listo | `.gitignore` |
| Voice corpus | ✅ Pre-existente | `sanity/seeds/voice-corpus/` |
| Idea backlog | ✅ Pre-existente (vacío) | `sanity/seeds/idea-backlog.md` |
| Draft history | ✅ Pre-existente (1 blog) | `sanity/seeds/draft-history/` |

---

## Sección 3 — Gap analysis (lo que falta para cerrar Nivel 0)

### Setup operativo (Iria, ~30 min total)

1. `cd C:\Users\iriat\Documents\iriatalan-web && npm install docx --save-dev`
2. Generar `REVALIDATE_SECRET` (string aleatoria ≥32 chars) → `.env.local` + Vercel env vars (Production + Preview).
3. Agregar `SITE_URL=https://iriatalan.com.mx` a `.env.local`.
4. Verificar `SANITY_API_WRITE_TOKEN` todavía válido en `.env.local`.
5. Commit + push de los archivos nuevos para que `/api/revalidate` exista en Vercel.

### Construcción pendiente (Claude, ~1.5h)

| Pieza | Por qué | Esfuerzo estimado |
|---|---|---|
| `/blog-week` slash command | Modo proactivo semanal — no existe todavía | 30 min |
| `/blog-archive <slug>` slash command | Pausar/cancelar blog sin romper state | 15 min |
| Campos `metrics.*` en state file schema | Capturar tiempo activo, revisiones, costo tokens por blog | 15 min |
| Dry-run E2E con blog de prueba | Validar que TODO conecta | 30 min |

### Decisiones conscientes de NO construir en Nivel 0

- Cron automático real (Vercel Cron / `schedule` skill) → Iria corre `/blog-week` cuando quiera.
- Notificaciones a teléfono/email cuando un blog cambia de fase → overkill para 4-5 blogs/mes single-tenant.
- Dashboard visual del pipeline → `/blog-status` en chat es suficiente.

---

## Sección 4 — Selección de 4 blogs piloto

| # | Slug propuesto | Topic | Audiencia | Reto técnico |
|---|---|---|---|---|
| 1 | `incremento-costos-universitarios-mexico` | educacionales | Padres mexicanos en México | INEGI / colegiaturas — datos duros |
| 2 | `universidades-elite-mexicanos-extranjero` | educacionales | Mexicanos viviendo fuera (nicho TALAN) | Costos internacionales — múltiples fuentes |
| 3 | `ppr-deduccion-impuestos-mexico` | retiro / fiscal | Profesionistas con declaración anual SAT | Fact-check denso Art. 151 LISR, topes anuales, SAT |
| 4 | `incremento-costo-seguro-medico-retiro` | gmm / patrimonial | 40+ planificando vejez | Cifras AMIS / CONDUSEF + carriers + tablas |

### Cobertura del piloto

- 3 topics distintos (educacionales × 2, retiro, gmm).
- 4 formatos posibles (el agente decide en brief: que-es / comparativa / guía / errores).
- 4 niveles de fact-check (medio, medio, alto SAT/LISR, alto AMIS/CNSF).
- 4 audiencias TALAN reales (cada una mapea a un nicho diferenciador).

### Orden de ejecución (4 semanas)

1. **Semana 1**: `incremento-costos-universitarios-mexico` → empieza simple, valida flow E2E sin fact-check máximo.
2. **Semana 2**: `universidades-elite-mexicanos-extranjero` → segundo educacional, valida que voice corpus mejoró con `/draft-learn` post-1.
3. **Semana 3**: `ppr-deduccion-impuestos-mexico` → primer fact-check pesado SAT/LISR. Si pasa esto, el agente está validado para YMYL fiscal.
4. **Semana 4**: `incremento-costo-seguro-medico-retiro` → cifras AMIS/CNSF + tablas. Cierra el piloto con el caso más complejo.

Los 4 slugs son NUEVOS — el conductor los crea vía `iriatalan-seo-blog` Modo 5 (idea → brief → NDJSON) en la fase de arranque de cada semana.

---

## Sección 5 — Métricas a recolectar

### Eficiencia operacional (campos `metrics.*` en state file)

| Métrica | Cómo se captura | Target |
|---|---|---|
| Tiempo activo de Iria (min) | Cronómetro manual al cerrar cada etapa | ≤ 240 min total |
| Tiempo total elapsed (h) | Diff entre `created` y `verifiedAt` del state | ≤ 7 días |
| Rondas de `/blog-apply-edits` | Counter en `edits.round` | ≤ 2 |
| Regeneraciones imagen Higgsfield | Counter en `imageConcept.attempts` | ≤ 3 |

### Calidad (post-publish, captura manual)

| Métrica | Cómo se captura | Target |
|---|---|---|
| ¿Pasó fact-check sin placeholders? | Iria revisa Word, marca sí/no | 100% sí |
| Voice score (1-5) | Iria valora si "suena a mí" | ≥ 4 |
| Muletillas IA detectadas (count) | Iria cuenta frases tipo "en este artículo / exploraremos" | ≤ 2 |
| Fuentes oficiales con publisher | Counter en `sources` con publisher no vacío | ≥ 3 |

### Costo (auto-capturado por scripts)

| Métrica | Cómo se captura | Target |
|---|---|---|
| Tokens Claude API | Estimado al cierre de sesión | Reporte informativo |
| Créditos Higgsfield | Del response del MCP | Reporte informativo |

### Impacto SEO (post-publish, semana +4 y +8)

| Métrica | Fuente | Target a 8 semanas |
|---|---|---|
| Indexed en Google | Search Console | 100% indexed |
| Impresiones | Search Console | Baseline informativo |
| Citation en Perplexity/ChatGPT | Test manual con query natural | Aspiracional, no required |

### Cambios al código

Agregar 4 campos al schema de `sanity/seeds/blog-pipeline-state.json`:
- `metrics.activeTimeMinutes` (number)
- `metrics.factCheckPassed` (boolean)
- `metrics.voiceScore` (number 1-5)
- `metrics.aiMolestiesCount` (number)

---

## Sección 6 — Riesgos y planes de contingencia

### Riesgos técnicos

| Riesgo | Mitigación | Cuándo |
|---|---|---|
| Cifra YMYL incorrecta llega a producción | Guardrail 3 del agente seo-blog bloquea sin 3 tool uses min. Highlighting amarillo en Word. Validate flag `[VERIFICAR_CIFRA]` residual | Pre-publish |
| Higgsfield sin créditos (memoria: plan FREE 2026-05-06) | Upgrade plan antes de Semana 1 O usar imagen stock con label "imagen ilustrativa" | Pre-piloto |
| Revalidate endpoint falla | Fallback a ISR 30s automático. Verify-live retry-able manual | En `/blog-publish` |
| Sanity token expirado | Script ya da error claro. Iria regenera en sanity.io/manage | Cuando aparezca |
| Voice corpus contamination | Iria solo acepta correcciones que reflejan SU voz | Cada `/blog-apply-edits` |

### Riesgos regulatorios YMYL

| Riesgo | Mitigación |
|---|---|
| Disclaimer obligatorio faltante | Schema Sanity tiene custom block `disclaimer`. Agente lo pone en cada draft. Conductor verifica antes de publish |
| Promesa de rendimiento o "mejor producto" | Anti-hallucination guardrail prohíbe hype. `voice-corpus/iria-voice-dont.md` lista las frases vetadas |
| Cita de carrier como "hecho regulatorio" | Critical rule del agente: solo CNSF/AMIS/CONDUSEF/Banxico/IMSS/SAT/BMV/INEGI son fuentes oficiales |

### Riesgos operacionales

| Riesgo | Mitigación |
|---|---|
| Iria sin tiempo de revisar | `/blog-status` muestra estancados. State es resumible con `/blog-resume` |
| Cambio de scope mid-piloto | Spec aprobada como guardrail. Cambios requieren reabrir spec |

### Tripwires (paramos el piloto y reevaluamos)

- ⚠️ 2 blogs fallan fact-check sin que Iria los corrija → producto no captura YMYL bien.
- ⚠️ Tiempo activo > 6h por blog → no estamos ahorrando tiempo (criterio éxito fallido).
- ⚠️ Voice score promedio < 3/5 → corpus no captura tu voz, hay que repensar.
- ⚠️ Iria reporta "prefiero escribir yo" → matas el proyecto, vamos a Spec B con otro flagship.

---

## Sección 7 — Qué viene después de Spec A

Al cerrar Spec A con éxito (4 blogs live + métricas dentro de targets):

1. **Análisis de métricas** del piloto → informa diseño de Spec B (qué dolor compraría un asesor externo).
2. **Spec B**: Validación comercial — landing `/asesores`, waitlist, 10-20 entrevistas asesores AMASFAC/MDRT, análisis willingness-to-pay.
3. **Spec C**: Producto multi-tenant Nivel 1 — auth, billing, adaptador WordPress, onboarding self-serve. Diseñado con data real de Spec B.

Si tripwires de Spec A se disparan, regresamos a brainstorming general antes de pasar a B.

---

## Apéndice — Decisiones clave del brainstorming

| Decisión | Opciones consideradas | Elegida | Razón |
|---|---|---|---|
| Tipo de empresa | Marblism MX / Agencia / Vertical asesores MX / Marketplace | Vertical asesores MX | Credibilidad MDRT + AMASFAC como MOAT no replicable |
| Estrategia inicial | Build then sell / Sell then build / Dogfooding | Dogfooding | Iria es cliente #0; valida con su tiempo real ahorrado |
| Flagship product | Cobranza / WhatsApp Suite / Escritor SEO / María Bot | Escritor SEO | Dolor reciente (Modalidad 40 = 2 días), aplicable a todo asesor |
| Entregable | Solo Word / Word + push CMS / Suite hosting completo / Solo chat | Word + push CMS | Más valor pero MVP factible. Sanity primero, WordPress después |
| Arquitectura tenancy | Multi-tenant día 1 / Single-tenant TALAN primero / Híbrido | Single-tenant TALAN primero | Reciclar 100% código actual. Multi-tenant cuando llegue cliente #1 |
| Cadencia editorial | 1/semana / 2-3/semana / 1-2/mes / Variable | 1/semana (4-5/mes) | Óptimo SEO compounding según opinión común |
| Apply edits del Word | Pegar texto chat / Extract .docx / Edit .md directo | Pegar texto chat | Confiable, no pierde formato |
| Auto-publish | Tras checkpoints / Siempre draft:true / Con ventana cancel 10s | Tras 3 checkpoints | 3 OK humanos (Word, imagen, confirmación final) + auto |

---

## Próximo paso

Si Iria aprueba este spec sin cambios, invocar `superpowers:writing-plans` para generar el plan de implementación detallado.

Si pide cambios, regresar al brainstorming, ajustar las secciones afectadas, actualizar este doc, volver a self-review.
