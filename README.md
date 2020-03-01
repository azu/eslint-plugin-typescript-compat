# eslint-plugin-typescript-compat-dom

- Lints the compatibilities between browsers DOM APIs.
- refers [mdn\-browser\-compat\-data](https://www.npmjs.com/package/mdn-browser-compat-data), TypeScript Compiler API, and browserslist.
- inspired by [eslint\-plugin\-compat](https://www.npmjs.com/package/eslint-plugin-compat).
  - eslint-plugin-compat aims to JavaScript, while this plugin aims to TypeScript.
- <b>This plugin is under development. DO NOT USE IN YOUR PRODUCTION.</b>

<img width="1385" alt="screenshot" src="https://user-images.githubusercontent.com/18360/75621805-a78a1a80-5bdc-11ea-930c-8087fa7a9479.png">

## Installation

```
$ npm i eslint eslint typescript @typescript-eslint/parser --save-dev
```

## Usage

Specify the parser in you .eslintrc.

```json
{
  "parser": "@typescript-eslint/parser"
}
```

Set plugins and rules.

```json
{
  "plugins": ["typescript-compat-dom"],

  "rules": {
    "typescript-compat-dom/compat-dom": ["error", {
        "browserslist": ["ie 11"]
    }]
  }
}
```

## LICENCE

MIT


