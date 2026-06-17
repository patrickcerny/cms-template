"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${styles.reveal} ${visible ? styles.visible : ""} ${className}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
