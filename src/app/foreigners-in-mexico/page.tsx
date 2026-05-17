import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

const FAQS: FAQItem[] = [
  {
    question: "How much does private health insurance (GMM) cost in Mexico compared to the US?",
    answerText:
      "Mexican private health insurance (GMM) typically runs at a fraction of US ACA marketplace plans for comparable coverage — even with top hospital networks (ABC, Médica Sur, Hospital Ángeles, Star Médica) and international riders. Premiums depend on age, deductible, coinsurance, network tier, and chosen sum insured. A healthy family of 4 with top-network coverage and international rider commonly falls well below typical US family plan premiums, though specific quotes require underwriting. The exact comparison depends on your age, declared health history, and chosen carrier — we run live quotes during the initial session with the 6 AAA-rated Mexican insurers I work with.",
  },
  {
    question: "Do I need Mexican residency to qualify for these products?",
    answerText:
      "Yes. Mexican financial products covered here require legal residency status — either Residente Temporal (RT) or Residente Permanente (RP). Tourist visas do not qualify because contracting requires a CURP (Mexican tax ID) and proof of address. If you are in the process of obtaining residency, we can plan ahead so you are ready to contract once your status is approved.",
  },
  {
    question: "I have a US health plan. Do I really need Mexican GMM?",
    answerText:
      "For procedures you actually do in Mexico — generally yes. Mexican Major Medical Insurance (GMM) with carriers like BUPA, MetLife or Allianz gives you access to the country's top private hospitals (Médica Sur, Hospital Ángeles, Christus Muguerza, Hospital ABC) at a fraction of US costs. Many of my US-resident clients keep their stateside coverage for emergencies back home and add Mexican GMM as a complementary layer for elective procedures or in-country emergencies. We model the right mix together.",
  },
  {
    question: "Are retirement plans (PPR) worth it for someone who may leave Mexico?",
    answerText:
      "Worth analyzing case by case. PPRs (Planes Personales de Retiro) are most powerful for someone tributing in Mexico — Mexican fiscal residency or income from Mexican sources — because the annual income-tax deduction requires filing a Mexican return. If you may leave in 5 to 10 years, we evaluate options: maintain the plan with continued contributions, freeze contributions, or convert to a payout-aligned structure. The plan itself does not become void if you leave — it is the deduction benefit that depends on your fiscal residency. Mexican retirement plans qualifying under Article 93 of the Income Tax Law currently in force offer attractive tax treatment on the payout side, subject to compliance with applicable fiscal requirements at the time of payout, available in MXN (inflation-adjusted), UDIS, or USD.",
  },
  {
    question: "How does cross-border succession work with Mexican life insurance?",
    answerText:
      "A Mexican life insurance policy with irrevocable beneficiary designation creates a strong advantage under Mexican law (Article 179 of Ley sobre el Contrato de Seguro): the beneficiary acquires a derecho propio — a right of their own arising from the insurance contract itself, not from inheritance. The proceeds do not enter the Mexican estate, so they bypass Mexican probate and reach the beneficiary directly, usually within weeks. How your home country treats the proceeds depends on its own succession law, but the Mexican leg is clean and direct. Especially valuable for foreigners with assets in Mexico whose heirs may live elsewhere — or vice versa.",
  },
  {
    question: "Can you advise me in English?",
    answerText:
      "Yes. I work bilingually — Spanish and English — with clients from the US, Europe, and Latin America. All formal documents (policies, fiscal receipts, regulatory paperwork) are issued in Spanish because Mexican law requires it, but I walk you through each document in English and answer your questions in whichever language you prefer. I am MDRT Top of the Table and ranked 8th nationally by AMASFAC — credentials I earned advising clients across both languages.",
  },
  {
    question: "What if I leave Mexico in 5 or 10 years — can I keep the plans?",
    answerText:
      "Yes, with some structural adjustments. Life insurance and GMM typically remain active as long as you keep paying premiums and maintain your Mexican CURP/RFC. PPR retirement plans stay in your name, but the income-tax deduction benefit ends if you lose Mexican fiscal residency — you would then evaluate whether to continue contributing or freeze the plan. Education plans for your children continue regardless of where you live. We schedule reviews aligned with major life changes, and moving back home is one of them.",
  },
  {
    question: "Can I deduct PPR contributions from my US tax return as a foreign retirement plan?",
    answerText:
      "The PPR (Plan Personal de Retiro) deduction is a Mexican-side benefit applied to your Mexican tax return under Art. 151 fracc V LISR currently in force. On the US side, the IRS generally does not recognize PPRs as qualified retirement plans for US deduction purposes, and they may trigger PFIC (Passive Foreign Investment Company) reporting requirements depending on the underlying investment structure. Coordinate with a US tax preparer familiar with cross-border filings BEFORE contributing — the Mexican tax benefit is real, but the US side has reporting nuances that need to be understood. A common alternative is a retirement plan structured under Article 93 LISR currently in force, which can offer favorable tax treatment on the payout side starting at age 60, subject to compliance with the applicable fiscal requirements. We help you map which products minimize US reporting friction.",
  },
  {
    question: "Which Mexican hospitals are best for English-speaking expats?",
    answerText:
      "The most commonly preferred hospitals among English-speaking expats in Mexico include ABC Medical Center (Mexico City), Médica Sur (Mexico City), Hospital Ángeles (multiple cities), Christus Muguerza (Monterrey and others), and Star Médica (multiple cities). Most have English-speaking staff in international patient services. Critical step before contracting GMM: confirm that the carrier's network includes the specific hospitals you want — networks vary by carrier and plan tier. We help map this during the initial session based on the cities where you live, work, or travel frequently.",
  },
  {
    question: "I'm a digital nomad on a Residente Temporal visa. Can I contract life insurance and GMM?",
    answerText:
      "Yes — Residente Temporal (RT) status with CURP and a Mexican address qualifies you for most life insurance and GMM products. Underwriting may take longer if your income is foreign-sourced (carriers may request additional documentation to verify ability to pay premiums and to assess risk). For GMM specifically, expect health questionnaire and possibly a medical exam depending on age and sum insured. The 6 AAA-rated insurers we work with have varying flexibility for digital nomads — we identify the most accommodating options during the initial session.",
  },
  {
    question: "Do my Mexican policies cover me when I travel back to the US or Europe?",
    answerText:
      "It depends on the plan. Standard domestic Mexican GMM typically covers Mexico-only, sometimes with limited international emergency assistance (defined coverage caps and event types). For comprehensive coverage abroad, you'd need an international plan — BUPA International and GNP VIP are the most common options offering global networks. Life insurance pays out regardless of country of death, subject to standard policy terms.",
  },
];

export const metadata: Metadata = {
  title: "Financial Advisor for Foreigners Living in Mexico — Iria Talan",
  description:
    "Bilingual (Spanish & English) financial advisory for foreigners with Mexican residency (RT/RP). Major medical insurance, life insurance, retirement plans, and education plans. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/foreigners-in-mexico` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/foreigners-in-mexico`,
    title: "Financial Advisor for Foreigners Living in Mexico — Iria Talan",
    description:
      "Strategic financial planning for foreigners building a life in Mexico. Bilingual advisory, MDRT Top of the Table.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/foreigners-in-mexico#audience`,
    audienceType: "Foreigners with Mexican residency (RT or RP) living in Mexico",
    geographicArea: { "@type": "Country", name: "Mexico" },
  };
}

// Service schema específico — clave AEO. Mirror inverso de
// /personas/mexicanos-en-el-extranjero: areaServed=México, audience=extranjeros
// residentes en MX, availableLanguage es+en (bilingüe explícito).
function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/foreigners-in-mexico#service`,
    name: "Bilingual Financial Advisory for Foreigners Living in Mexico",
    description:
      "Strategic financial and patrimonial advisory for foreigners with temporary or permanent Mexican residency. Major medical insurance with premium hospital network, life insurance with irrevocable beneficiary designation for clean cross-border succession, personal retirement plans (PPR) with attractive Mexican tax treatment, and education plans in MXN or USD.",
    serviceType: "Bilingual Financial Advisory",
    category: "Wealth Advisory for Foreign Residents",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "Mexico" },
    audience: { "@id": `${SITE_URL}/foreigners-in-mexico#audience` },
    availableLanguage: ["en", "es"],
  };
}

export default async function ForeignersInMexicoPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = author?.socialLinks?.calendly ?? "/contacto#agendar";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Foreigners in Mexico", path: "/foreigners-in-mexico" },
    ]),
    buildFAQPageSchema(FAQS)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col" lang="en">
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-cream-light0">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}Foreigners in Mexico
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Strategic financial planning for foreigners building a life in Mexico.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            For residents with Temporary (RT) or Permanent (RP) Mexican residency.
            Bilingual advisory — Spanish &amp; English — covering health insurance,
            life insurance, retirement, and education planning.
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
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              Meet Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Why standard advice from your home country may not fit your Mexican life
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                If you have built — or are building — a life in Mexico with legal
                residency, you have access to financial products that often complement,
                and sometimes improve on, what your home country offers. But the
                products are designed under Mexican law, denominated in Mexican
                conventions, and most advisors who know them do not work in English.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">A common gap:</strong>{" "}
                your foreign accountant understands your home jurisdiction; your
                Mexican notary understands Mexican law; nobody coordinates the
                middle — the financial structure that actually moves wealth, protects
                health, and handles succession across the two systems.
              </p>
              <p>
                That coordination is what I do, in both languages.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              What we typically structure together
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Major Medical Insurance (GMM)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Premium Mexican carriers (BUPA, MetLife, Allianz) with access to
                  the country&apos;s top private hospitals — Médica Sur, Hospital Ángeles,
                  Christus Muguerza, Hospital ABC. Lower cost per procedure than
                  equivalent US coverage. Often paired with your home-country plan
                  rather than replacing it.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Life insurance with cross-border succession
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  With irrevocable beneficiary designation, proceeds bypass Mexican
                  probate and reach your beneficiary directly. Especially valuable
                  when your assets are in Mexico but heirs live abroad, or vice
                  versa. Generally income-tax exempt for direct-family beneficiaries
                  under Article 93 fracc. XXI LISR, subject to compliance with
                  applicable fiscal requirements.
                </p>
                <Link
                  href="/patrimonial"
                  className="mt-3 inline-block text-sm font-medium underline"
                >
                  More on wealth planning →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Personal Retirement Plans (PPR)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Mexican retirement plans with attractive tax treatment on both
                  sides — annual deduction while you contribute, favorable payout
                  treatment under Article 93 LISR currently in force, subject to
                  Mexican fiscal residency and compliance with applicable fiscal
                  requirements. Available in MXN (inflation-adjusted), UDIS, or USD.
                  Lifetime annuity or lump-sum payout — and inheritable.
                </p>
                <Link
                  href="/retiro"
                  className="mt-3 inline-block text-sm font-medium underline"
                >
                  More on retirement planning →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Education plans for your children
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  In MXN for Mexican universities or USD for international study.
                  Self-completing structure: if you pass away before your child
                  finishes their studies, the plan completes itself with no
                  additional contribution required.
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
                  We talk about your home jurisdiction, your Mexican residency status,
                  your family, what you already have in place, and what you want to
                  build. In English or Spanish — you choose.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Strategy design
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  I map the Mexican products that fit your situation, in coordination
                  with what you already hold in your home country. No duplication, no
                  gaps. You see the full picture before deciding anything.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Coordinated implementation
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  I coordinate directly with your Mexican accountant and, when useful,
                  with your foreign tax advisor. Documents in Spanish (Mexican law)
                  with English walkthroughs. Signatures via secure digital channels.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Ongoing review
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Annual reviews and check-ins whenever your life shifts — change of
                  residency status, new property, family change, planned return to
                  your home country.
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
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  How much does private health insurance (GMM) cost in Mexico compared to the US?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Mexican private health insurance (GMM) typically runs at a fraction of US ACA marketplace plans for comparable coverage — even with top hospital networks (ABC, Médica Sur, Hospital Ángeles, Star Médica) and international riders. Premiums depend on age, deductible, coinsurance, network tier, and chosen sum insured. A healthy family of 4 with top-network coverage and international rider commonly falls well below typical US family plan premiums, though specific quotes require underwriting. The exact comparison depends on your age, declared health history, and chosen carrier — we run live quotes during the initial session with the 6 AAA-rated Mexican insurers I work with.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Do I need Mexican residency to qualify for these products?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Yes. Mexican financial products covered here require legal residency
                  status — either Residente Temporal (RT) or Residente Permanente (RP).
                  Tourist visas do not qualify because contracting requires a CURP
                  (Mexican tax ID) and proof of address. If you are in the process of
                  obtaining residency, we can plan ahead so you are ready to contract
                  once your status is approved.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  I have a US health plan. Do I really need Mexican GMM?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  For procedures you actually do in Mexico — generally yes. Mexican
                  Major Medical Insurance (GMM) with carriers like BUPA, MetLife or
                  Allianz gives you access to the country&apos;s top private hospitals
                  (Médica Sur, Hospital Ángeles, Christus Muguerza, Hospital ABC) at
                  a fraction of US costs. Many of my US-resident clients keep their
                  stateside coverage for emergencies back home and add Mexican GMM as
                  a complementary layer for elective procedures or in-country
                  emergencies. We model the right mix together.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Are retirement plans (PPR) worth it for someone who may leave Mexico?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Worth analyzing case by case. PPRs (Planes Personales de Retiro)
                  are most powerful for someone tributing in Mexico — Mexican fiscal
                  residency or income from Mexican sources — because the annual
                  income-tax deduction requires filing a Mexican return. If you may
                  leave in 5 to 10 years, we evaluate options: maintain the plan with
                  continued contributions, freeze contributions, or convert to a
                  payout-aligned structure. The plan itself does not become void if
                  you leave — it is the deduction benefit that depends on your fiscal
                  residency. Mexican retirement plans qualifying under Article 93 of
                  the Income Tax Law offer attractive tax treatment on the payout
                  side, available in MXN (inflation-adjusted), UDIS, or USD.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  How does cross-border succession work with Mexican life insurance?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  A Mexican life insurance policy with irrevocable beneficiary
                  designation creates a strong advantage under Mexican law (Article
                  179 of Ley sobre el Contrato de Seguro): the beneficiary acquires
                  a derecho propio — a right of their own arising from the insurance
                  contract itself, not from inheritance. The proceeds do not enter
                  the Mexican estate, so they bypass Mexican probate and reach the
                  beneficiary directly, usually within weeks. How your home country
                  treats the proceeds depends on its own succession law, but the
                  Mexican leg is clean and direct. Especially valuable for foreigners
                  with assets in Mexico whose heirs may live elsewhere — or vice
                  versa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Can you advise me in English?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Yes. I work bilingually — Spanish and English — with clients from
                  the US, Europe, and Latin America. All formal documents (policies,
                  fiscal receipts, regulatory paperwork) are issued in Spanish because
                  Mexican law requires it, but I walk you through each document in
                  English and answer your questions in whichever language you prefer.
                  I am MDRT Top of the Table and ranked 8th nationally by AMASFAC —
                  credentials I earned advising clients across both languages.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  What if I leave Mexico in 5 or 10 years — can I keep the plans?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Yes, with some structural adjustments. Life insurance and GMM
                  typically remain active as long as you keep paying premiums and
                  maintain your Mexican CURP/RFC. PPR retirement plans stay in your
                  name, but the income-tax deduction benefit ends if you lose Mexican
                  fiscal residency — you would then evaluate whether to continue
                  contributing or freeze the plan. Education plans for your children
                  continue regardless of where you live. We schedule reviews aligned
                  with major life changes, and moving back home is one of them.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Can I deduct PPR contributions from my US tax return as a foreign retirement plan?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  The PPR (Plan Personal de Retiro) deduction is a Mexican-side
                  benefit applied to your Mexican tax return under Art. 151 fracc V
                  LISR currently in force. On the US side, the IRS generally does
                  not recognize PPRs as qualified retirement plans for US deduction
                  purposes, and they may trigger PFIC (Passive Foreign Investment
                  Company) reporting requirements depending on the underlying
                  investment structure. Coordinate with a US tax preparer familiar
                  with cross-border filings BEFORE contributing — the Mexican tax
                  benefit is real, but the US side has reporting nuances that need
                  to be understood. A common alternative is a retirement plan
                  structured under Article 93 LISR currently in force, which can
                  offer favorable tax treatment on the payout side starting at age
                  60, subject to compliance with the applicable fiscal requirements.
                  We help you map which products minimize US reporting friction.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Which Mexican hospitals are best for English-speaking expats?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  The most commonly preferred hospitals among English-speaking
                  expats in Mexico include ABC Medical Center (Mexico City), Médica
                  Sur (Mexico City), Hospital Ángeles (multiple cities), Christus
                  Muguerza (Monterrey and others), and Star Médica (multiple
                  cities). Most have English-speaking staff in international patient
                  services. Critical step before contracting GMM: confirm that the
                  carrier&apos;s network includes the specific hospitals you want —
                  networks vary by carrier and plan tier. We help map this during
                  the initial session based on the cities where you live, work, or
                  travel frequently.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  I&apos;m a digital nomad on a Residente Temporal visa. Can I contract life insurance and GMM?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Yes — Residente Temporal (RT) status with CURP and a Mexican
                  address qualifies you for most life insurance and GMM products.
                  Underwriting may take longer if your income is foreign-sourced
                  (carriers may request additional documentation to verify ability
                  to pay premiums and to assess risk). For GMM specifically, expect
                  health questionnaire and possibly a medical exam depending on age
                  and sum insured. The 6 AAA-rated insurers we work with have
                  varying flexibility for digital nomads — we identify the most
                  accommodating options during the initial session.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Do my Mexican policies cover me when I travel back to the US or Europe?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  It depends on the plan. Standard domestic Mexican GMM typically
                  covers Mexico-only, sometimes with limited international
                  emergency assistance (defined coverage caps and event types). For
                  comprehensive coverage abroad, you&apos;d need an international
                  plan — BUPA International and GNP VIP are the most common
                  options offering global networks. Life insurance pays out
                  regardless of country of death, subject to standard policy terms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Related audiences
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              You may also relate to these situations
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/personas/mexicanos-en-el-extranjero"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mexicanos en el extranjero
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  The mirror case — Mexican nationals living in the US, Europe, or
                  Canada who still hold patrimony or family in Mexico (page in
                  Spanish).
                </p>
              </Link>
              <Link
                href="/patrimonial"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Wealth planning &amp; succession
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Detailed pillar on patrimonial planning, irrevocable beneficiary
                  designation, and family-office coordination (page in Spanish).
                </p>
              </Link>
              <Link
                href="/retiro"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Retirement planning in Mexico
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Deep dive on PPR retirement plans and Article 93 LISR tax
                  treatment (page in Spanish).
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
              Advisory available in Spanish or English. No commitment to the first
              conversation.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
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
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
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
                <div className="mt-2 text-sm opacity-80">
                  Calendly · no commitment
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
