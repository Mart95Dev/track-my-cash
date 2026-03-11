import { describe, it, expect } from "vitest";
import { organizationSchema } from "../../../src/lib/seo/schemas";

describe("Marketing Layout — Organization JSON-LD", () => {
  it("TU-1: organizationSchema retourne un objet avec @type Organization", () => {
    const schema = organizationSchema();
    expect(schema["@type"]).toBe("Organization");
  });

  it("TU-2: JSON parsé est valide avec @type Organization et name Koupli", () => {
    const schema = organizationSchema();
    const json = JSON.stringify(schema);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed["@type"]).toBe("Organization");
    expect(parsed.name).toBe("Koupli");
  });

  it("TU-3: Le logo est une URL absolue commençant par https://", () => {
    const schema = organizationSchema();
    const logo = schema.logo as string;
    expect(logo).toMatch(/^https:\/\//);
  });
});
