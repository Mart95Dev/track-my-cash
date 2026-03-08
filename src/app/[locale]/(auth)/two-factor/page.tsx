"use client";

import { TwoFactorVerify } from "@/components/two-factor-verify";

export default function TwoFactorPage() {
  return (
    <div className="bg-background-light min-h-screen relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-couple-pink/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none" />

      <div className="min-h-screen flex items-center justify-center p-6">
        <TwoFactorVerify />
      </div>
    </div>
  );
}
