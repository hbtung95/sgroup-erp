import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
  {
    files: ["src/features/**/*.ts", "src/features/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/features/*/domain/**/*" },
        { type: "application", pattern: "src/features/*/application/**/*" },
        { type: "infrastructure", pattern: "src/features/*/infrastructure/**/*" },
        { type: "presentation", pattern: "src/features/*/presentation/**/*" }
      ]
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "domain",
              disallow: ["application", "infrastructure", "presentation"],
              message: "❌ [CLEAN ARCHITECTURE] Lớp Domain cốt lõi KHÔNG ĐƯỢC PHÉP import từ Application, Infrastructure hoặc Presentation."
            },
            {
              from: "application",
              disallow: ["infrastructure", "presentation"],
              message: "❌ [CLEAN ARCHITECTURE] Lớp Application (Use Cases, Hooks) KHÔNG ĐƯỢC PHÉP import trực tiếp từ Infrastructure hay Presentation."
            }
          ]
        }
      ]
    }
  }
);
