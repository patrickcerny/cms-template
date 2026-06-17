import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site Name";
// Optional Open Graph image (place a file in /public and set the path here, e.g. "/og.jpg").
export const OG_IMAGE = process.env.NEXT_PUBLIC_OG_IMAGE ?? "";

export function canonicalUrl(locale: Locale, path = "") {
  return `${SITE_URL}/${locale}${path}`;
}

export function buildMetadata({
  title,
  description,
  locale,
  path,
  keywords = [],
  ogImage = OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const url = canonicalUrl(locale, path);
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined;

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((code) => [code, canonicalUrl(code, path)])),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => ({ url: image.url })),
    },
  };
}

// JSON-LD organization schema rendered on every page via <SchemaOrg />.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: [],
  };
}
