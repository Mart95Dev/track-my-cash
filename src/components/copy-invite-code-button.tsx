"use client";

import { useState } from "react";

interface CopyInviteCodeButtonProps {
  inviteCode: string;
}

export function CopyInviteCodeButton({ inviteCode }: CopyInviteCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
      type="button"
    >
      <span className="material-symbols-outlined text-[16px]">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copié !" : "Copier"}
    </button>
  );
}
