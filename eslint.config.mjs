import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FORBIDDEN_TW_PALETTE =
  /\b(slate|gray|zinc|cyan|blue|purple|pink|indigo|emerald|green|amber|red|rose|orange|yellow|lime|teal|sky|violet|fuchsia|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)\b/;

const FORBIDDEN_ARBITRARY_COLOR =
  /\b[a-z-]+-\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\([^\]]+\))\]/;

const FORBIDDEN_LEGACY_TOKENS =
  /\b(bg|text|border|ring|divide|from|to|via|placeholder)-(brand|surface)-\w+|\b(bg|text|border|ring|divide|from|to|via|placeholder)-accent-(?!text\b)\w+/;

const noForbiddenColorsRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow forbidden Tailwind palette color utilities, arbitrary color values, and legacy classes in favor of semantic tokens.",
    },
    messages: {
      forbiddenPalette:
        "Forbidden Tailwind palette utility '{{match}}'. Use semantic tokens (primary, muted, card, destructive, success, warning, etc.) instead.",
      arbitraryColor:
        "Arbitrary color utility '{{match}}' is forbidden. Use design system semantic tokens instead.",
      legacyToken:
        "Legacy token utility '{{match}}' is forbidden. Use semantic tokens instead.",
    },
    schema: [],
  },
  create(context) {
    function checkString(str, node) {
      if (!str || typeof str !== "string") return;

      const paletteMatch = str.match(FORBIDDEN_TW_PALETTE);
      if (paletteMatch) {
        context.report({
          node,
          messageId: "forbiddenPalette",
          data: { match: paletteMatch[0] },
        });
      }

      const arbitraryMatch = str.match(FORBIDDEN_ARBITRARY_COLOR);
      if (arbitraryMatch) {
        context.report({
          node,
          messageId: "arbitraryColor",
          data: { match: arbitraryMatch[0] },
        });
      }

      const legacyMatch = str.match(FORBIDDEN_LEGACY_TOKENS);
      if (legacyMatch) {
        context.report({
          node,
          messageId: "legacyToken",
          data: { match: legacyMatch[0] },
        });
      }
    }

    function checkNode(node) {
      if (!node) return;
      if (node.type === "Literal" && typeof node.value === "string") {
        checkString(node.value, node);
      } else if (node.type === "TemplateLiteral") {
        for (const quasi of node.quasis) {
          checkString(quasi.value.raw, quasi);
        }
      }
    }

    function walkExpression(expr) {
      const stack = [expr];
      while (stack.length > 0) {
        const curr = stack.pop();
        if (!curr) continue;
        checkNode(curr);
        if (curr.type === "ConditionalExpression") {
          stack.push(curr.consequent, curr.alternate);
        } else if (curr.type === "LogicalExpression" || curr.type === "BinaryExpression") {
          stack.push(curr.left, curr.right);
        } else if (curr.type === "CallExpression") {
          stack.push(...curr.arguments);
        } else if (curr.type === "TemplateLiteral") {
          stack.push(...curr.expressions);
        } else if (curr.type === "ArrayExpression") {
          stack.push(...curr.elements);
        } else if (curr.type === "ObjectExpression") {
          for (const prop of curr.properties) {
            if (prop.type === "Property") {
              stack.push(prop.key, prop.value);
            }
          }
        }
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        if (!node.value) return;

        if (node.value.type === "Literal") {
          checkNode(node.value);
        } else if (node.value.type === "JSXExpressionContainer") {
          walkExpression(node.value.expression);
        }
      },
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === "Identifier" &&
          (node.callee.name === "cn" || node.callee.name === "cva")
        ) {
          for (const arg of node.arguments) {
            walkExpression(arg);
          }
        }
      },
    };
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/auth/GoogleIcon.tsx",
      "src/app/gallery/[albumId]/opengraph-image.tsx",
      "src/components/admin/certificates/CertificateDesignerCanvas.tsx",
      "src/server/**",
      "src/app/api/**",
    ],
    plugins: {
      "kailshiansx-design": {
        rules: {
          "no-forbidden-colors": noForbiddenColorsRule,
        },
      },
    },
    rules: {
      "kailshiansx-design/no-forbidden-colors": "error",
    },
  },
]);

export default eslintConfig;
