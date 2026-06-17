import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./ContactPage.module.scss";

type ContactPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  officeTitle: string;
  officeName: string;
  addressLabel: string;
  addressLines: string[];
  phoneLabel: string;
  phoneValue: string;
  emailLabel: string;
  emailValue: string;
  actionEmailLabel: string;
  actionCallLabel: string;
};

export function ContactPage({
  actionCallLabel,
  actionEmailLabel,
  addressLabel,
  addressLines,
  description,
  emailLabel,
  emailValue,
  eyebrow,
  officeName,
  officeTitle,
  phoneLabel,
  phoneValue,
  title,
}: ContactPageProps) {
  const telHref = `tel:${phoneValue.replace(/\s+/g, "")}`;

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <Reveal>
            <div className={styles.intro}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1>{title}</h1>
              <p className={styles.description}>{description}</p>
            </div>
          </Reveal>

          <div className={styles.sideColumn}>
            <Reveal delay={120}>
              <article className={styles.contactBlock}>
                <p className={styles.cardLabel}>{officeTitle}</p>
                <h2>{officeName}</h2>
                <div className={styles.detailGroup}>
                  <span>{addressLabel}</span>
                  <address>
                    {addressLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </address>
                </div>
              </article>
            </Reveal>

            <Reveal delay={180}>
              <div className={styles.detailList}>
                <div className={styles.detailRow}>
                  <span>{phoneLabel}</span>
                  <a href={telHref}>{phoneValue}</a>
                </div>
                <div className={styles.detailRow}>
                  <span>{emailLabel}</span>
                  <a href={`mailto:${emailValue}`}>{emailValue}</a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className={styles.actions}>
                <a className={styles.primaryAction} href={`mailto:${emailValue}`}>{actionEmailLabel}</a>
                <a className={styles.secondaryAction} href={telHref}>{actionCallLabel}</a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
