<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Rules para agentes trabajando en este repo

## Stack y convenciones

- **Stack**: Next.js 16 App Router + React 19 + Sanity 5 (CMS) + TypeScript estricto + Tailwind 4.
- **CMS = Sanity**, no MDX. NO instales MDX ni ningún CMS paralelo.
- **Schemas Sanity** viven en `sanity/schemas/`. Antes de crear uno nuevo, verifica que no existe (article, author, faq, glossaryTerm, homePage, resource, service).
- **JSON-LD helpers** centralizados en `src/lib/seo.ts`. ANTES de crear un nuevo helper, lee el archivo y verifica que no existe (`buildArticleSchema`, `buildPersonSchema`, `buildFinancialAdvisorSchema`, `buildOrganizationSchema`, `buildLocalBusinessSchema`, `buildWebSiteSchema`, `buildFAQPageSchema`, `buildBreadcrumbSchema`, `buildDefinedTermSchema`, `buildDefinedTermSetSchema`, `buildGraph`).
- **Taxonomía blog** (topics + URL slugs + formatos + helpers) vive en `src/lib/blog.ts`. NO inventes categorías nuevas sin OK explícito.
- **Aesthetic skill local** existe en `.claude/skills/aesthetic-override-iriatalan/SKILL.md`. Respétalo. NO uses estética SaaS genérica (gradientes, chips coloridos, etc.).

## Contenido y reglas YMYL

- Lee `CLAUDE.md` y este archivo ANTES de escribir copy.
- Categoría YMYL (finanzas + México): **no inventes** cifras fiscales, regulación, coberturas, ni promesas. Cita siempre CNSF/AMIS/BMV/Banxico/IMSS/SAT/CONDUSEF cuando aplique.
- Apellido **Talan** sin acento. Siempre. Aplica a copy, código y prompts.

## Blog

Documentación completa: [`docs/BLOG.md`](docs/BLOG.md). Cubre cómo publicar drafts, estructura editorial obligatoria, custom Portable Text blocks, citabilidad LLM, seeds y archivos relevantes.

## Reglas operacionales

- NO ejecutes `git commit` ni `git push` sin OK explícito del usuario. El usuario revisa cada cambio antes de persistir.
- Las decisiones de arquitectura grandes (nuevos schemas, deps nuevas, cambios de stack) requieren OK explícito antes de implementar.
- "No te detengas a mitad" del usuario aplica DESPUÉS de un plan aprobado, NO durante. Presenta plan corto, espera OK, luego ejecuta sin parar.
