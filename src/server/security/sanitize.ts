// src/server/security/sanitize.ts — Input sanitisation for rich text & user input
import sanitizeHtml from "sanitize-html";

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "strike",
    "code",
    "hr",
    "br",
    "div",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => {
      // Force safe links: rel="noopener noreferrer" and target="_blank" on external URLs
      const href = attribs.href || "";
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          ...(isExternal ? { rel: "noopener noreferrer", target: "_blank" } : {}),
        },
      };
    },
  },
  disallowedTagsMode: "discard",
};

/**
 * Sanitizes rich text / markdown HTML input by stripping malicious scripts,
 * style injections, event handlers, and disallowed tags.
 */
export function sanitizeRichText(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty.trim(), RICH_TEXT_OPTIONS);
}

/**
 * Strips all HTML tags from a string completely, leaving only clean plain text.
 */
export function sanitizePlainText(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
}
