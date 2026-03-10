"use client";

import { useState, useEffect } from "react";

type ReactionType = "thumbs_up" | "favorite" | "lightbulb";

const REACTIONS: { type: ReactionType; icon: string; label: string }[] = [
  { type: "thumbs_up", icon: "thumb_up", label: "Utile" },
  { type: "favorite", icon: "favorite", label: "J'adore" },
  { type: "lightbulb", icon: "lightbulb", label: "Instructif" },
];

function getStorageKey(slug: string): string {
  return `tmc-reaction-${slug}`;
}

export function ArticleReactions({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<ReactionType | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(slug));
      if (stored) setSelected(stored as ReactionType);
    } catch {
      // localStorage unavailable
    }
  }, [slug]);

  function handleReaction(type: ReactionType) {
    const newValue = selected === type ? null : type;
    setSelected(newValue);
    try {
      if (newValue) {
        localStorage.setItem(getStorageKey(slug), newValue);
      } else {
        localStorage.removeItem(getStorageKey(slug));
      }
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <div className="flex items-center gap-6 py-6 border-t border-b border-gray-100">
      <span className="text-sm text-text-muted">
        Cet article vous a plu ?
      </span>
      <div className="flex items-center gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.type}
            onClick={() => handleReaction(r.type)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
              selected === r.type
                ? "bg-primary/10 text-primary font-medium"
                : "bg-gray-50 text-text-muted hover:bg-gray-100"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {r.icon}
            </span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
