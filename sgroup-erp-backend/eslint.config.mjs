import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
  {
    files: ["src/modules/**/*.ts"],
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
        { type: "domain", pattern: "src/modules/*/domain/**/*" },
        { type: "application", pattern: "src/modules/*/application/**/*" },
        { type: "infrastructure", pattern: "src/modules/*/infrastructure/**/*" },
        { type: "presentation", pattern: "src/modules/*/presentation/**/*" }
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
              message: "❌ [CLEAN ARCHITECTURE] Lớp Application (Use Cases) KHÔNG ĐƯỢC PHÉP import trực tiếp từ Infrastructure hay Presentation."
            }
          ]
        }
      ]
    }
  }
);
