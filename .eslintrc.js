module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:no-unsanitized/DOM"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-prototype-builtins": "off",
  },
};
