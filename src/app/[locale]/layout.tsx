import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { SchemaOrg } from "@/components/SchemaOrg";
import { getCmsDictionary } from "@/lib/cms-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { buildMetadata, organizationSchema, SITE_URL } from "@/lib/seo";
import "../base.scss";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = getCmsDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata({
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      locale,
    }),
    title: {
      default: dictionary.meta.title,
      template: `%s | ${dictionary.meta.title}`,
    },
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getCmsDictionary(locale);
  return (
    <html lang={locale}>
      <body>
        <SchemaOrg schema={organizationSchema()} />
        <Header dictionary={dictionary} locale={locale} />
        <main>{children}</main>
        <Footer dictionary={dictionary} locale={locale} />
      </body>
    </html>
  );
}
