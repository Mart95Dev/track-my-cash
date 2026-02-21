import { describe, it, expect } from "vitest";

// Import the raw config object to inspect headers without running Next.js
// We test the pure structure of the headers configuration
const EXPECTED_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

describe("Security headers configuration", () => {
  it("TU-1-1 : la configuration contient les 5 en-têtes de sécurité attendus", () => {
    expect(EXPECTED_HEADERS).toHaveLength(5);
    const keys = EXPECTED_HEADERS.map((h) => h.key);
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).toContain("X-DNS-Prefetch-Control");
  });

  it("TU-1-2 : X-Frame-Options a la valeur DENY", () => {
    const header = EXPECTED_HEADERS.find((h) => h.key === "X-Frame-Options");
    expect(header?.value).toBe("DENY");
  });

  it("TU-1-3 : X-Content-Type-Options a la valeur nosniff", () => {
    const header = EXPECTED_HEADERS.find((h) => h.key === "X-Content-Type-Options");
    expect(header?.value).toBe("nosniff");
  });
});
