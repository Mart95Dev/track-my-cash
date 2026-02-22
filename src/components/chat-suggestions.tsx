"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || suggestions.length === 0) return null;

  const handleClick = (suggestion: string) => {
    setVisible(false);
    onSelect(suggestion);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {suggestions.map((suggestion) => (
        <Badge
          key={suggestion}
          variant="outline"
          className="cursor-pointer hover:bg-accent text-xs px-3 py-1.5 font-normal"
          onClick={() => handleClick(suggestion)}
        >
          {suggestion}
        </Badge>
      ))}
    </div>
  );
}
