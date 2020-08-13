# eslint-plugin-typescript-compat

ESLint rule for browser compatibility of your TypeScript code.

- Lints the compatibilities between ECMAScript API.
    - [ ] DOM API is not support yet
- Refers [mdn\-browser\-compat\-data](https://www.npmjs.com/package/mdn-browser-compat-data), TypeScript Compiler API, and browserslist.
- Inspired by [eslint\-plugin\-compat](https://www.npmjs.com/package/eslint-plugin-compat) and [eslint-plugin-typescript-compat-dom](https://github.com/hitode909/eslint-plugin-typescript-compat-dom)
  - `eslint-plugin-compat` aims to JavaScript, while this plugin aims to TypeScript.

## Installation

```
$ npm install eslint eslint typescript @typescript-eslint/parser --save-dev
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

This ESLint plugin is based on these. 

- [TypeScript Compiler APIとmdn-browser-compat-dataとbrowserslistを使ってサポートされていない呼び出しを見つける - hitode909の日記](https://blog.sushi.money/entry/2020/03/01/173306)
- [hitode909/eslint-plugin-typescript-compat-dom: Uses mdn-browser-compat-data, browserslist, TypeScript Compiler API and lints compatibilities between browsers DOM APIs.](https://github.com/hitode909/eslint-plugin-typescript-compat-dom)


