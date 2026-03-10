/**
 * Injecte des IDs dans les balises h2/h3 du contenu HTML pour les ancres TOC.
 * Les IDs sont générés à partir du texte du heading (slug normalisé).
 */
export function injectHeadingIds(html: string): string {
  return html.replace(
    /<(h[23])(\s[^>]*)?>(.*?)<\/\1>/gi,
    (_match, tag: string, attrs: string | undefined, content: string) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = generateHeadingId(text);
      const existingAttrs = attrs?.trim() ?? "";
      if (existingAttrs.includes("id=")) {
        return `<${tag}${attrs}>${content}</${tag}>`;
      }
      return `<${tag} id="${id}"${existingAttrs ? ` ${existingAttrs}` : ""}>${content}</${tag}>`;
    }
  );
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
