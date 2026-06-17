import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink/ArrowLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { getCmsDictionary } from "@/lib/cms-dictionary";
import { isLocale, localizedPath } from "@/i18n/config";
import styles from "../Home.module.scss";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getCmsDictionary(locale).home;

  return (
    <>
      <section className={styles.hero}>
        <Reveal className={styles.heroContent}>
          <h1>{t.hero.titleLine1}<br />{t.hero.titleLine2}</h1>
          <p>{t.hero.description}</p>
          <div className={styles.actions}>
            <ArrowLink href={localizedPath(locale, "/about")}>{t.hero.primaryAction}</ArrowLink>
            <ArrowLink href={localizedPath(locale, "/contact")} variant="outline">{t.hero.secondaryAction}</ArrowLink>
          </div>
        </Reveal>
      </section>

      <section className={styles.metrics}>
        <div className={styles.metricsInner}>
          {t.metrics.map((metric, index) => (
            <Reveal delay={index * 90} key={metric.label}>
              <div className={styles.metric}><strong>{metric.value}</strong><span>{metric.label}</span></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <Reveal className={styles.sectionHeader}><h2>{t.features.title}</h2><p>{t.features.description}</p></Reveal>
          <div className={styles.featureGrid}>
            {t.features.items.map((item, index) => (
              <Reveal delay={index * 110} key={item.title}>
                <article className={styles.featureCard}><FeatureIcon name={item.icon} /><h3>{item.title}</h3><p>{item.description}</p></article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.quote}>
        <Reveal className={styles.container}><blockquote>{t.quote.text}</blockquote><p>— {t.quote.label}</p></Reveal>
      </section>

      <section className={styles.cta}>
        <Reveal className={styles.container}><h2>{t.cta.title}</h2><p>{t.cta.description}</p><ArrowLink href={localizedPath(locale, "/contact")}>{t.cta.action}</ArrowLink></Reveal>
      </section>
    </>
  );
}

// Simple line icons for the feature cards. Add cases here to support more icon keys.
function FeatureIcon({ name }: { name?: string }) {
  const common = { "aria-hidden": true, fill: "none", viewBox: "0 0 48 48" } as const;
  if (name === "grid") {
    return <svg {...common}><path d="M8 8h14v14H8zM26 8h14v14H26zM8 26h14v14H8zM26 26h14v14H26z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
  }
  if (name === "shield") {
    return <svg {...common}><path d="M24 6l16 6v10c0 10-7 17-16 20-9-3-16-10-16-20V12l16-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
  }
  // default: spark
  return <svg {...common}><path d="M24 6v36M6 24h36M12 12l24 24M36 12L12 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
