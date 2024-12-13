// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": ["warn"],
  },
  ignorePatterns: ["/dist/*"],
};
