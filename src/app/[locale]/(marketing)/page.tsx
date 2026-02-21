import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PLANS } from "@/lib/stripe-plans";
import {
  Wallet,
  FileUp,
  RefreshCw,
  TrendingUp,
  Bot,
  Globe,
} from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("landing");

  const features = [
    { icon: Wallet, title: t("feature1Title"), description: t("feature1Desc") },
    { icon: FileUp, title: t("feature2Title"), description: t("feature2Desc") },
    { icon: RefreshCw, title: t("feature3Title"), description: t("feature3Desc") },
    { icon: TrendingUp, title: t("feature4Title"), description: t("feature4Desc") },
    { icon: Bot, title: t("feature5Title"), description: t("feature5Desc") },
    { icon: Globe, title: t("feature6Title"), description: t("feature6Desc") },
  ];

  const pricingCtas = {
    free: t("pricingCtaFree"),
    pro: t("pricingCtaPro"),
    premium: t("pricingCtaPremium"),
  };

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="bg-primary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/inscription">{t("heroCta")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tarifs">{t("heroCtaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("featuresTitle")}</h2>
            <p className="mt-4 text-muted-foreground">{t("featuresSubtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS COMPACTS */}
      <section className="bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("pricingTitle")}</h2>
            <p className="mt-4 text-muted-foreground">{t("pricingSubtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(["free", "pro", "premium"] as const).map((planId) => {
              const plan = PLANS[planId];
              const isHighlighted = planId === "pro";
              return (
                <Card
                  key={planId}
                  className={isHighlighted ? "border-primary shadow-lg" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-2 text-3xl font-bold">
                      {plan.price === 0 ? "0€" : `${plan.price.toString().replace(".", ",")}€`}
                      <span className="text-base font-normal text-muted-foreground">
                        {t("pricingPerMonth")}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {plan.features.slice(0, 3).map((f) => (
                        <li key={f} className="text-sm text-muted-foreground">
                          ✓ {f}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={isHighlighted ? "default" : "outline"}
                      className="w-full"
                      asChild
                    >
                      <Link href={planId === "free" ? "/inscription" : "/tarifs"}>
                        {pricingCtas[planId]}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("ctaTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("ctaSubtitle")}</p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/inscription">{t("ctaButton")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
