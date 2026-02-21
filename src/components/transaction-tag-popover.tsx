"use client";

import { useState, useTransition } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/app/actions/tag-actions";
import { setTransactionTagsAction } from "@/app/actions/tag-actions";

interface TransactionTagPopoverProps {
  transactionId: number;
  allTags: Tag[];
  initialTagIds: number[];
}

export function TransactionTagPopover({ transactionId, allTags, initialTagIds }: TransactionTagPopoverProps) {
  const [selected, setSelected] = useState<number[]>(initialTagIds);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedTags = allTags.filter((t) => selected.includes(t.id));

  function toggle(tagId: number) {
    const next = selected.includes(tagId) ? selected.filter((id) => id !== tagId) : [...selected, tagId];
    setSelected(next);
    startTransition(() => {
      setTransactionTagsAction(transactionId, next);
    });
  }

  if (allTags.length === 0) {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-muted-foreground">Créez des tags dans Paramètres</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color, color: "#fff" }}
          className="text-xs px-1.5 py-0.5 cursor-pointer"
          onClick={() => toggle(tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground" disabled={isPending}>
            +
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggle(tag.id)}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-left">{tag.name}</span>
                {selected.includes(tag.id) && <span className="text-xs text-muted-foreground">✓</span>}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
