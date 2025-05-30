import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/*.generated.*",
      "**/*.min.js",
      "**/*.bundle.js",
      "**/node_modules/.prisma/**",
      "**/app/generated/prisma/**",
      "**/generated/prisma/**",
      "**/.eslintcache",
      "**/.cache/**",
      "**/.env*",
      "!**/.env.example",
      "**/*.d.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/coverage/**"
    ]
  }
];

export default eslintConfig;
