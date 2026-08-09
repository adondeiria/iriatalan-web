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
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";

const FAQS: FAQItem[] = [
  {
    question: "How much does private health insurance (GMM) cost in Mexico for a foreigner?",
    answerText:
      "Mexican Major Medical Insurance (GMM) typically costs a fraction of a comparable US marketplace plan, even with top hospital networks and an international rider. Premiums depend on age, deductible, coinsurance, chosen hospital network, sum insured, declared health history, and whether you add international coverage. There is no single price — it is quoted per person through underwriting. During the initial session we run live comparisons across the AAA-rated Mexican insurers I work with (BUPA, MetLife, GNP, AXA and Seguros Monterrey New York Life) so you see real numbers for your situation, not estimates.",
  },
  {
    question: "Do I need Mexican residency to buy GMM?",
    answerText:
      "Yes. To contract Mexican Major Medical Insurance you need legal residency — Residente Temporal (RT) or Residente Permanente (RP) — because the carrier requires a CURP and a Mexican address. A tourist visa does not qualify. If your residency is in process, we can prepare everything so you are ready to contract the moment your status is approved, and time the start date around any waiting periods.",
  },
  {
    question: "I already have a US or European health plan. Do I still need Mexican GMM?",
    answerText:
      "For care you actually receive in Mexico, usually yes. A Mexican GMM policy gives you direct access to the country's top private hospitals (Hospital ABC, Médica Sur, Hospital Ángeles, Christus Muguerza, Star Médica) at a fraction of US costs, without relying on out-of-network reimbursement from your home plan. Many of my clients keep their home-country coverage for emergencies back home and add Mexican GMM as the primary layer for anything done in Mexico. We map the right combination so you are not paying twice for the same protection.",
  },
  {
    question: "Which carriers do you work with, and which are best for international coverage?",
    answerText:
      "For Major Medical Insurance I work with five AAA-rated Mexican carriers: BUPA, MetLife, GNP, AXA and Seguros Monterrey New York Life. There is no universally 'best' one — the right carrier depends on the hospitals you want in-network, whether you need coverage outside Mexico, your deductible and coinsurance preferences, and your declared health history. For broad international coverage, BUPA International and GNP VIP are the options most commonly used by expats who split time between countries. We confirm that your preferred hospitals are actually in the plan's network before you contract.",
  },
  {
    question: "Does Mexican GMM cover pre-existing conditions?",
    answerText:
      "Individual and family GMM policies in Mexico generally do NOT cover conditions that already exist when you contract — this is standard across the AAA carriers. The critical rule is to declare everything at application (diagnoses, treatments, medications): if the carrier later discovers an omission, it can deny the related claim or cancel the policy. It is far better to declare fully and know exactly what is excluded from day one. If you have a significant pre-existing condition, some carriers and plans accept profiles that others decline — the initial session identifies your realistic options.",
  },
  {
    question: "Does my Mexican policy cover me when I travel back home or to a third country?",
    answerText:
      "It depends on the plan. Standard domestic GMM covers Mexico, sometimes with limited international emergency assistance (with defined caps and event types). For comprehensive coverage abroad you need an international plan — BUPA International and GNP VIP are the most common options with global networks. If you travel frequently or split the year between countries, we prioritize a plan whose territorial scope matches how you actually live.",
  },
  {
    question: "I'm a digital nomad on a Residente Temporal visa. Can I get GMM?",
    answerText:
      "Yes — Residente Temporal status with a CURP and a Mexican address qualifies you for most GMM products. Underwriting may take a little longer when your income is foreign-sourced, and depending on age and sum insured you may face a health questionnaire or a medical exam. The AAA carriers I work with vary in how they handle foreign-income and remote-work profiles; we identify the most accommodating options during the initial session.",
  },
  {
    question: "Can you handle all of this in English?",
    answerText:
      "Yes. I advise bilingually — English and Spanish — for clients from the US, Canada, Europe and Latin America. Mexican law requires the formal policy documents to be issued in Spanish, but I walk you through every document in English and answer your questions in whichever language you prefer. I studied Wealth Management Theory & Practice at Yale School of Management (Executive Education), and I am MDRT Top of the Table and ranked 8th nationally by AMASFAC.",
  },
];

export const metadata: Metadata = {
  // Sin "— Iria Talan": el template del root ya agrega "| Iria Talan / RIF".
  title: "International Health Insurance in Mexico (GMM) for Foreigners",
  description:
    "Major Medical Insurance (GMM) for foreign residents in Mexico. Top private hospital networks, international riders, bilingual advisory. BUPA, MetLife, GNP, AXA, SMNYL — AAA-rated carriers. MDRT Top of the Table.",
  alternates: buildHreflangAlternates(
    "/international-health-insurance",
    "/gmm",
    "/international-health-insurance",
  ),
  openGraph: {
    type: "website",
    url: `${SITE_URL}/international-health-insurance`,
    title: "International Health Insurance in Mexico (GMM) for Foreigners — Iria Talan",
    description:
      "Bilingual advisory on Mexican Major Medical Insurance for foreign residents — top hospital networks and international coverage. MDRT Top of the Table.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/international-health-insurance#audience`,
    audienceType:
      "Foreign residents in Mexico (RT or RP) seeking private major medical insurance",
    geographicArea: { "@type": "Country", name: "Mexico" },
  };
}

function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/international-health-insurance#service`,
    name: "International Major Medical Insurance (GMM) Advisory for Foreigners in Mexico",
    description:
      "Bilingual advisory on Mexican Major Medical Insurance (Gastos Médicos Mayores) for foreign residents — access to top private hospital networks (Hospital ABC, Médica Sur, Hospital Ángeles, Christus Muguerza), international riders, and carrier comparison across five AAA-rated Mexican insurers.",
    serviceType: "Health Insurance Advisory",
    category: "Major Medical Insurance for Foreign Residents",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "Mexico" },
    audience: { "@id": `${SITE_URL}/international-health-insurance#audience` },
    availableLanguage: ["en", "es"],
  };
}

export default async function InternationalHealthInsurancePage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = "/contacto#agendar";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525526786325";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      {
        name: "International Health Insurance",
        path: "/international-health-insurance",
      },
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
            {" / "}International Health Insurance
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Private health insurance in Mexico, built around the hospitals and
            countries you actually use.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Major Medical Insurance (GMM) for foreign residents with Temporary
            (RT) or Permanent (RP) status. Bilingual advisory across five
            AAA-rated Mexican carriers — with international coverage when you need
            it.
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
              Why foreigners in Mexico add local GMM
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Care you receive in Mexico is best paid for by a Mexican policy.
                A local GMM plan gives you direct, in-network access to the
                country&apos;s top private hospitals — without depending on your
                home plan&apos;s out-of-network reimbursement, and at a fraction
                of US costs.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">
                  The usual mistake:
                </strong>{" "}
                assuming your home-country plan travels with you. Most do not —
                or they cover Mexican care only as a costly, slow reimbursement.
                The clean setup is usually a Mexican GMM plan for care here, with
                your home plan kept for emergencies back home.
              </p>
              <p>
                The right plan is the one whose hospital network and territorial
                scope match how you actually live. That is what we work out
                together — in English.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              What we evaluate together
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Hospital network
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  We confirm your preferred hospitals — Hospital ABC, Médica Sur,
                  Hospital Ángeles, Christus Muguerza, Star Médica — are actually
                  in the plan&apos;s network before you contract. Networks vary by
                  carrier and plan tier.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  International coverage
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  If you split time between countries, we prioritize plans with
                  genuine international scope — BUPA International and GNP VIP are
                  the options most used by expats — and confirm the territorial
                  limits in writing.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Deductible &amp; coinsurance
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  The single most important cost lever. We model a low deductible
                  (higher premium, coverage from the first peso) against a higher
                  one (lower premium, you absorb the first costs) based on your
                  emergency liquidity and risk tolerance.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Underwriting &amp; declarations
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  We declare your health history correctly from the start, so you
                  know exactly what is covered and what is excluded — and avoid a
                  denied claim later for an omission. Foreign-income profiles are
                  handled up front.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              The carriers I work with
            </h2>
            <p className="mt-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              For Major Medical Insurance I work with five AAA-rated Mexican
              insurers, all authorized by the CNSF:{" "}
              <strong className="text-ink dark:text-cream-light">
                BUPA, MetLife, GNP, AXA and Seguros Monterrey New York Life
              </strong>
              . None is universally &quot;best&quot; — the right one depends on
              your hospitals, your need for international coverage, your deductible
              preference and your declared health history. For broad global
              coverage, BUPA International and GNP VIP are the options expats use
              most.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["BUPA", "MetLife", "GNP", "AXA", "Seguros Monterrey New York Life"].map(
                (c) => (
                  <span
                    key={c}
                    className="px-4 py-2 rounded-full border border-warm-brown/20 dark:border-warm-brown/40 text-warm-brown dark:text-cream-light/85 font-medium text-sm"
                  >
                    {c}
                  </span>
                ),
              )}
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
                  Your residency status, where you live and travel, the hospitals
                  you want access to, your health history, and any home-country
                  coverage you already hold. In English or Spanish.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Live carrier comparison
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  We run real quotes across the five AAA carriers, comparing
                  networks, deductibles, coinsurance, international scope and
                  waiting periods — with pros, cons and costs on the table. You
                  decide.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Underwriting support
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  I help you declare your health history correctly and coordinate
                  any medical exam. Documents are issued in Spanish (Mexican law)
                  with an English walkthrough of every clause.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Renewals &amp; claims — with a person
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Your advisor is me, not a call center. When premiums rise or a
                  claim comes up, you talk to me. We review annually and adjust
                  when your life changes.
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
                href="/retirement-planning"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Retirement planning in Mexico
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Personal retirement plans (PPR) with Mexican tax advantages,
                  for foreigners building a life here.
                </p>
              </Link>
              <Link
                href="/gmm"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  GMM — en español
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  The detailed Spanish-language page on Major Medical Insurance
                  in Mexico.
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
                href={waHref(whatsapp, WA_MESSAGES.internationalHealth)}
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
