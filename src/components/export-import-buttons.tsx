"use client";

import { useRef, useTransition } from "react";
import { exportDataAction, importDataAction } from "@/app/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function ExportImportButtons() {
  const t = useTranslations("settings.backup");
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const data = await exportDataAction();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!confirm(t("confirmImport"))) return;

      startTransition(async () => {
        const result = await importDataAction(content);
        if ("error" in result) {
          alert(result.error);
        } else {
          alert(t("importSuccess"));
          window.location.reload();
        }
      });
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExport} disabled={isPending}>
        {t("export")}
      </Button>
      <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={isPending}>
        {t("import")}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
