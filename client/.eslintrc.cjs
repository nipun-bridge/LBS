module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  plugins: ["react-hooks", "react-refresh"],
  extends: ["eslint:recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
  },
  ignorePatterns: ["dist"]
};

