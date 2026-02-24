"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { AccountForm } from "@/components/account-form";

export function AddAccountSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-soft hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Ajouter un compte"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-safe max-h-[90vh] overflow-y-auto">
        <SheetHeader className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-text-main text-lg font-bold">Ajouter un compte</SheetTitle>
            <SheetClose asChild>
              <button
                className="w-8 h-8 rounded-full bg-background-light flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="px-5 pb-6">
          <AccountForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
