import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  buildHreflangAlternates,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

const FAQS: FAQItem[] = [
  {
    question: "What is a PPR, and why do foreigners in Mexico use one?",
    answerText:
      "A PPR (Plan Personal de Retiro) is a Mexican personal retirement plan contracted with an authorized insurer. For anyone filing taxes in Mexico it offers two advantages: an annual income-tax deduction while you contribute (under Art. 151 fracc V LISR currently in force), and favorable tax treatment on the payout side (under Art. 93 LISR currently in force), subject to compliance with the applicable fiscal requirements. It is available in MXN (inflation-adjusted), UDIS, or USD, and it is inheritable. Foreigners with Mexican fiscal residency or Mexican-source income use it as a tax-efficient retirement layer their home country often does not replicate.",
  },
  {
    question: "How much can I deduct with a PPR?",
    answerText:
      "Under Art. 151 fracc V LISR currently in force, PPR contributions are deductible up to the lesser of 10% of your annual taxable income or the equivalent of 5 annual UMAs (a cap that updates every year with inflation). The real benefit you receive through the SAT depends on your marginal income-tax rate. Because the deduction requires filing a Mexican return, it is most valuable for those with Mexican fiscal residency or Mexican-source income. Confirm the applicability to your situation with your tax advisor before contributing.",
  },
  {
    question: "Are PPRs worth it if I might leave Mexico in 5 or 10 years?",
    answerText:
      "Worth analyzing case by case. The plan itself does not become void if you leave — it stays in your name. What depends on fiscal residency is the annual deduction benefit, which requires a Mexican return. If you may leave, we evaluate options up front: keep contributing, freeze contributions, or align the structure toward the payout side. Mexican retirement plans qualifying under Art. 93 LISR currently in force can offer attractive payout treatment starting at age 60, subject to compliance with applicable fiscal requirements — and the plan remains inheritable regardless of where you end up.",
  },
  {
    question:
      "Can I deduct PPR contributions on my US tax return, and does it trigger PFIC reporting?",
    answerText:
      "The PPR deduction is a Mexican-side benefit applied to your Mexican return under Art. 151 fracc V LISR — the IRS generally does NOT recognize PPRs as qualified retirement plans for US deduction purposes. Depending on the underlying investment structure, a PPR may trigger PFIC (Passive Foreign Investment Company) reporting on the US side. This is the single most important item to get right: coordinate with a US tax preparer experienced in cross-border filings BEFORE contributing. The Mexican tax benefit is real, but the US reporting side has nuances. We help you map which product structures minimize US reporting friction.",
  },
  {
    question: "Can I hold my plan in US dollars?",
    answerText:
      "Yes. Retirement and savings plans with the carriers I work with are commonly available in MXN (inflation-adjusted), UDIS, or USD. A USD-denominated plan removes peso-exchange exposure for someone who thinks and spends partly in dollars, while an inflation-adjusted MXN plan can suit someone whose expenses are mostly local. We choose the denomination around where you actually expect to live and spend at retirement.",
  },
  {
    question: "What is Modalidad 40, and does it apply to me?",
    answerText:
      "Modalidad 40 is an IMSS mechanism that lets eligible people who previously contributed to IMSS keep building their public pension by paying voluntary contributions — it can multiply the resulting pension substantially. It applies only if you have an IMSS contribution history, so it is relevant mainly to foreigners who worked formally in Mexico at some point, or to mixed Mexican-foreign careers. It is demanding to sustain over its multi-year window, so we typically pair it with a savings or investment plan that funds those years. We assess eligibility and whether it is worthwhile with your specific IMSS record.",
  },
  {
    question: "How does a Mexican retirement plan pass to my heirs across borders?",
    answerText:
      "Retirement and life-insurance structures with a designated beneficiary are a strong cross-border succession tool. Under Mexican law, a beneficiary of an insurance-based product acquires a derecho propio — a right arising from the contract itself, not from inheritance — so the proceeds bypass Mexican probate and reach the beneficiary directly. How your home country treats the proceeds depends on its own succession and tax law, but the Mexican leg is clean and direct. This matters when your heirs live in a different country from where the plan is held.",
  },
  {
    question: "Can you advise me in English?",
    answerText:
      "Yes. I advise bilingually — English and Spanish — for clients from the US, Canada, Europe and Latin America. Formal plan documents are issued in Spanish because Mexican law requires it, but I walk you through each one in English and answer your questions in whichever language you prefer. I am MDRT Top of the Table and ranked 8th nationally by AMASFAC. None of this is tax advice — I coordinate with your tax advisor on both sides of the border.",
  },
];

export const metadata: Metadata = {
  title: "Retirement Planning in Mexico for Foreigners (PPR) — Iria Talan",
  description:
    "Personal retirement plans (PPR) in Mexico for foreign residents. Mexican tax-deductible contributions, USD/UDIS/MXN options, cross-border and PFIC considerations. Bilingual advisory. MDRT Top of the Table.",
  alternates: buildHreflangAlternates(
    "/retirement-planning",
    "/retiro",
    "/retirement-planning",
  ),
  openGraph: {
    type: "website",
    url: `${SITE_URL}/retirement-planning`,
    title: "Retirement Planning in Mexico for Foreigners (PPR) — Iria Talan",
    description:
      "Personal retirement plans (PPR) for foreign residents in Mexico — Mexican tax advantages, USD options, cross-border coordination. MDRT Top of the Table.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/retirement-planning#audience`,
    audienceType:
      "Foreign residents in Mexico (RT or RP) planning retirement with Mexican-source income or fiscal residency",
    geographicArea: { "@type": "Country", name: "Mexico" },
  };
}

function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/retirement-planning#service`,
    name: "Retirement Planning Advisory for Foreigners in Mexico (PPR)",
    description:
      "Bilingual advisory on Mexican personal retirement plans (PPR) for foreign residents — annual income-tax deduction under Art. 151 LISR, favorable payout treatment under Art. 93 LISR, USD/UDIS/MXN denomination, Modalidad 40 IMSS assessment, and cross-border (PFIC) coordination.",
    serviceType: "Retirement Planning Advisory",
    category: "Retirement Planning for Foreign Residents",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "Mexico" },
    audience: { "@id": `${SITE_URL}/retirement-planning#audience` },
    availableLanguage: ["en", "es"],
  };
}

export default async function RetirementPlanningPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = "/contacto#agendar";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Retirement Planning", path: "/retirement-planning" },
    ]),
    buildFAQPageSchema(FAQS),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col" lang="en">
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-rif-gris">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            {" / "}Retirement Planning
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Retirement planning in Mexico, coordinated with your taxes on both
            sides of the border.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Personal retirement plans (PPR) for foreign residents — Mexican
            tax-deductible contributions, USD or inflation-adjusted options, and
            honest cross-border coordination on the US reporting side.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Schedule an introductory call
            </a>
            <Link
              href="/foreigners-in-mexico"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              All services for foreigners
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Why a Mexican retirement plan — and where the care is needed
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                If you file taxes in Mexico — fiscal residency or Mexican-source
                income — a PPR can be one of the most tax-efficient tools
                available, giving you an annual deduction while you contribute and
                favorable treatment on the payout side.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">
                  Where it gets delicate:
                </strong>{" "}
                the US side. The IRS generally does not recognize a PPR as a
                qualified plan, and depending on its structure it can create PFIC
                reporting. The Mexican benefit is real — but it has to be set up
                with the US reporting picture in mind, not after the fact.
              </p>
              <p>
                My job is to coordinate the middle: the Mexican structure that
                earns the deduction, chosen so it does not create avoidable
                friction with your home-country filings. In English, alongside
                your tax advisor.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              What we structure together
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  PPR with annual deduction
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Contributions deductible up to the lesser of 10% of taxable
                  income or 5 annual UMAs, under Art. 151 fracc V LISR currently
                  in force — the benefit scales with your marginal ISR rate.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Currency that fits your life
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Available in USD, UDIS, or inflation-adjusted MXN — chosen
                  around where you expect to live and spend at retirement, to
                  manage exchange-rate exposure.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Cross-border tax coordination
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  We plan the Mexican side around your home-country filings —
                  including PFIC exposure for US persons — and coordinate directly
                  with your US or foreign tax preparer.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Modalidad 40 IMSS — if it applies
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  If you have an IMSS contribution history, we assess whether
                  Modalidad 40 can raise your public pension, and how to fund the
                  contribution window sustainably.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              How we work
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Discovery call
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Your fiscal residency, where your income comes from, your
                  retirement horizon, and whether you expect to stay in Mexico or
                  move on. In English or Spanish.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Structure design
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  I map the Mexican retirement products that fit your situation
                  and currency needs, sized to your deduction capacity and
                  designed with your home-country reporting in mind.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Coordinated implementation
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  I coordinate with your Mexican accountant and, when useful, your
                  foreign tax advisor. Documents in Spanish with English
                  walkthroughs; signatures via secure digital channels.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Annual review
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  We revisit contributions, currency and residency each year, and
                  whenever your life shifts — a move, a change in fiscal status,
                  or a planned return home.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-8">
              {FAQS.map((f) => (
                <div key={f.question}>
                  <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                    {f.question}
                  </h3>
                  <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                    {f.answerText}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm text-warm-brown/70 dark:text-cream-light/55 leading-relaxed">
              This page is informational and is not tax or legal advice. Fiscal
              treatment depends on the law in force at the time of contribution or
              payout and on your individual situation. Confirm applicability with
              your tax advisor. Iria Talan, CNSF licence V388618.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Related
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              You may also want to look at
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/foreigners-in-mexico"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Financial advisory for foreigners
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  The full picture — health, life, retirement and education
                  planning for foreign residents in Mexico.
                </p>
              </Link>
              <Link
                href="/international-health-insurance"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  International health insurance
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Major Medical Insurance (GMM) with top hospital networks and
                  international coverage.
                </p>
              </Link>
              <Link
                href="/retiro"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Retiro — en español
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  The detailed Spanish-language page on PPR and Modalidad 40
                  IMSS.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Three ways to start
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              Advisory in English or Spanish. No commitment to the first
              conversation.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Quick message
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  WhatsApp
                </div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">
                  {whatsapp}
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Email
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  Write to me
                </div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">
                  {email}
                </div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Direct booking
                </div>
                <div className="text-lg font-medium">
                  Schedule an introductory call
                </div>
                <div className="mt-2 text-sm opacity-80">No commitment</div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
