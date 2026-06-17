import Link from "next/link";
import styles from "./ArrowLink.module.scss";

type ArrowLinkProps = {
  children: React.ReactNode;
  href: string;
  variant?: "filled" | "outline";
};

export function ArrowLink({ children, href, variant = "filled" }: ArrowLinkProps) {
  return (
    <Link className={`${styles.link} ${styles[variant]}`} href={href}>
      <span>{children}</span><span aria-hidden="true">→</span>
    </Link>
  );
}
