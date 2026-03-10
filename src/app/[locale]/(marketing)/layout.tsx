import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { organizationSchema } from "@/lib/seo/schemas";

type Props = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background marketing-light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema()),
        }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
