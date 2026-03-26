import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";

export default tseslint.config(
  { ignores: ["*.js", "*.cjs", "dist/**", "web/**", "scripts/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: { jsx: true }
      },
    },
    plugins: {
      boundaries,
      "react-hooks": reactHooks,
      "react-native": reactNative,
    },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/features/*/domain/**/*" },
        { type: "application", pattern: "src/features/*/application/**/*" },
        { type: "infrastructure", pattern: "src/features/*/infrastructure/**/*" },
        { type: "presentation", pattern: "src/features/*/presentation/**/*" },
        { type: "shared", pattern: "src/shared/**/*" }
      ]
    },
    rules: {
      // Clean Architecture Boundaries
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
      ],
      
      // Frontend Architecture Red Flags 🛑
      "@typescript-eslint/no-explicit-any": "error", // Cấm sử dụng type any
      "no-console": ["error", { allow: ["warn", "error"] }], // Cấm vứt file console.log lên production
      
      // Nghiêm cấm Hardcode mã màu và Inline Styles ở giao diện UI
      "react-native/no-inline-styles": "error",
      "react-native/no-color-literals": "error",
      
      // Kiểm tra hiệu năng Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      
      // Ranh giới Giao tiếp Mạng & API
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "❌ [RED FLAG 2] Cấm gọi trần trụi axios trong UI Component. Bắt buộc gọi qua Lớp Infrastructure / Application."
            }
          ]
        }
      ]
    }
  }
);
