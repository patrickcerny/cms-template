"use client";

import { useMemo, useState, type ReactNode } from "react";
import { locales, type Dictionary, type Locale } from "@/i18n/config";
import { saveSiteContentAction } from "./actions";
import styles from "./SiteContentEditor.module.scss";

type CmsContent = Record<Locale, Dictionary>;
type Path = (string | number)[];

const sections = [
  { id: "general", label: "General" },
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "legal", label: "Legal" },
] as const;

const legalSlugs = ["privacy", "terms"] as const;
const iconOptions = ["spark", "grid", "shield"];

// Soft limits on how many array items can be added from the UI.
const caps = {
  metrics: 8,
  features: 6,
  aboutBody: 12,
  addressLines: 6,
  legalSections: 16,
  legalParagraphs: 12,
} as const;

export function SiteContentEditor({ initialContent }: { initialContent: CmsContent }) {
  const [content, setContent] = useState<CmsContent>(initialContent);
  const [section, setSection] = useState<(typeof sections)[number]["id"]>("general");
  const [legalSlug, setLegalSlug] = useState<(typeof legalSlugs)[number]>("privacy");
  const serialized = useMemo(() => JSON.stringify(content), [content]);

  // The first locale is the reference for array lengths (all locales stay in sync).
  const refLocale = locales[0];

  function setValue(locale: Locale, path: Path, value: string) {
    setContent((current) => ({ ...current, [locale]: setDeepValue(current[locale], path, value) }));
  }

  function setShared(path: Path, value: string) {
    setContent((current) => {
      const next = { ...current };
      for (const locale of locales) next[locale] = setDeepValue(next[locale], path, value);
      return next;
    });
  }

  function lengthAt(path: Path) {
    return (getDeepValue(content[refLocale], path) as unknown[]).length;
  }

  function addItem(path: Path, makeItem: () => unknown, max: number) {
    if (lengthAt(path) >= max) return;
    setContent((current) => {
      const next = { ...current };
      for (const locale of locales) {
        const items = getDeepValue(next[locale], path) as unknown[];
        next[locale] = setDeepValue(next[locale], path, [...items, makeItem()]);
      }
      return next;
    });
  }

  function removeItem(path: Path, index: number, min = 0) {
    if (lengthAt(path) <= min) return;
    setContent((current) => {
      const next = { ...current };
      for (const locale of locales) {
        const items = getDeepValue(next[locale], path) as unknown[];
        next[locale] = setDeepValue(next[locale], path, items.filter((_, i) => i !== index));
      }
      return next;
    });
  }

  // Convenience: render one input per locale for a string at `path`.
  function field(label: string, path: Path, textarea = false) {
    return <MultiLocaleField key={path.join(".")} content={content} label={label} path={path} textarea={textarea} onChange={setValue} />;
  }

  const metricsCount = lengthAt(["home", "metrics"]);
  const featuresCount = lengthAt(["home", "features", "items"]);
  const aboutBodyCount = lengthAt(["about", "body"]);
  const addressCount = lengthAt(["contactPage", "addressLines"]);
  const legalSectionsPath: Path = ["legalPages", legalSlug, "sections"];
  const legalSectionsCount = lengthAt(legalSectionsPath);
  const legalSections = getDeepValue(content[refLocale], legalSectionsPath) as { paragraphs: string[] }[];

  return (
    <form action={saveSiteContentAction} className={styles.layout}>
      <aside className={styles.sidebar}>
        {sections.map((item) => (
          <button className={styles.sidebarButton} data-active={section === item.id} key={item.id} type="button" onClick={() => setSection(item.id)}>
            {item.label}
          </button>
        ))}
        <input name="contentJson" type="hidden" value={serialized} />
        <button className={styles.saveButton} type="submit">Save site</button>
      </aside>

      <section className={styles.content}>
        {section === "general" && (
          <SectionFrame title="General">
            <Panel title="Site">
              {field("Site title", ["meta", "title"])}
              {field("Site description (SEO)", ["meta", "description"], true)}
              {field("Brand / wordmark", ["navigation", "brand"])}
            </Panel>
            <Panel title="Navigation labels">
              {field("Home", ["navigation", "home"])}
              {field("About", ["navigation", "about"])}
              {field("Contact", ["navigation", "contact"])}
              {field("Language switch label", ["navigation", "language"])}
            </Panel>
            <Panel title="Footer">
              {field("Description", ["footer", "description"], true)}
              {field("Links heading", ["footer", "navTitle"])}
              {field("Rights notice", ["footer", "rights"])}
            </Panel>
          </SectionFrame>
        )}

        {section === "home" && (
          <SectionFrame title="Home">
            <Panel title="Hero">
              {field("Title line 1", ["home", "hero", "titleLine1"])}
              {field("Title line 2", ["home", "hero", "titleLine2"])}
              {field("Description", ["home", "hero", "description"], true)}
              {field("Primary button", ["home", "hero", "primaryAction"])}
              {field("Secondary button", ["home", "hero", "secondaryAction"])}
            </Panel>

            <ArrayPanel title="Metrics" count={metricsCount} max={caps.metrics} onAdd={() => addItem(["home", "metrics"], () => ({ value: "", label: "" }), caps.metrics)}>
              {range(metricsCount).map((index) => (
                <Accordion key={`metric-${index}`} open={index === 0} title={`Metric ${index + 1}`} canRemove={metricsCount > 1} onRemove={() => removeItem(["home", "metrics"], index, 1)}>
                  {field("Value", ["home", "metrics", index, "value"])}
                  {field("Label", ["home", "metrics", index, "label"])}
                </Accordion>
              ))}
            </ArrayPanel>

            <Panel title="Features intro">
              {field("Title", ["home", "features", "title"])}
              {field("Description", ["home", "features", "description"], true)}
            </Panel>

            <ArrayPanel title="Feature cards" count={featuresCount} max={caps.features} onAdd={() => addItem(["home", "features", "items"], () => ({ icon: "spark", title: "", description: "" }), caps.features)}>
              {range(featuresCount).map((index) => (
                <Accordion key={`feature-${index}`} open={index === 0} title={`Feature ${index + 1}`} canRemove={featuresCount > 1} onRemove={() => removeItem(["home", "features", "items"], index, 1)}>
                  <SelectField label="Icon" options={iconOptions} value={String(getDeepValue(content[refLocale], ["home", "features", "items", index, "icon"]) || "spark")} onChange={(value) => setShared(["home", "features", "items", index, "icon"], value)} />
                  {field("Title", ["home", "features", "items", index, "title"])}
                  {field("Description", ["home", "features", "items", index, "description"], true)}
                </Accordion>
              ))}
            </ArrayPanel>

            <Panel title="Quote">
              {field("Quote text", ["home", "quote", "text"], true)}
              {field("Attribution", ["home", "quote", "label"])}
            </Panel>

            <Panel title="Call to action">
              {field("Title", ["home", "cta", "title"])}
              {field("Description", ["home", "cta", "description"], true)}
              {field("Button", ["home", "cta", "action"])}
            </Panel>
          </SectionFrame>
        )}

        {section === "about" && (
          <SectionFrame title="About">
            <Panel title="Header">
              {field("Eyebrow", ["about", "eyebrow"])}
              {field("Title", ["about", "title"])}
              {field("Description", ["about", "description"], true)}
            </Panel>
            <ArrayPanel title="Body paragraphs" count={aboutBodyCount} max={caps.aboutBody} onAdd={() => addItem(["about", "body"], () => "", caps.aboutBody)}>
              {range(aboutBodyCount).map((index) => (
                <Accordion key={`about-${index}`} open={index === 0} title={`Paragraph ${index + 1}`} canRemove={aboutBodyCount > 1} onRemove={() => removeItem(["about", "body"], index, 1)}>
                  {field("Text", ["about", "body", index], true)}
                </Accordion>
              ))}
            </ArrayPanel>
          </SectionFrame>
        )}

        {section === "contact" && (
          <SectionFrame title="Contact">
            <Panel title="Header">
              {field("Eyebrow", ["contactPage", "eyebrow"])}
              {field("Title", ["contactPage", "title"])}
              {field("Description", ["contactPage", "description"], true)}
            </Panel>
            <Panel title="Details">
              {field("Office label", ["contactPage", "officeTitle"])}
              {field("Office / company name", ["contactPage", "officeName"])}
              {field("Address label", ["contactPage", "addressLabel"])}
              {field("Phone label", ["contactPage", "phoneLabel"])}
              {field("Phone value", ["contactPage", "phoneValue"])}
              {field("Email label", ["contactPage", "emailLabel"])}
              {field("Email value", ["contactPage", "emailValue"])}
              {field("Email button label", ["contactPage", "actionEmailLabel"])}
              {field("Call button label", ["contactPage", "actionCallLabel"])}
            </Panel>
            <ArrayPanel title="Address lines" count={addressCount} max={caps.addressLines} onAdd={() => addItem(["contactPage", "addressLines"], () => "", caps.addressLines)}>
              {range(addressCount).map((index) => (
                <Accordion key={`address-${index}`} open={index === 0} title={`Line ${index + 1}`} canRemove={addressCount > 1} onRemove={() => removeItem(["contactPage", "addressLines"], index, 1)}>
                  {field("Text", ["contactPage", "addressLines", index])}
                </Accordion>
              ))}
            </ArrayPanel>
          </SectionFrame>
        )}

        {section === "legal" && (
          <SectionFrame title="Legal">
            <div className={styles.tabRow}>
              {legalSlugs.map((slug) => (
                <button className={styles.tabButton} data-active={legalSlug === slug} key={slug} type="button" onClick={() => setLegalSlug(slug)}>
                  {slug}
                </button>
              ))}
            </div>
            <Panel title="Header">
              {field("Eyebrow", ["legalPages", legalSlug, "eyebrow"])}
              {field("Title", ["legalPages", legalSlug, "title"])}
              {field("Intro", ["legalPages", legalSlug, "intro"], true)}
              {field("Notice (optional)", ["legalPages", legalSlug, "notice"], true)}
            </Panel>
            <ArrayPanel title="Sections" count={legalSectionsCount} max={caps.legalSections} onAdd={() => addItem(legalSectionsPath, () => ({ title: "", paragraphs: [""] }), caps.legalSections)}>
              {range(legalSectionsCount).map((sectionIndex) => {
                const paragraphsPath: Path = [...legalSectionsPath, sectionIndex, "paragraphs"];
                const paragraphCount = legalSections[sectionIndex]?.paragraphs.length ?? 0;
                return (
                  <Accordion key={`legal-${legalSlug}-${sectionIndex}`} open={sectionIndex === 0} title={`Section ${sectionIndex + 1}`} canRemove={legalSectionsCount > 1} onRemove={() => removeItem(legalSectionsPath, sectionIndex, 1)}>
                    {field("Title", [...legalSectionsPath, sectionIndex, "title"])}
                    <SubsectionHeader title="Paragraphs" addDisabled={paragraphCount >= caps.legalParagraphs} onAdd={() => addItem(paragraphsPath, () => "", caps.legalParagraphs)} />
                    {range(paragraphCount).map((paragraphIndex) => (
                      <div className={styles.paragraphItem} key={`p-${paragraphIndex}`}>
                        <div className={styles.inlineActions}>
                          <span>Paragraph {paragraphIndex + 1}</span>
                          <button className={styles.removeButton} type="button" disabled={paragraphCount <= 1} onClick={() => removeItem(paragraphsPath, paragraphIndex, 1)}>Remove</button>
                        </div>
                        {field("Text", [...paragraphsPath, paragraphIndex], true)}
                      </div>
                    ))}
                  </Accordion>
                );
              })}
            </ArrayPanel>
          </SectionFrame>
        )}
      </section>
    </form>
  );
}

function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function SectionFrame({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.panel}>
      <h3>{title}</h3>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function ArrayPanel({ children, count, max, onAdd, title }: { children: ReactNode; count: number; max: number; onAdd: () => void; title: string }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelTop}>
        <h3>{title}</h3>
        <div className={styles.inlineActions}>
          <span>{count} / {max}</span>
          <button className={styles.addButton} disabled={count >= max} type="button" onClick={onAdd}>Add</button>
        </div>
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function Accordion({ canRemove, children, onRemove, open, title }: { canRemove: boolean; children: ReactNode; onRemove: () => void; open?: boolean; title: string }) {
  return (
    <details className={styles.accordion} open={open}>
      <summary className={styles.accordionSummary}>{title}</summary>
      <div className={styles.accordionBody}>
        <div className={styles.inlineActions}>
          <span />
          <button className={styles.removeButton} disabled={!canRemove} type="button" onClick={onRemove}>Remove</button>
        </div>
        {children}
      </div>
    </details>
  );
}

function SubsectionHeader({ addDisabled, onAdd, title }: { addDisabled?: boolean; onAdd: () => void; title: string }) {
  return (
    <div className={styles.subsectionHeader}>
      <h4>{title}</h4>
      <button className={styles.addButton} disabled={addDisabled} type="button" onClick={onAdd}>Add</button>
    </div>
  );
}

function MultiLocaleField({ content, label, onChange, path, textarea }: {
  content: CmsContent;
  label: string;
  onChange: (locale: Locale, path: Path, value: string) => void;
  path: Path;
  textarea: boolean;
}) {
  return (
    <div className={styles.dualField}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.localeGrid}>
        {locales.map((locale) => (
          <label className={styles.field} key={locale}>
            <span>{locale.toUpperCase()}</span>
            {textarea
              ? <textarea value={String(getDeepValue(content[locale], path) ?? "")} onChange={(event) => onChange(locale, path, event.target.value)} />
              : <input value={String(getDeepValue(content[locale], path) ?? "")} onChange={(event) => onChange(locale, path, event.target.value)} />}
          </label>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[]; value: string }) {
  return (
    <label className={styles.selectField}>
      <span className={styles.fieldLabel}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function getDeepValue(value: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[String(key)];
    }
    return undefined;
  }, value);
}

function setDeepValue<T>(value: T, path: Path, nextValue: unknown): T {
  if (!path.length) return nextValue as T;
  const [head, ...rest] = path;
  if (Array.isArray(value)) {
    const next = [...value];
    next[Number(head)] = setDeepValue(next[Number(head)], rest, nextValue);
    return next as T;
  }
  if (value && typeof value === "object") {
    const key = String(head);
    const current = value as Record<string, unknown>;
    return { ...current, [key]: setDeepValue(current[key], rest, nextValue) } as T;
  }
  return value;
}
