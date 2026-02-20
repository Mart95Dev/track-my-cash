import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscribe-button";

export default async function TarifsPage() {
  const t = await getTranslations("auth");

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      features: ["2 comptes bancaires", "Import CSV", "Transactions illimitées"],
      cta: "Commencer gratuitement",
      planId: "free",
      variant: "outline" as const,
      isPaid: false,
    },
    {
      name: "Pro",
      price: "4,90€",
      period: "/mois",
      features: ["5 comptes bancaires", "Toutes les banques (PDF, Excel)", "Conseiller IA", "Multi-devises"],
      cta: "S'abonner Pro",
      planId: "pro",
      variant: "default" as const,
      isPaid: true,
    },
    {
      name: "Premium",
      price: "7,90€",
      period: "/mois",
      features: ["Comptes illimités", "Toutes les banques", "Conseiller IA prioritaire", "Export avancé", "Support prioritaire"],
      cta: "S'abonner Premium",
      planId: "premium",
      variant: "outline" as const,
      isPaid: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h1>
        <p className="text-lg text-muted-foreground">Commencez gratuitement, évoluez selon vos besoins.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === "Pro" ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}<span className="text-base font-normal text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription>
                <ul className="space-y-1 mt-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm">✓ {f}</li>
                  ))}
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan.isPaid ? (
                <SubscribeButton planId={plan.planId} label={plan.cta} />
              ) : (
                <Link href="/inscription">
                  <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        <Link href="/connexion" className="text-primary hover:underline">{t("signInLink")}</Link>
      </p>
    </div>
  );
}
