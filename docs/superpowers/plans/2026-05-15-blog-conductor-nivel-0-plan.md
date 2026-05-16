# Blog Conductor Nivel 0 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validar el agente escritor SEO en TALAN como cliente #0 produciendo 4 blogs live en 4 semanas, con métricas que informen el diseño de Spec B (validación comercial).

**Architecture:** El agente conductor `iriatalan-blog-conductor` orquesta el pipeline editorial end-to-end con 11 fases, delegando research/draft a `iriatalan-seo-blog` (Modos 1-5) y push a scripts `draft-push.mjs --publish` + `draft-verify-live.mjs`. State persistente en `sanity/seeds/blog-pipeline-state.json`. Word export con highlighting via `scripts/draft-export-docx.mjs` (lib `docx`). Imagen via Higgsfield MCP. Auto-publish con revalidate vía endpoint `src/app/api/revalidate/route.ts`.

**Tech Stack:** Next.js App Router (Vercel ISR 30s), Sanity CMS, Node.js (scripts/*.mjs), npm lib `docx`, Claude Code (agents + commands), Higgsfield MCP.

**Spec source:** [docs/superpowers/specs/2026-05-15-blog-conductor-nivel-0-design.md](../specs/2026-05-15-blog-conductor-nivel-0-design.md)

---

## Phase 0 — Setup operacional (Iria, ~30 min)

> Estas tareas las hace Iria desde terminal local. Claude no las ejecuta — supervisa y confirma.

### Task 0.1: Instalar lib docx

**Files:**
- Modify: `package.json` (npm agregará automáticamente)
- Modify: `package-lock.json` (auto)

- [ ] **Step 1: Ir al directorio del repo**

```powershell
cd C:\Users\iriat\Documents\iriatalan-web
```

- [ ] **Step 2: Instalar dependencia dev**

```powershell
npm install docx --save-dev
```

Expected: agrega `"docx": "^8.x.x"` (o versión actual) a `devDependencies` en `package.json`. Sin errores.

- [ ] **Step 3: Verificar instalación**

```powershell
node -e "import('docx').then(m => console.log('docx OK:', Object.keys(m).slice(0,5)))"
```

Expected: imprime `docx OK: [ 'Document', 'Packer', 'Paragraph', 'TextRun', ... ]`. Si dice "ERR_MODULE_NOT_FOUND", reinstalar.

### Task 0.2: Generar y setear REVALIDATE_SECRET

**Files:**
- Modify: `.env.local` (agregar variable)
- Modify (vía Vercel UI): Vercel project env vars

- [ ] **Step 1: Generar secret aleatorio de 64 caracteres**

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Expected: imprime una cadena hex de 64 chars. Cópiala — la vas a usar dos veces.

- [ ] **Step 2: Agregar a .env.local**

Abre `C:\Users\iriat\Documents\iriatalan-web\.env.local` en tu editor. Agrega al final:

```
REVALIDATE_SECRET=<la-cadena-que-copiaste>
```

- [ ] **Step 3: Agregar a Vercel env vars (Production + Preview)**

1. Abre https://vercel.com/dashboard
2. Selecciona el proyecto `iriatalan-web`
3. Settings → Environment Variables → Add New
4. Name: `REVALIDATE_SECRET`
5. Value: la misma cadena
6. Environments: ✅ Production ✅ Preview ✅ Development
7. Save

### Task 0.3: Agregar SITE_URL a .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Agregar variable**

En `C:\Users\iriat\Documents\iriatalan-web\.env.local` agrega:

```
SITE_URL=https://iriatalan.com.mx
```

### Task 0.4: Verificar SANITY_API_WRITE_TOKEN

**Files:**
- Check: `.env.local`

- [ ] **Step 1: Confirmar que existe**

Abre `.env.local` y verifica que ya está `SANITY_API_WRITE_TOKEN=skXXXXX...`.

Si NO está:
1. Ve a https://sanity.io/manage
2. Selecciona el proyecto "IRIA TALAN RIF"
3. API → Tokens → Add API token
4. Name: "blog-conductor-write"
5. Permissions: Editor
6. Copia el token y agrégalo a `.env.local`

### Task 0.5: Commit + push de archivos nuevos a producción

**Files:**
- New (commit): `.claude/agents/iriatalan-blog-conductor.md`
- New (commit): `.claude/commands/blog-*.md` (9 archivos)
- New (commit): `scripts/draft-export-docx.mjs`
- New (commit): `scripts/draft-verify-live.mjs`
- New (commit): `src/app/api/revalidate/route.ts`
- New (commit): `sanity/seeds/blog-pipeline-state.json`
- Modified (commit): `scripts/draft-push.mjs`
- Modified (commit): `docs/BLOG.md`
- Modified (commit): `.gitignore`
- New (commit): `docs/superpowers/specs/2026-05-15-blog-conductor-nivel-0-design.md`
- New (commit): `docs/superpowers/plans/2026-05-15-blog-conductor-nivel-0-plan.md`

- [ ] **Step 1: Revisar status**

```powershell
git status
```

Expected: lista todos los archivos nuevos y modificados de esta sesión.

- [ ] **Step 2: Stage cambios específicos (NO usar git add -A para evitar .env.local accidental)**

```powershell
git add .claude/agents/iriatalan-blog-conductor.md
git add .claude/commands/blog-idea.md .claude/commands/blog-next.md .claude/commands/blog-status.md .claude/commands/blog-resume.md
git add .claude/commands/blog-write.md .claude/commands/blog-export-word.md .claude/commands/blog-apply-edits.md .claude/commands/blog-image.md .claude/commands/blog-publish.md
git add scripts/draft-export-docx.mjs scripts/draft-verify-live.mjs scripts/draft-push.mjs
git add src/app/api/revalidate/route.ts
git add sanity/seeds/blog-pipeline-state.json
git add docs/BLOG.md docs/superpowers/specs/2026-05-15-blog-conductor-nivel-0-design.md docs/superpowers/plans/2026-05-15-blog-conductor-nivel-0-plan.md
git add .gitignore
git add package.json package-lock.json
```

- [ ] **Step 3: Verificar staged**

```powershell
git status
```

Expected: ningún `.env.local`, ningún `/borradores/` listado. Solo los archivos arriba.

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(blog-conductor): Nivel 0 pipeline editorial end-to-end + spec + plan

- Agente iriatalan-blog-conductor orquestador con 11 fases
- 9 slash commands /blog-* (idea, next, status, resume, write, export-word, apply-edits, image, publish)
- scripts/draft-export-docx.mjs (markdown -> Word con highlighting)
- scripts/draft-verify-live.mjs (fetch produccion + marker check)
- scripts/draft-push.mjs --publish flag (draft:false + revalidate)
- src/app/api/revalidate/route.ts endpoint nuevo
- sanity/seeds/blog-pipeline-state.json state persistente
- docs/BLOG.md actualizado con flujo conductor
- Spec y plan en docs/superpowers/

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 5: Push a main**

```powershell
git push origin main
```

Expected: Vercel arranca un deploy automático. Espera ~2 min. Verifica en https://vercel.com/dashboard que el deploy esté en "Ready".

- [ ] **Step 6: Verificar que /api/revalidate existe en producción**

```powershell
curl -X POST "https://iriatalan.com.mx/api/revalidate?path=/&secret=test-secret-wrong-on-purpose"
```

Expected: respuesta JSON `{"revalidated":false,"message":"Invalid secret."}` con status 401. Si dice 404, el deploy no terminó o falló — chequea Vercel.

---

## Phase 1 — Construcción técnica restante (Claude, ~1.5h)

### Task 1.1: Agregar campos `metrics.*` al schema del state file

**Files:**
- Modify: `sanity/seeds/blog-pipeline-state.json` (sección `_schema`)

- [ ] **Step 1: Leer el archivo completo**

Use `Read` tool on `sanity/seeds/blog-pipeline-state.json`.

- [ ] **Step 2: Agregar campos metrics al schema**

Buscar la sección `_schema` y agregar después de `"notes"`:

```json
"metrics": {
  "activeTimeMinutes": "number — minutos activos de Iria (cronómetro manual al cerrar cada etapa)",
  "factCheckPassed": "boolean — true si pasó fact-check sin placeholders residuales",
  "voiceScore": "number 1-5 — Iria valora si 'suena a mí' al revisar Word",
  "aiMolestiesCount": "number — count manual de muletillas IA detectadas",
  "tokensConsumed": "number — estimado al cierre de pipeline (opcional)",
  "higgsfieldCreditsUsed": "number — del response del MCP (opcional)"
}
```

El campo `imageConcept` también necesita `attempts: "number — regeneraciones Higgsfield"`.

- [ ] **Step 3: Verificar JSON valido**

```powershell
node -e "JSON.parse(require('fs').readFileSync('sanity/seeds/blog-pipeline-state.json', 'utf8')); console.log('OK')"
```

Expected: imprime `OK`. Si arroja `SyntaxError`, hay un comma faltante o sobrante.

- [ ] **Step 4: Commit**

```powershell
git add sanity/seeds/blog-pipeline-state.json
git commit -m "feat(blog-conductor): agregar campos metrics.* al state schema"
```

### Task 1.2: Crear slash command `/blog-week`

**Files:**
- Create: `.claude/commands/blog-week.md`

- [ ] **Step 1: Crear el archivo**

Contenido exacto:

```markdown
---
name: blog-week
description: Modo proactivo semanal. Lee state + idea-backlog + draft-articles.ndjson, aplica criterios (seasonality MX, topic gap, nichos), recomienda 1-3 blogs candidatos para esta semana, y al aprobar arranca research+draft en background.
---

# /blog-week — qué desarrolla el agente esta semana

## Uso

\`\`\`
/blog-week
\`\`\`

Sin argumentos.

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. El conductor lee:
   - `sanity/seeds/blog-pipeline-state.json`
   - `sanity/seeds/idea-backlog.md`
   - `sanity/seeds/draft-articles.ndjson`
3. Identifica candidatos para esta semana (ver criterios de `/blog-next`).
4. **Diferencia con `/blog-next`**: además de recomendar, ofrece arrancar 1-3 blogs en background simultáneo.
5. Iria responde algo como "arranca X y Y" o "solo arranca X".
6. El conductor transiciona phase de los seleccionados a `researching` y delega a `iriatalan-seo-blog` Modo 5 (si phase=idea) o Modo 2 (si phase=brief-approved).
7. Cuando un blog llegue a `word-exported`, te notifica.

## Cadencia esperada

Corre 1 vez por semana (lunes/martes). Si quieres 1 blog/semana, arrancas 1. Si quieres 2-3, arrancas múltiples.

## Qué NO hace

- NO escribe contenido directamente (delega).
- NO publica nada.
- NO arranca blogs sin tu OK explícito.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-week`. Reporte de candidatos + propuesta de arrancar 1-3 simultáneos en background.
```

- [ ] **Step 2: Verificar creación**

Use `Read` tool on `.claude/commands/blog-week.md`. Expected: muestra el contenido completo arriba.

- [ ] **Step 3: Commit**

```powershell
git add .claude/commands/blog-week.md
git commit -m "feat(blog-conductor): /blog-week slash command proactivo semanal"
```

### Task 1.3: Crear slash command `/blog-archive`

**Files:**
- Create: `.claude/commands/blog-archive.md`

- [ ] **Step 1: Crear el archivo**

Contenido exacto:

```markdown
---
name: blog-archive
description: Pausar/cancelar un blog del pipeline sin romper state. Marca phase=archived. La entrada se preserva en blog-pipeline-state.json (append-only) pero deja de aparecer en /blog-status y /blog-next.
arguments:
  - name: slug
    required: true
    description: Slug del blog a archivar.
---

# /blog-archive — pausar/cancelar un blog

## Uso

\`\`\`
/blog-archive <slug>
\`\`\`

Ejemplo:
\`\`\`
/blog-archive blog-de-prueba-dry-run
\`\`\`

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee state. Confirma que el slug existe.
3. Pregunta confirmación: *"Vas a archivar `<slug>` (phase=`<actual>`). El draft archivado en draft-history/ se preserva pero el blog desaparece de /blog-next. ¿Procedo?"*
4. Al confirmar, transiciona phase → `archived` + actualiza `lastTouched`.
5. Si phase actual era `published` o `done`, NO archivar — usa otro mecanismo si quieres despublicar.

## Qué NO hace

- NO borra entradas del state (append-only).
- NO despublica de Sanity (si ya está live, sigue live).
- NO borra el .docx ni el draft-history.

## Cuándo usarlo

- Cuando una idea ya no aplica (cambió estacionalidad, regulación cambió, dejó de interesarte).
- Cuando un blog se atascó técnicamente y quieres limpiar el pipeline.
- Para dry-run cleanup tras pruebas.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-archive <slug>`. Confirma con Iria antes de transicionar a archived.
```

- [ ] **Step 2: Verificar creación**

Use `Read` tool on `.claude/commands/blog-archive.md`.

- [ ] **Step 3: Commit**

```powershell
git add .claude/commands/blog-archive.md
git commit -m "feat(blog-conductor): /blog-archive slash command para pausar blogs"
```

### Task 1.4: Actualizar conductor agent con nuevos commands + metrics capture

**Files:**
- Modify: `.claude/agents/iriatalan-blog-conductor.md`

- [ ] **Step 1: Leer agent file**

Use `Read` tool on `.claude/agents/iriatalan-blog-conductor.md`.

- [ ] **Step 2: Agregar `/blog-week` y `/blog-archive` a la tabla de comandos**

Buscar la sección `## Comandos que orquestas` y la tabla. Agregar dos filas después de `/blog-resume` y antes de `/blog-write`:

```
| `/blog-week` | Modo proactivo semanal — recomienda + arranca 1-3 blogs en background | researching × N |
| `/blog-archive <slug>` | Pausar/cancelar un blog del pipeline (preserva state, marca archived) | → archived |
```

- [ ] **Step 3: Agregar workflow del `/blog-week`**

Buscar la sección `## Workflow por comando` y agregar después de `### /blog-resume <slug>`:

```markdown
### `/blog-week`

**Input**: ninguno.

**Pasos**:
1. Lee state file (Guardrail 1).
2. Aplica los mismos criterios de `/blog-next` (seasonality MX, topic gap, search demand, nichos).
3. Devuelve tabla con 1-3 candidatos + justificación.
4. Frase canónica: *"Esta semana propongo desarrollar estos blogs. Responde `arranca <slug1>` o `arranca <slug1>,<slug2>,<slug3>` para empezar."*
5. Para cada slug que Iria apruebe arrancar:
   - Si phase=idea → delega a `iriatalan-seo-blog` Modo 5 (BRIEF) + espera aprobación.
   - Si phase=brief-approved → transiciona a `researching` + delega a Modo 2 (DRAFT).
6. Reporta plan de trabajo: "Arrancando N blogs en background. Te aviso cuando lleguen a `word-exported`."
7. Cuando cada uno termine, invoca `/blog-export-word <slug>` automático.

**Diferencia vs `/blog-next`**: `/blog-next` solo recomienda; `/blog-week` recomienda + arranca al aprobar.
```

- [ ] **Step 4: Agregar workflow del `/blog-archive`**

Después del workflow de `/blog-week`, agregar:

```markdown
### `/blog-archive <slug>`

**Input**: slug.

**Pasos**:
1. Lee state. Si el slug no existe → frase: *"No hay registro de `<slug>` en el pipeline."*. Detente.
2. Confirma phase actual ≠ `published` ni `done`. Si lo es: *"`<slug>` ya está live en producción. /blog-archive es para pausar antes de publish. Si quieres despublicar, abre Sanity Studio manualmente."*. Detente.
3. Frase canónica: *"Vas a archivar `<slug>` (phase=`<actual>`). El draft en draft-history/ se preserva pero el blog desaparece de /blog-next. ¿Procedo?"*
4. Espera "sí" / "archiva" / equivalente.
5. Edita state: phase → `archived`, lastTouched → ISO 8601 ahora, `notes` append con razón si Iria dio una.
6. Frase canónica de cierre: *"Archivado. Puedes desarchivarlo manualmente editando el state si lo quieres reactivar."*
```

- [ ] **Step 5: Agregar captura de metrics**

Buscar la sección `## Reglas operacionales` y agregar al final:

```markdown
- **Captura de metrics en cada transición**: cuando el conductor cambia de fase, registra `metrics.activeTimeMinutes` (suma incremental) si Iria reporta tiempo. Si no reporta, deja en 0 y se completa al cierre. Pregunta en `/blog-publish`: *"¿Cuánto tiempo activo dedicaste a este blog en total? (estimación)"*. Captura en `metrics.activeTimeMinutes`.
- **Voice score al cierre**: en `/blog-publish` después de verify exitoso, pregunta: *"¿Voice score de este blog? (1-5, donde 5 = suena 100% a Iria)"*. Captura en `metrics.voiceScore`.
- **Muletillas IA**: pregunta opcional: *"¿Detectaste muletillas IA (en este artículo / exploraremos / etc.)? Cuenta cuántas."*. Captura en `metrics.aiMolestiesCount`.
```

- [ ] **Step 6: Verificar agente file no se rompió**

Use `Read` tool on `.claude/agents/iriatalan-blog-conductor.md`. Expected: el frontmatter YAML sigue intacto, todas las secciones legibles.

- [ ] **Step 7: Commit**

```powershell
git add .claude/agents/iriatalan-blog-conductor.md
git commit -m "feat(blog-conductor): integrar /blog-week + /blog-archive + captura de metrics"
```

### Task 1.5: Documentar nuevos commands en docs/BLOG.md

**Files:**
- Modify: `docs/BLOG.md` — sección "Slash commands disponibles"

- [ ] **Step 1: Leer la sección**

Use `Read` tool on `docs/BLOG.md`. Buscar la tabla "Slash commands disponibles".

- [ ] **Step 2: Agregar 2 filas nuevas**

Después de la fila de `/blog-resume`, antes de `/blog-write`:

```
| `/blog-week` | Modo proactivo semanal — recomienda + arranca 1-3 blogs en background |
| `/blog-archive <slug>` | Pausar/cancelar un blog del pipeline (preserva state) |
```

- [ ] **Step 3: Commit**

```powershell
git add docs/BLOG.md
git commit -m "docs: agregar /blog-week + /blog-archive a tabla de comandos"
```

---

## Phase 2 — Dry-run E2E con blog de prueba

> Objetivo: validar que TODAS las piezas conectan antes del primer blog real. El blog de prueba se archiva al final (no llega a producción).

### Task 2.1: Crear idea de prueba

**Files:**
- Modify (vía conductor): `sanity/seeds/blog-pipeline-state.json` — agregar entrada
- Modify (vía conductor): `sanity/seeds/idea-backlog.md` — append bloque

- [ ] **Step 1: Ejecutar comando**

En Claude Code:

```
/blog-idea "Test dry-run del pipeline conductor — borrar después"
```

Expected: el conductor genera slug `test-dry-run-pipeline-conductor-borrar-despues` (o similar), agrega entrada al state file con `phase: "idea"`, agrega bloque al idea-backlog.md, y te pregunta si triagear ya o esperar.

- [ ] **Step 2: Verificar entrada en state**

Use `Read` tool on `sanity/seeds/blog-pipeline-state.json`. Expected: `blogs[]` ahora tiene 1 entrada con el slug de prueba.

- [ ] **Step 3: NO triagear todavía** — responde "no, déjala para después".

### Task 2.2: Verificar `/blog-status` y `/blog-next`

- [ ] **Step 1: Ejecutar `/blog-status`**

```
/blog-status
```

Expected: tabla mostrando 1 blog en phase=idea, lastTouched recientito.

- [ ] **Step 2: Ejecutar `/blog-next`**

```
/blog-next
```

Expected: el conductor recomienda el blog de prueba como único candidato.

### Task 2.3: Archivar el blog de prueba

- [ ] **Step 1: Ejecutar `/blog-archive`**

```
/blog-archive test-dry-run-pipeline-conductor-borrar-despues
```

(Usa el slug exacto del paso 2.1.)

Expected: el conductor pide confirmación.

- [ ] **Step 2: Confirmar**

Responde: `sí archiva`

Expected: el state se actualiza, phase → archived.

- [ ] **Step 3: Verificar que no aparece en /blog-status**

```
/blog-status
```

Expected: ahora muestra "Pipeline vacío" o solo blogs con phase ≠ archived.

### Task 2.4: Commit del state limpio post-dry-run

- [ ] **Step 1: Verificar state**

Use `Read` tool on `sanity/seeds/blog-pipeline-state.json`. Expected: el blog de prueba sigue ahí con phase=archived (no se borró, es append-only).

- [ ] **Step 2: Commit**

```powershell
git add sanity/seeds/blog-pipeline-state.json sanity/seeds/idea-backlog.md
git commit -m "test: dry-run E2E del conductor — blog de prueba archivado"
```

---

## Phase 3 — Semana 1: `incremento-costos-universitarios-mexico`

> Replicar este patrón en Phases 4, 5, 6 con los otros 3 slugs.

### Task 3.1: Crear idea + brief

- [ ] **Step 1: Capturar idea**

```
/blog-idea "Incremento en costos universitarios en México — qué tanto subieron y cómo prepararte financieramente"
```

Expected: slug propuesto algo como `incremento-costos-universitarios-mexico`.

- [ ] **Step 2: Triagear**

Responde: `sí triagea ya`

Expected: el conductor delega a `iriatalan-seo-blog` Modo 5 (IDEA → BRIEF). Devuelve brief de 1 página con veredicto, slug, topic, format, keywords, competencia, questionsAnswered propuestas, ángulo TALAN, sources preview, disclaimer requerido.

- [ ] **Step 3: Aprobar brief**

Si el brief se ve bien, responde: `aprueba <slug>`

Expected: el conductor agrega línea al `draft-articles.ndjson` y pregunta si arrancar Modo 2 ahora.

### Task 3.2: Redactar draft

- [ ] **Step 1: Arrancar redacción**

Responde: `sí escríbelo`

Expected: el conductor delega a `iriatalan-seo-blog` Modo 2. Esto puede tomar 30-60 minutos de procesamiento (research con WebSearch + WebFetch + fact-checker).

- [ ] **Step 2: Verificar quórum YMYL**

Cuando termine, valida que el output incluye el bloque `## Tool uses ejecutados` con ≥3 tool calls (WebSearch + WebFetch + fact-checker). Si dice STATUS: incompleto, reintentar.

- [ ] **Step 3: Verificar draft archivado**

El conductor invoca automático `/blog-export-word <slug>` y debe transicionar phase a `word-exported`.

Expected: archivo `sanity/seeds/draft-history/<slug>__YYYY-MM-DD-HHMMSS.md` existe + `borradores/<slug>.docx` existe.

### Task 3.3: Revisar Word + apply edits

- [ ] **Step 1: Abrir el Word**

```powershell
start borradores/incremento-costos-universitarios-mexico.docx
```

Expected: Word abre el archivo. Verás highlighting amarillo (cifras a verificar) y rojo (placeholders pendientes).

- [ ] **Step 2: Marcar tu tiempo de inicio**

Anota la hora en que empezaste a revisar el Word — la vas a reportar al final como `activeTimeMinutes`.

- [ ] **Step 3: Marcar correcciones con Track Changes**

Word → Revisar → Control de cambios (ON). Edita el texto. Acepta los cambios cuando termines.

- [ ] **Step 4: Copiar el texto completo**

Ctrl+A → Ctrl+C en Word.

- [ ] **Step 5: Aplicar edits en Claude Code**

```
/blog-apply-edits incremento-costos-universitarios-mexico
```

El conductor pide el texto.

- [ ] **Step 6: Pegar texto corregido**

Ctrl+V en el chat de Claude Code.

Expected: el conductor reconstruye el draft preservando metadata header, guarda nuevo archivo en draft-history, invoca `/draft-learn` para enriquecer voice corpus, transiciona phase → `edits-applied`.

### Task 3.4: Generar imagen hero

- [ ] **Step 1: Ejecutar comando**

```
/blog-image incremento-costos-universitarios-mexico
```

Expected: el conductor propone 3 conceptos visuales (palette educacional, sin caras stock, tono sobrio).

- [ ] **Step 2: Elegir concepto**

Responde: `1` (o el número del que prefieras), o `mezcla 1 y 3 con [ajuste]`.

Expected: invoca Higgsfield MCP, muestra preview.

- [ ] **Step 3: Aprobar o regenerar**

Si te gusta: `úsala`
Si no: `regenera con [cambio específico]`

Expected al aprobar: el conductor descarga la imagen, sube a Sanity Content Lake, actualiza state con `imageAsset.sanityAssetRef`, transiciona phase → `image-approved`.

### Task 3.5: Publicar live

- [ ] **Step 1: Ejecutar comando**

```
/blog-publish incremento-costos-universitarios-mexico
```

Expected: confirmación final.

- [ ] **Step 2: Confirmar**

Responde: `sí publica`

Expected: el conductor ejecuta `node scripts/draft-push.mjs <slug> --apply --publish`. Output esperado del script:
- `📦 Documento que se va a pushear a Sanity:` con `draft: false`
- `🟢 Pusheando + publicando a Sanity (draft:false)...`
- `✅ Done.`
- `🔄 Disparando revalidate en producción...`
- `✅ Revalidate OK`
- `📍 URL pública: https://iriatalan.com.mx/blog/<slug>`

Si revalidate falla con warning, no aborta — sigue al verify.

- [ ] **Step 3: Esperar 30 segundos**

Para que ISR procese si revalidate falló.

- [ ] **Step 4: Verificar live**

El conductor ejecuta automático `node scripts/draft-verify-live.mjs <slug>`. Output esperado:
- `🔍 Markers a verificar (3-5):` con frases del draft
- `🌐 Fetching: https://iriatalan.com.mx/blog/<slug>`
- `✅ HTML recibido`
- `📊 Resultados:` con todos los markers ✅
- `5/5 markers encontrados en producción.`
- `✅ Producción está sirviendo el contenido nuevo`

Si falla con < markers, reintenta `/blog-publish` en otros 60s (puede ser cache CDN).

### Task 3.6: Capturar metrics

- [ ] **Step 1: Reportar tiempo activo**

El conductor pregunta: *"¿Cuánto tiempo activo dedicaste a este blog en total? (estimación)"*

Reportar tu cálculo: hora final - hora inicial del paso 3.3.2.

- [ ] **Step 2: Reportar voice score**

El conductor pregunta: *"¿Voice score? (1-5)"*

Responde con número honesto.

- [ ] **Step 3: Reportar muletillas IA**

El conductor pregunta: *"¿Muletillas IA detectadas?"*

Responde con count.

Expected: el conductor edita state con todos los campos `metrics.*`. Phase → `done`.

### Task 3.7: Commit final del blog

- [ ] **Step 1: Stage cambios**

```powershell
git add sanity/seeds/blog-pipeline-state.json
git add sanity/seeds/idea-backlog.md
git add sanity/seeds/draft-articles.ndjson
git add sanity/seeds/draft-history/incremento-costos-universitarios-mexico__*.md
git add sanity/seeds/voice-corpus/
```

- [ ] **Step 2: Commit**

```powershell
git commit -m "blog: publica incremento-costos-universitarios-mexico (piloto semana 1)"
git push origin main
```

---

## Phase 4 — Semana 2: `universidades-elite-mexicanos-extranjero`

Replicar el patrón EXACTO de Phase 3 con el slug nuevo. Pasos 4.1 a 4.7, sustituyendo el slug.

Detalle: en `/blog-idea` usar input *"Costos de universidades elite en EUA, Europa y Asia — para mexicanos viviendo en el extranjero que quieren ahorrar para educación premium"*.

---

## Phase 5 — Semana 3: `ppr-deduccion-impuestos-mexico`

Replicar el patrón EXACTO de Phase 3 con el slug nuevo. Pasos 5.1 a 5.7, sustituyendo el slug.

Detalle: en `/blog-idea` usar input *"PPR y deducción de impuestos en México — cuánto puedes deducir y cómo funciona el Art. 151 LISR"*.

⚠️ Atención: este es el primer blog con fact-check denso SAT/LISR. El agente debe citar Art. 151 fracc V LISR y Art. 185 LISR con números EXACTOS — fact-checker es obligatorio. Si el agente devuelve cifras sin fuente SAT vigente, marca `factCheckPassed: false` y haz `/blog-write` de nuevo.

---

## Phase 6 — Semana 4: `incremento-costo-seguro-medico-retiro`

Replicar el patrón EXACTO de Phase 3 con el slug nuevo. Pasos 6.1 a 6.7.

Detalle: en `/blog-idea` usar input *"Por qué el seguro médico sube tanto al envejecer — y la importancia de empezar a ahorrar para eso desde antes"*.

⚠️ Atención: cifras AMIS sobre primas GMM por edad. Si AMIS no publica tablas vigentes online, el agente puede usar promedios de los 6 carriers TALAN (BUPA, MetLife, Allianz, SMNYL, AXA, GNP) con disclaimer "promedio observado en cotizaciones [año]". Validar antes de publish.

---

## Phase 7 — Cierre Spec A

### Task 7.1: Recolectar métricas agregadas

- [ ] **Step 1: Leer state file completo**

Use `Read` tool on `sanity/seeds/blog-pipeline-state.json`.

- [ ] **Step 2: Crear reporte agregado**

Calcular manualmente o pedirle al conductor:

| Métrica | Blog 1 | Blog 2 | Blog 3 | Blog 4 | Promedio |
|---|---|---|---|---|---|
| activeTimeMinutes | | | | | |
| factCheckPassed | | | | | (% pass) |
| voiceScore | | | | | |
| aiMolestiesCount | | | | | |
| Rondas apply-edits | | | | | |

- [ ] **Step 3: Guardar reporte en repo**

Use `Write` tool to create `reports/spec-a-piloto-cierre-2026-06-12.md` (sustituye la fecha por la real al cierre).

Con la tabla y comentarios.

### Task 7.2: Validar criterio de éxito vs tripwires

- [ ] **Step 1: Comparar contra criterios de Sección 1 del spec**

- ¿Blog #2 tomó ≤4h activas? sí/no
- ¿4 blogs publicados live? sí/no
- ¿Voice score promedio ≥4? sí/no
- ¿factCheckPassed 100%? sí/no

- [ ] **Step 2: Comparar contra tripwires de Sección 6**

- ¿2+ blogs fallaron fact-check sin corrección? sí/no
- ¿Tiempo activo > 6h por blog en algún caso? sí/no
- ¿Voice score promedio < 3? sí/no
- ¿Iria dice "prefiero escribir yo"? sí/no

### Task 7.3: Decisión binaria

- [ ] **Step 1: Decidir**

Si TODOS los criterios pasaron Y ningún tripwire se disparó → ✅ Spec A cerrada. Pasar a Spec B (validación comercial).

Si algún tripwire se disparó → 🔴 Reabrir brainstorming. Diagnosticar qué falló. Quizás el flagship no es escritor SEO sino cobranza/WhatsApp.

### Task 7.4: Actualizar memoria

- [ ] **Step 1: Update memo blog pipeline**

Editar `C:\Users\iriat\.claude\projects\C--Users-iriat-CLAUDE\memory\project_blog_pipeline_conductor.md`:
- Agregar sección "Cierre piloto Spec A — 2026-MM-DD"
- Listar los 4 blogs live
- Listar métricas agregadas
- Estado: Spec A cerrada ✅ / 🔴

- [ ] **Step 2: Update MEMORY.md**

Editar la línea de `project_blog_pipeline_conductor.md` para reflejar el cierre del piloto.

### Task 7.5: Commit final + handoff a Spec B

- [ ] **Step 1: Commit**

```powershell
git add reports/spec-a-piloto-cierre-*.md
git commit -m "chore: cierre Spec A — piloto 4 blogs completado"
git push origin main
```

- [ ] **Step 2: Anunciar siguiente paso**

Si Spec A pasó: Iria invoca `superpowers:brainstorming` para arrancar Spec B (validación comercial — landing /asesores + entrevistas asesores).

Si Spec A falló: Iria invoca brainstorming general para repensar el flagship.

---

## Notas finales

**Frecuencia de commits**: 1 commit por task en Phase 0/1, 1 commit por blog en Phases 3-6. No batchear.

**Rollback**: si algo falla en producción durante Phase 3-6:
- `/blog-archive <slug>` para limpiar state.
- En Sanity Studio, manualmente apaga el toggle Draft del documento problemático.
- `git revert <commit>` si el deploy se rompió por código nuevo.

**Si el ejecutor agéntico se pierde**: re-leer el spec en `docs/superpowers/specs/2026-05-15-blog-conductor-nivel-0-design.md` para reorientarse.
