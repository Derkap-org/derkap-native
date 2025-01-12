module.exports = {
    root: true,
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ["@typescript-eslint", "react", "jsx-a11y", "import", "prettier"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "prettier",
    ],
    rules: {
      "prettier/prettier": ["error", { singleQuote: true, semi: false }],
      "@typescript-eslint/no-unused-vars": ["warn"],
      "react/react-in-jsx-scope": "off",
      "import/no-unresolved": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
  