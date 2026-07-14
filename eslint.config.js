module.exports = [
  {
    ignores: ["node_modules/**", "dist/**", ".env", "coverage/**", "src/**/*.ts", "src/**/*.tsx"],
  },
  {
    files: ["src/**/*.js", "src/**/*.jsx"],
    rules: {
      "no-console": "off",
    },
  },
];
