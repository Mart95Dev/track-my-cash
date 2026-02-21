import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
      <div className="text-muted-foreground">{icon}</div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button asChild>
          <a href={action.href}>{action.label}</a>
        </Button>
      )}
    </div>
  );
}
