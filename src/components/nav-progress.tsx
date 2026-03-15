"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Detect navigation start via pathname change
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      // Navigation completed
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      setPrevPathname(pathname);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  // Listen for click on links to start progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      if (target.getAttribute("target") === "_blank") return;
      // Same page link — skip
      if (href === pathname || href === window.location.pathname) return;

      setLoading(true);
      setProgress(20);

      // Simulate progress
      const t1 = setTimeout(() => setProgress(50), 150);
      const t2 = setTimeout(() => setProgress(70), 400);
      const t3 = setTimeout(() => setProgress(85), 800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div
        className="h-full bg-[#6C5CE7] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
