import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./LegalPage.module.scss";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  notice: string;
  sections: { title: string; paragraphs: string[] }[];
};

export function LegalPage({ eyebrow, intro, notice, sections, title }: LegalPageProps) {
  return (
    <article className={styles.page}>
      <Reveal className={styles.hero}>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{intro}</span>
      </Reveal>
      <div className={styles.content}>
        {notice && <Reveal className={styles.notice}><p>{notice}</p></Reveal>}
        {sections.map((section, index) => (
          <Reveal className={styles.section} delay={Math.min(index * 50, 250)} key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
