"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencieux
    }
  }

  const links = [
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: "share",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: "work",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-text-muted hover:bg-primary/10 hover:text-primary transition-colors"
          title={`Partager sur ${link.name}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {link.icon}
          </span>
        </a>
      ))}
      <button
        onClick={copyLink}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-text-muted hover:bg-primary/10 hover:text-primary transition-colors"
        title="Copier le lien"
      >
        <span className="material-symbols-outlined text-[18px]">
          {copied ? "check" : "link"}
        </span>
      </button>
    </div>
  );
}
