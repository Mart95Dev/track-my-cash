import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscribeButton } from "@/components/subscribe-button";
import { getSession } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { Check, Minus } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs — TrackMyCash",
  description:
    "Découvrez nos plans gratuit, Pro et Premium. Commencez gratuitement, évoluez selon vos besoins.",
  openGraph: {
    title: "Tarifs — TrackMyCash",
    description:
      "Découvrez nos plans gratuit, Pro et Premium. Commencez gratuitement, évoluez selon vos besoins.",
    type: "website",
  },
};

// Tableau comparatif des fonctionnalités (AC-5)
const FEATURES = [
  { label: "Comptes bancaires",           free: "1",         pro: "∞",          premium: "∞" },
  { label: "Historique transactions",     free: "3 mois",    pro: "∞",          premium: "∞" },
  { label: "Import CSV",                  free: true,        pro: true,         premium: true },
  { label: "Import PDF / Excel",          free: false,       pro: true,         premium: true },
  { label: "Catégorisation auto (IA)",    free: false,       pro: true,         premium: true },
  { label: "Export CSV",                  free: false,       pro: true,         premium: true },
  { label: "Export PDF mensuel",          free: false,       pro: true,         premium: true },
  { label: "Conseiller IA",              free: false,       pro: "10/mois",    premium: "Illimité" },
  { label: "IA multi-modèles (consensus)",free: false,       pro: false,        premium: true },
  { label: "Notifications email",         free: false,       pro: true,         premium: true },
  { label: "Objectifs d'épargne",         free: false,       pro: true,         premium: true },
  { label: "Support prioritaire",         free: false,       pro: false,        premium: true },
] as const;

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-green-600" aria-label="Inclus" />;
  }
  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Non inclus" />;
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default async function TarifsPage() {
  const t = await getTranslations("auth");

  const session = await getSession();
  const currentPlanId = session ? await getUserPlanId(session.user.id) : null;

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

      {/* Cartes plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.planId;
          return (
            <Card key={plan.name} className={plan.name === "Pro" ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Plan actuel
                    </span>
                  )}
                </div>
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
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : plan.isPaid ? (
                  <SubscribeButton planId={plan.planId} label={plan.cta} />
                ) : (
                  <Link href="/inscription">
                    <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AC-5 : Tableau comparatif détaillé */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Comparatif détaillé</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[45%]">Fonctionnalité</TableHead>
                <TableHead className="text-center">Gratuit</TableHead>
                <TableHead className="text-center font-semibold text-primary">Pro</TableHead>
                <TableHead className="text-center">Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURES.map((feature) => (
                <TableRow key={feature.label}>
                  <TableCell className="font-medium text-sm">{feature.label}</TableCell>
                  <TableCell className="text-center">
                    <FeatureCell value={feature.free} />
                  </TableCell>
                  <TableCell className="text-center">
                    <FeatureCell value={feature.pro} />
                  </TableCell>
                  <TableCell className="text-center">
                    <FeatureCell value={feature.premium} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* AC-6 : Boutons d'action vers Stripe checkout */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-6 text-center space-y-3">
          <p className="font-semibold text-lg">Pro — 4,90€/mois</p>
          <p className="text-sm text-muted-foreground">Idéal pour gérer vos finances au quotidien</p>
          {currentPlanId === "pro" ? (
            <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
          ) : (
            <SubscribeButton planId="pro" label="Choisir Pro" />
          )}
        </div>
        <div className="border rounded-lg p-6 text-center space-y-3">
          <p className="font-semibold text-lg">Premium — 7,90€/mois</p>
          <p className="text-sm text-muted-foreground">Pour une analyse financière avancée avec l&apos;IA</p>
          {currentPlanId === "premium" ? (
            <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
          ) : (
            <SubscribeButton planId="premium" label="Choisir Premium" />
          )}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        <Link href="/connexion" className="text-primary hover:underline">{t("signInLink")}</Link>
      </p>
    </div>
  );
}
