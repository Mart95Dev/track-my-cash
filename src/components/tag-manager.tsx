"use client";

import { useActionState, useRef, useEffect, useTransition } from "react";
import { createTagAction, deleteTagAction } from "@/app/actions/tag-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import type { Tag } from "@/app/actions/tag-actions";
import { useTranslations } from "next-intl";

export function TagManager({ tags }: { tags: Tag[] }) {
  const t = useTranslations("settings.tags");
  const formRef = useRef<HTMLFormElement>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      return await createTagAction(prev, formData);
    },
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(t("created"));
      formRef.current?.reset();
    } else if (state && "error" in state) {
      toast.error(String(state.error));
    }
  }, [state, t]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1 flex-1">
          <Label htmlFor="tag-name" className="text-xs">{t("name")}</Label>
          <Input id="tag-name" name="name" placeholder={t("namePlaceholder")} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tag-color" className="text-xs">{t("color")}</Label>
          <Input id="tag-color" name="color" type="color" defaultValue="#6b7280" className="w-16 h-9 p-1" />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? t("adding") : t("add")}
          </Button>
        </div>
      </form>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1">
              <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>
                {tag.name}
              </Badge>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground" disabled={deletePending}>
                    {t("delete")}
                  </Button>
                }
                title={t("deleteTitle")}
                description={t("deleteDesc", { name: tag.name })}
                onConfirm={() => {
                  startDeleteTransition(async () => {
                    await deleteTagAction(tag.id);
                    toast.success(t("deleted"));
                  });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
