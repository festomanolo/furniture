import { Link, useParams } from "react-router";
import { ChevronRight, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/Section";
import { env } from "@/lib/env";
import { useT } from "@/lib/i18n";
import NotFound from "./NotFound";

type L = { en: string; sw: string };
interface Topic {
  title: L;
  sections: { h: L; p: L }[];
  draft?: boolean;
}

/** Customer-facing policy copy. Legal pages are marked draft until reviewed by counsel. */
const TOPICS: Record<string, Topic> = {
  delivery: {
    title: { en: "Delivery", sw: "Usafirishaji" },
    sections: [
      {
        h: { en: "Who delivers", sw: "Nani anasafirisha" },
        p: {
          en: "Each seller delivers their own furniture. If your cart has items from two sellers, they arrive separately and each has its own delivery fee.",
          sw: "Kila muuzaji husafirisha samani zake. Kikapu chako kikiwa na bidhaa za wauzaji wawili, zitafika kwa nyakati tofauti na kila moja na gharama yake.",
        },
      },
      {
        h: { en: "Fees and quotations", sw: "Gharama na makadirio" },
        p: {
          en: "Delivery fees shown at checkout are set by the seller for your region. When a seller does not list a fee for your area, they send a delivery quotation before you pay for delivery.",
          sw: "Gharama za usafirishaji zinazoonekana wakati wa kulipia zimewekwa na muuzaji kwa mkoa wako. Muuzaji asipoweka gharama kwa eneo lako, atakutumia makadirio kabla hujalipia usafirishaji.",
        },
      },
      {
        h: { en: "SAMANI transport partners", sw: "Wasafirishaji wa SAMANI" },
        p: {
          en: "For large pieces or long distances we can arrange a vetted transporter. You receive the quote, vehicle and transporter details before anything is booked.",
          sw: "Kwa samani kubwa au umbali mrefu tunaweza kupanga msafirishaji aliyehakikiwa. Utapokea bei, aina ya gari na taarifa za msafirishaji kabla ya kuweka nafasi.",
        },
      },
      {
        h: { en: "Collection", sw: "Kuchukua mwenyewe" },
        p: {
          en: "You can collect from the workshop free of charge at a time you agree with the seller.",
          sw: "Unaweza kuchukua karakana bila malipo kwa muda mtakaokubaliana na muuzaji.",
        },
      },
    ],
  },
  returns: {
    title: { en: "Returns and disputes", sw: "Kurudisha na migogoro" },
    sections: [
      {
        h: { en: "Check on arrival", sw: "Kagua inapofika" },
        p: {
          en: "Inspect your furniture when it arrives. An order is only marked delivered after you confirm it, not when the seller dispatches it.",
          sw: "Kagua samani yako inapofika. Oda huwekwa kuwa imefika baada ya wewe kuthibitisha, si muuzaji anapoituma.",
        },
      },
      {
        h: { en: "Damage or wrong item", sw: "Imeharibika au si sahihi" },
        p: {
          en: "Report damage or a mismatch from the order page within 48 hours, with photos. The seller responds first; if you cannot agree, SAMANI reviews the evidence.",
          sw: "Ripoti uharibifu au kutolingana kupitia ukurasa wa oda ndani ya saa 48, pamoja na picha. Muuzaji atajibu kwanza; msipokubaliana, SAMANI itapitia ushahidi.",
        },
      },
      {
        h: { en: "Custom pieces", sw: "Samani maalum" },
        p: {
          en: "Custom furniture follows the specification you approved. Changes after approval need a new agreed revision before production continues.",
          sw: "Samani maalum hufuata maelezo uliyoidhinisha. Mabadiliko baada ya kuidhinisha yanahitaji makubaliano mapya kabla ya kuendelea kutengeneza.",
        },
      },
    ],
  },
  custom: {
    title: { en: "How custom furniture works", sw: "Jinsi samani maalum inavyofanya kazi" },
    sections: [
      { h: { en: "Describe it", sw: "Elezea" }, p: { en: "Use Custom Studio to share photos, sizes, materials, budget and location.", sw: "Tumia Studio kutuma picha, vipimo, malighafi, bajeti na mahali." } },
      {
        h: { en: "Compare quotations", sw: "Linganisha makadirio" },
        p: {
          en: "Verified carpenters send quotations with price, materials, labour, delivery, production time and warranty.",
          sw: "Mafundi waliothibitishwa hutuma makadirio yenye bei, malighafi, ufundi, usafirishaji, muda wa kutengeneza na dhamana.",
        },
      },
      {
        h: { en: "Follow production", sw: "Fuatilia utengenezaji" },
        p: {
          en: "After you accept, the carpenter posts progress photos at each stage, from materials to quality inspection and dispatch.",
          sw: "Ukikubali, fundi hutuma picha za maendeleo kila hatua, kuanzia malighafi hadi ukaguzi na kusafirisha.",
        },
      },
    ],
  },
  selling: {
    title: { en: "Sell with SAMANI", sw: "Uza kupitia SAMANI" },
    sections: [
      {
        h: { en: "Who can sell", sw: "Nani anaweza kuuza" },
        p: { en: "Furniture shops, independent carpenters, manufacturers and interior designers across Tanzania.", sw: "Maduka ya samani, mafundi seremala, viwanda na wabunifu wa ndani kote Tanzania." },
      },
      {
        h: { en: "Fees", sw: "Ada" },
        p: {
          en: "A commission of 4% on ready-made and 3% on custom furniture, charged only on completed sales and never on delivery charges.",
          sw: "Kamisheni ya 4% kwa samani tayari na 3% kwa samani maalum, inakatwa kwa mauzo yaliyokamilika tu, na si kwenye gharama za usafirishaji.",
        },
      },
      {
        h: { en: "Getting verified", sw: "Kuthibitishwa" },
        p: {
          en: "Register with your business details and identification. Our team reviews them before your verified badge appears.",
          sw: "Jisajili kwa taarifa za biashara na kitambulisho. Timu yetu itazipitia kabla alama ya uthibitisho haijaonekana.",
        },
      },
    ],
  },
  standards: {
    title: { en: "Seller standards", sw: "Viwango vya wauzaji" },
    sections: [
      { h: { en: "Honest photos", sw: "Picha za kweli" }, p: { en: "Show the real piece from several angles in natural light. No borrowed or edited images that change materials or colour.", sw: "Onyesha samani halisi kwa pembe kadhaa kwenye mwanga wa asili. Hakuna picha za kuazima au zilizohaririwa kubadilisha malighafi au rangi." } },
      { h: { en: "Clear pricing", sw: "Bei wazi" }, p: { en: "Prices, delivery fees and installation costs are listed separately before checkout.", sw: "Bei, gharama za usafirishaji na ufungaji huonyeshwa kando kabla ya kulipia." } },
      { h: { en: "Respond quickly", sw: "Jibu haraka" }, p: { en: "Confirm or decline orders and quotation requests promptly, and keep customers updated during production.", sw: "Thibitisha au kataa oda na maombi ya makadirio haraka, na wajulishe wateja wakati wa kutengeneza." } },
    ],
  },
  contact: {
    title: { en: "Contact us", sw: "Wasiliana nasi" },
    sections: [
      {
        h: { en: "Order questions", sw: "Maswali ya oda" },
        p: { en: "Message the seller from the product or order page. They know your piece best.", sw: "Mtumie muuzaji ujumbe kupitia ukurasa wa bidhaa au oda. Yeye anaijua samani yako zaidi." },
      },
      {
        h: { en: "SAMANI support", sw: "Msaada wa SAMANI" },
        p: { en: "For disputes, account or payment questions, reach our team on WhatsApp during working hours, Monday to Saturday.", sw: "Kwa migogoro, akaunti au malipo, wasiliana na timu yetu kwa WhatsApp saa za kazi, Jumatatu hadi Jumamosi." },
      },
    ],
  },
  privacy: {
    title: { en: "Privacy", sw: "Faragha" },
    draft: true,
    sections: [
      {
        h: { en: "What we collect", sw: "Tunachokusanya" },
        p: { en: "Your name, phone number, delivery address and order history, so sellers can fulfil your orders.", sw: "Jina, namba ya simu, anwani ya kupokelea na historia ya oda, ili wauzaji waweze kukamilisha oda zako." },
      },
      {
        h: { en: "Who sees it", sw: "Nani anaona" },
        p: { en: "Only the seller fulfilling an order sees the details needed to deliver it. We do not sell your data.", sw: "Ni muuzaji anayekamilisha oda tu anayeona taarifa zinazohitajika kuisafirisha. Hatuuzi taarifa zako." },
      },
    ],
  },
  terms: {
    title: { en: "Terms", sw: "Masharti" },
    draft: true,
    sections: [
      {
        h: { en: "Marketplace role", sw: "Jukumu la soko" },
        p: { en: "SAMANI connects buyers with independent sellers. Each sale is between you and the seller who lists the item.", sw: "SAMANI inawaunganisha wanunuzi na wauzaji huru. Kila mauzo ni kati yako na muuzaji aliyeweka bidhaa." },
      },
      {
        h: { en: "Payments", sw: "Malipo" },
        p: { en: "Payment is only requested after the seller confirms availability. Confirmation always comes from the payment provider, never from the app alone.", sw: "Malipo yanaombwa baada ya muuzaji kuthibitisha upatikanaji. Uthibitisho hutoka kwa mtoa huduma wa malipo, si programu pekee." },
      },
    ],
  },
};

export default function Help() {
  const { topic = "" } = useParams();
  const { locale } = useT();
  const page = TOPICS[topic];
  if (!page) return <NotFound />;
  return (
    <div>
      <PageHeader title={page.title[locale]} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {page.draft && (
          <p className="mb-5 inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold-deep">
            {locale === "sw" ? "Rasimu, inasubiri mapitio ya kisheria" : "Draft, pending legal review"}
          </p>
        )}
        <div className="grid gap-4">
          {page.sections.map((s) => (
            <section key={s.h.en} className="rounded-[1.5rem] bg-paper p-5 ring-1 ring-line">
              <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{s.h[locale]}</h2>
              <p className="mt-2 max-w-[65ch] text-[15px] leading-relaxed text-ink/80">{s.p[locale]}</p>
            </section>
          ))}
        </div>
        {topic === "contact" && env.supportWhatsapp && (
          <a href={`https://wa.me/${env.supportWhatsapp}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-forest px-6 font-medium text-white">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        )}
        <nav className="mt-10 grid gap-2" aria-label="Help topics">
          {Object.entries(TOPICS)
            .filter(([k]) => k !== topic)
            .map(([k, v]) => (
              <Link key={k} to={`/help/${k}`} className="flex h-13 items-center justify-between rounded-2xl px-4 hover:bg-sage/60">
                {v.title[locale]} <ChevronRight className="size-4 text-muted" />
              </Link>
            ))}
        </nav>
      </div>
    </div>
  );
}
