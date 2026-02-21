import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: Props) {
  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" data-testid="feature-icon">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
