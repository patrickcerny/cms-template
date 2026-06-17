import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/ui/PageIntro/PageIntro";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { getCmsDictionary } from "@/lib/cms-dictionary";
import { isLocale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import styles from "./About.module.scss";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = getCmsDictionary(locale).about;
  return buildMetadata({ title: page.title, description: page.description, locale, path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = getCmsDictionary(locale).about;

  return (
    <>
      <PageIntro eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <Reveal className={styles.body}>
        {page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </Reveal>
    </>
  );
}
