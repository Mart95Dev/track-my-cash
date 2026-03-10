"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "tmc_cookie_consent";

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: false;
  timestamp: number;
};

function getHasConsent() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

const subscribe = () => () => {};

export function CookieBanner() {
  const hasConsent = useSyncExternalStore(subscribe, getHasConsent, () => true);
  const [visible, setVisible] = useState(!hasConsent);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const saveConsent = useCallback((analyticsValue: boolean) => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: analyticsValue,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  }, []);

  const acceptAll = () => saveConsent(true);
  const refuseAll = () => {
    setAnalytics(false);
    saveConsent(false);
  };
  const acceptSelected = () => saveConsent(analytics);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[rgba(28,25,23,0.95)] backdrop-blur-[20px]">
      <div className="max-w-5xl mx-auto px-6 py-6 md:px-8">
        {!showDetails ? (
          /* Simple view */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <p className="text-[15px] text-[#E7E5E4] leading-[1.7] flex-1 min-w-0">
              Nous utilisons des cookies pour faire fonctionner le site et
              analyser son utilisation de manière anonyme. Vous pouvez accepter,
              refuser ou personnaliser vos choix.{" "}
              <button
                onClick={() => setShowDetails(true)}
                className="text-primary-light font-medium underline cursor-pointer bg-transparent border-none p-0 inline"
              >
                En savoir plus
              </button>
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={refuseAll}
                className="bg-transparent text-[#A8A29E] border border-white/15 px-6 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer"
              >
                Tout refuser
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="bg-white/10 text-[#E7E5E4] border border-white/15 px-6 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer"
              >
                Personnaliser
              </button>
              <button
                onClick={acceptAll}
                className="bg-primary text-white border-none px-6 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer"
              >
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          /* Detailed view */
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white text-lg font-semibold">
                Paramètres des cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[#A8A29E] cursor-pointer text-sm bg-transparent border-none"
              >
                &larr; Retour
              </button>
            </div>

            {/* Necessary */}
            <div className="flex justify-between items-center py-4 border-b border-white/[0.08]">
              <div>
                <div className="text-white text-[15px] font-semibold mb-1">
                  Cookies nécessaires
                </div>
                <div className="text-[#A8A29E] text-[13px] leading-relaxed">
                  Indispensables au fonctionnement du site (session, sécurité).
                  Ne peuvent pas être désactivés.
                </div>
              </div>
              <div className="w-12 h-7 rounded-full bg-success flex items-center justify-end px-[3px] opacity-60 cursor-not-allowed shrink-0 ml-4">
                <div className="w-[22px] h-[22px] rounded-full bg-white" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex justify-between items-center py-4 border-b border-white/[0.08]">
              <div>
                <div className="text-white text-[15px] font-semibold mb-1">
                  Cookies d&apos;analyse
                </div>
                <div className="text-[#A8A29E] text-[13px] leading-relaxed">
                  Nous aident à comprendre comment le site est utilisé pour
                  l&apos;améliorer. Données anonymisées.
                </div>
              </div>
              <button
                onClick={() => setAnalytics(!analytics)}
                className={`w-12 h-7 rounded-full flex items-center px-[3px] cursor-pointer transition-all duration-200 shrink-0 ml-4 border-none ${
                  analytics
                    ? "bg-success justify-end"
                    : "bg-white/15 justify-start"
                }`}
              >
                <div className="w-[22px] h-[22px] rounded-full bg-white transition-all duration-200" />
              </button>
            </div>

            {/* Marketing (disabled) */}
            <div className="flex justify-between items-center py-4">
              <div>
                <div className="text-white text-[15px] font-semibold mb-1">
                  Cookies publicitaires
                </div>
                <div className="text-[#A8A29E] text-[13px] leading-relaxed">
                  Nous n&apos;utilisons aucun cookie publicitaire.
                </div>
              </div>
              <div className="w-12 h-7 rounded-full bg-white/[0.06] flex items-center justify-start px-[3px] opacity-40 cursor-not-allowed shrink-0 ml-4">
                <div className="w-[22px] h-[22px] rounded-full bg-white/50" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={refuseAll}
                className="bg-transparent text-[#A8A29E] border border-white/15 px-6 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer"
              >
                Tout refuser
              </button>
              <button
                onClick={acceptSelected}
                className="bg-primary text-white border-none px-6 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
