---
name: aesthetic-override-iriatalan
description: Use whenever generating, reviewing, or critiquing UI, CSS, components, color palettes, typography, or motion for iriatalan.com (Sanity + Next.js + Tailwind site for Iria Talan, asesora financiera RIF). Overrides default frontend aesthetics with trust-sensitive financial-advisor guidance — distinctive but restrained, mobile-first, performance-budgeted, accessibility-non-negotiable. Trigger on any visual decision: choosing fonts, colors, gradients, animations, hero design, button styles, form layouts, page transitions, background treatments. Also trigger when reviewing third-party aesthetic guidance (e.g. generic frontend-design skills) before applying it to this site.
---

# Aesthetic Override — iriatalan.com

You are designing for **iriatalan.com** — Iria Talan, asesora financiera RIF.

**Audience:** Spanish-speaking adults 30-55 considering retirement, GMM (gastos médicos mayores), education plans (SEGUBECAS), Plan Personal de Retiro, Modalidad 40, life insurance, and investment products. Includes three differentiator niches: padres LGBT+ con hijos, familias con hijos neurodivergentes, mujeres planificando solas.

**This is a TRUST-SENSITIVE vertical.** The "AI slop" trap and the "creative override slop" trap are equally dangerous: cyberpunk neon and glitch effects read as *"no me tomes en serio con mi dinero."* Distinctive ≠ experimental. Aim for **"obviously hand-designed, quietly confident, warm enough to feel human."**

---

## Performance budget (non-negotiable)

Current mobile PSI baseline: **29** (verified 2026-05-04). Every aesthetic decision must justify its cost.

- LCP under 2.5s on slow 4G — every animation, font, gradient must justify weight
- No font file over 80KB — subset to Latin Extended only
- One hero animation max per page; nothing above the fold that delays LCP
- `prefers-reduced-motion`: respected, not optional
- No render-blocking resources for hero
- Lazy-load anything below the fold (images, video, Lottie, Rive)

## Typography — distinctive but legible

- **Display/headline:** serif with character — Fraunces (preferred — Google Fonts, free, variable axis SOFT/WONK), Newsreader, or Tiempos Headline (paid).
- **Body:** humanist sans for long-form readability — Söhne (paid), or free alternatives: Manrope, Plus Jakarta Sans, or Source Sans 3.
- **NEVER:** Inter for headlines, Arial, Roboto, system-ui font stack, Space Grotesk (overused 2024-26).
- **Numbers:** tabular figures enabled (`font-variant-numeric: tabular-nums`) on any financial figure, table, or premium amount. Non-negotiable.
- **Spanish-aware:** verify ñ, á-ú, ¿, ¡ render correctly. Test "México" "años" "más" "diseño" "información".
- **Line-height for body:** 1.65–1.75. Spanish text runs ~15% longer than English.

## Color — warm, restrained, ONE accent

- **Base:** warm off-white (~#FAF7F2) or warm dark (~#1A1714) — no pure white, no pure black.
- **Primary brand:** Iria's existing palette (logoRIF.ai source in `~/Downloads/logoRIF.ai`). **Confirm hex with Iria before deploying — do NOT invent.** If unknown, propose 2-3 options with rationale first.
- **Accent:** ONE color, used sparingly for CTAs and key emphasis only. Never two competing accents.
- **Avoid:** purple-blue gradients ("AI startup gradient"), neon greens, generic fintech blue (#0066FF), generic teal, mesh gradients.
- **Contrast:** WCAG AA minimum (4.5:1 for body text, 3:1 for UI components). Verify before shipping.

## Motion — restrained, purposeful

- **Page load:** ONE staggered fade-up on hero (max 3 elements, 80ms stagger). That's it.
- **Hover:** subtle scale (`scale(1.02)`) + shadow lift on cards. No bouncy springs.
- **Scroll:** avoid parallax. Avoid sticky theatrical effects. Boring scrolls feel trustworthy.
- **`prefers-reduced-motion`:** kill all transforms with `@media (prefers-reduced-motion: reduce)`.
- **Budget:** ZERO Lottie/Rive on mobile unless lazy-loaded below the fold.

## Backgrounds — texture over gradient

- **Default:** warm flat tone with subtle noise/grain (1-3% opacity SVG noise filter).
- **Section dividers:** hairline rules (1px, 8% opacity), not gradients or shape blobs.
- **Hero:** optional warm radial wash from primary brand color, very low contrast.
- **Avoid:** mesh gradients, glassmorphism, animated blobs, geometric pattern walls, "abstract 3D shapes."

## Layout principles

- **Mobile-first.** Every component designed at 375px first, then scaled up.
- **Generous whitespace** — resist filling it. Whitespace IS the design.
- Asymmetric grids welcome on desktop; stack predictably on mobile.
- **Touch targets ≥44×44px** on mobile.

## Accessibility (non-negotiable)

- Focus states **visible and styled** — never `outline: none` without a replacement.
- All interactive elements ≥44×44px touch target.
- Form labels always visible (no placeholder-as-label).
- Skip-to-content link in nav.
- Alt text on every meaningful image; decorative images `alt=""`.
- Color is never the *only* signal (icons + text + color, not color alone).

## Hard avoids (regardless of how "creative" the request)

- Space Grotesk, Inter for display, system-ui font stack
- Purple-on-white gradients, "AI startup gradient mesh"
- Glitch/cyberpunk/Y2K aesthetics
- Auto-playing video, auto-playing carousel
- Cookie banners that block content (compliant version already implemented)
- Forms requiring more than name + email + WhatsApp at first contact
- Generic stock photos of "diverse smiling office workers"
- Hero illustrations of cartoon people with no faces

## When in doubt

Propose **2–3 directions with rationale** before implementing. Iria reviews visual decisions before deploy.

For tone alignment, also reference:
- `feedback_marketing_messaging_real_mexico.md` (briefing comercial: productos pillar + nichos)
- `feedback_marketing_neuromarketing_frameworks.md` (Cialdini + Kahneman + StoryBrand + EEAT)
- `project_marketing_iriatalan.md` (reconstrucción Q2 2026 status)
- `project_iriatalan_web_pendientes.md` (lista actual de pendientes)
