import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "ul", "ol", "li", "a", "strong", "em", "br",
    "table", "thead", "tbody", "tr", "th", "td", "blockquote", "img", "code", "pre",
    "div", "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "loading"],
    div: ["class"],
    h2: ["id"],
    h3: ["id"],
  },
  allowedClasses: {
    div: ["callout", "callout-info", "callout-warning", "callout-tip"],
  },
  allowedSchemes: ["https"],
};

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
