module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    // "eslint:recommended",
    // "plugin:@typescript-eslint/eslint-recommended",
    // "plugin:@typescript-eslint/recommended",
    "airbnb",
    "airbnb-typescript/base",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  rules: {
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".ts"] }],
    "import/prefer-default-export": "off",
  },
  ignorePatterns: ["build/", "src/client/public", "**/*.config.js"],
};
