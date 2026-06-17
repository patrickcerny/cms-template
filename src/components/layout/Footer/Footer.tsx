import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/config";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Footer.module.scss";

export function Footer({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const navLinks = [
    { href: "", label: dictionary.navigation.home },
    { href: "/about", label: dictionary.navigation.about },
    { href: "/contact", label: dictionary.navigation.contact },
  ];
  const legalLinks = [
    { href: "/legal/privacy", label: dictionary.legalPages.privacy.title },
    { href: "/legal/terms", label: dictionary.legalPages.terms.title },
  ];

  return (
    <footer className={styles.footer}>
      <Reveal className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.brand}>{dictionary.navigation.brand}</p>
          <p className={styles.note}>{dictionary.footer.description}</p>
        </div>
        <nav className={styles.links} aria-label="Footer navigation">
          <h4>{dictionary.footer.navTitle}</h4>
          {navLinks.map((item) => (
            <Link href={localizedPath(locale, item.href)} key={item.href || "home"}>{item.label}</Link>
          ))}
        </nav>
        <p className={styles.copyright}>© {new Date().getFullYear()} {dictionary.navigation.brand}. {dictionary.footer.rights}</p>
        <div className={styles.legal}>
          {legalLinks.map((item) => (
            <Link href={localizedPath(locale, item.href)} key={item.href}>{item.label}</Link>
          ))}
        </div>
      </Reveal>
    </footer>
  );
}
