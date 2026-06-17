"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/i18n/config";
import { localizedPath, locales } from "@/i18n/config";
import styles from "./Header.module.scss";

export function Header({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const otherLocale = locales.find((code) => code !== locale) ?? locale;
  const alternatePath = pathname.replace(/^\/[^/]+/, `/${otherLocale}`);

  const navigation = [
    { href: "/about", label: dictionary.navigation.about },
    { href: "/contact", label: dictionary.navigation.contact },
  ];
  const mobileNavigation = [{ href: "", label: dictionary.navigation.home }, ...navigation];
  const legalNavigation = [
    { href: "/legal/privacy", label: dictionary.legalPages.privacy.title },
    { href: "/legal/terms", label: dictionary.legalPages.terms.title },
  ];

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href={localizedPath(locale)} onClick={closeMenu}>
          {dictionary.navigation.brand}
        </Link>
        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigation.map((item) => (
            <Link href={localizedPath(locale, item.href)} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link className={styles.language} href={alternatePath}>{dictionary.navigation.language}</Link>
          <Link className={styles.cta} href={localizedPath(locale, "/contact")}>{dictionary.navigation.contact}</Link>
        </div>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? dictionary.navigation.closeMenu : dictionary.navigation.openMenu}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className={styles.menuIcon} data-open={isMenuOpen}><span /><span /><span /></span>
        </button>
      </div>

      <div className={styles.mobileMenu} data-open={isMenuOpen}>
        <div className={styles.mobileMenuTop}>
          <Link className={styles.mobileLanguage} href={alternatePath} onClick={closeMenu}>{dictionary.navigation.language}</Link>
          <button className={styles.mobileClose} type="button" aria-label={dictionary.navigation.closeMenu} onClick={closeMenu}>×</button>
        </div>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {mobileNavigation.map((item) => {
            const href = localizedPath(locale, item.href);
            return <Link className={styles.mobileNavLink} data-active={pathname === href} href={href} key={item.href || "home"} onClick={closeMenu}>{item.label}</Link>;
          })}
        </nav>
        <div className={styles.mobileMenuFooter}>
          {legalNavigation.map((item) => (
            <Link href={localizedPath(locale, item.href)} key={item.href} onClick={closeMenu}>{item.label}</Link>
          ))}
        </div>
      </div>
      <button className={styles.backdrop} type="button" aria-hidden={!isMenuOpen} data-open={isMenuOpen} tabIndex={isMenuOpen ? 0 : -1} onClick={closeMenu} />
    </header>
  );
}
