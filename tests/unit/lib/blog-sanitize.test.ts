import { describe, it, expect } from "vitest";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";

describe("sanitizeBlogHtml (STORY-154 — AC-154-7)", () => {
  // ── TU-154-4 : retire les balises dangereuses ──────────────────────────

  it("TU-154-4a : retire les balises <script>", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
    expect(clean).toContain("<p>Hello</p>");
    expect(clean).toContain("<p>World</p>");
  });

  it("TU-154-4b : retire les attributs onerror", () => {
    const dirty = '<img src="x" onerror="alert(1)" alt="test">';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("onerror");
  });

  it("TU-154-4c : retire les balises <iframe>", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><p>Safe</p>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("<p>Safe</p>");
  });

  it("TU-154-4d : retire les attributs onclick", () => {
    const dirty = '<p onclick="alert(1)">Click me</p>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("onclick");
    expect(clean).toContain("<p>Click me</p>");
  });

  it("TU-154-4e : retire les href javascript:", () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("javascript:");
  });

  // ── TU-154-5 : preserve les balises autorisées ────────────────────────

  it("TU-154-5a : preserve p, h2, h3, strong, em", () => {
    const html = "<h2>Title</h2><h3>Sub</h3><p><strong>Bold</strong> and <em>italic</em></p>";
    const clean = sanitizeBlogHtml(html);
    expect(clean).toBe(html);
  });

  it("TU-154-5b : preserve ul, ol, li", () => {
    const html = "<ul><li>Item 1</li><li>Item 2</li></ul><ol><li>First</li></ol>";
    const clean = sanitizeBlogHtml(html);
    expect(clean).toBe(html);
  });

  it("TU-154-5c : preserve a avec href https", () => {
    const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>';
    const clean = sanitizeBlogHtml(html);
    expect(clean).toContain('href="https://example.com"');
    expect(clean).toContain('target="_blank"');
  });

  it("TU-154-5d : preserve table, thead, tbody, tr, th, td", () => {
    const html = "<table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>Val</td></tr></tbody></table>";
    const clean = sanitizeBlogHtml(html);
    expect(clean).toBe(html);
  });

  it("TU-154-5e : preserve blockquote, code, pre", () => {
    const html = "<blockquote><p>Quote</p></blockquote><pre><code>const x = 1;</code></pre>";
    const clean = sanitizeBlogHtml(html);
    expect(clean).toBe(html);
  });

  it("TU-154-5f : preserve img avec src https et alt", () => {
    const html = '<img src="https://cdn.example.com/photo.jpg" alt="Photo" loading="lazy" />';
    const clean = sanitizeBlogHtml(html);
    expect(clean).toContain('src="https://cdn.example.com/photo.jpg"');
    expect(clean).toContain('alt="Photo"');
  });

  it("TU-154-5g : retire img avec src http (non-https)", () => {
    const dirty = '<img src="http://insecure.com/photo.jpg" alt="Photo">';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("http://insecure.com");
  });

  it("preserve br et h4", () => {
    const html = "<h4>Subtitle</h4><p>Line 1<br />Line 2</p>";
    const clean = sanitizeBlogHtml(html);
    expect(clean).toContain("<h4>");
    expect(clean).toContain("<br />");
  });

  it("retourne une chaîne vide pour un input vide", () => {
    expect(sanitizeBlogHtml("")).toBe("");
  });

  // ── QA-154 : edge cases sécurité supplémentaires ──────────────────────

  it("QA-154-8 : retire les img avec data-URI (XSS via SVG)", () => {
    const dirty = '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj4=" alt="xss">';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("data:");
  });

  it("QA-154-9 : retire les balises <style>", () => {
    const dirty = "<style>body { display: none; }</style><p>Content</p>";
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("<style");
    expect(clean).toContain("<p>Content</p>");
  });

  it("QA-154-10 : retire les balises <form>", () => {
    const dirty = '<form action="https://evil.com"><input type="text"><button>Submit</button></form>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("<form");
    expect(clean).not.toContain("<input");
    expect(clean).not.toContain("<button");
  });

  it("QA-154-11 : retire les balises <object> et <embed>", () => {
    const dirty = '<object data="evil.swf"></object><embed src="evil.swf">';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("<object");
    expect(clean).not.toContain("<embed");
  });

  it("QA-154-12 : preserve le contenu texte des balises retirées", () => {
    const dirty = "<div><span>Preserved text</span></div>";
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toContain("Preserved text");
  });
});
