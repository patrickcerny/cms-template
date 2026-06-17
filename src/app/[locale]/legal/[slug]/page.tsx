import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/pages/LegalPage/LegalPage";
import { getCmsDictionary } from "@/lib/cms-dictionary";
import { isLocale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";

const slugs = ["privacy", "terms"] as const;
type Slug = (typeof slugs)[number];

function isSlug(value: string): value is Slug {
  return slugs.includes(value as Slug);
}

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) return {};
  const page = getCmsDictionary(locale).legalPages[slug];
  return buildMetadata({ title: page.title, description: page.intro, locale, path: `/legal/${slug}`, noIndex: true });
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) notFound();
  return <LegalPage {...getCmsDictionary(locale).legalPages[slug]} />;
}
