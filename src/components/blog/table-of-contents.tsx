"use client";

import { useState, useEffect } from "react";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function generateId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useTableOfContents(htmlContent: string): TocItem[] {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const headings = doc.querySelectorAll("h2, h3");
    const tocItems: TocItem[] = [];
    headings.forEach((heading) => {
      const text = heading.textContent ?? "";
      if (text.trim()) {
        tocItems.push({
          id: generateId(text),
          text: text.trim(),
          level: heading.tagName === "H2" ? 2 : 3,
        });
      }
    });
    setItems(tocItems);
  }, [htmlContent]);

  return items;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-text-main w-full py-3 px-4 bg-gray-50 rounded-xl"
        >
          <span className="material-symbols-outlined text-[18px]">toc</span>
          Sommaire
          <span
            className={`material-symbols-outlined text-[18px] ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </button>
        {isOpen && (
          <nav className="mt-2 px-4 py-3 bg-gray-50 rounded-xl">
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block text-sm py-1 transition-colors ${
                      activeId === item.id
                        ? "text-primary font-medium"
                        : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block sticky top-24 w-56 shrink-0 self-start">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          Sommaire
        </p>
        <ul className="space-y-1 border-l-2 border-gray-100">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block text-sm py-1 transition-colors border-l-2 -ml-[2px] ${
                  item.level === 3 ? "pl-6" : "pl-4"
                } ${
                  activeId === item.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-text-muted hover:text-text-main hover:border-gray-300"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
