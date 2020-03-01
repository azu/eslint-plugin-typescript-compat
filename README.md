# eslint-plugin-typescript-compat-dom

- Lints the compatibilities between browsers DOM APIs.
- refers [mdn\-browser\-compat\-data](https://www.npmjs.com/package/mdn-browser-compat-data) and TypeScript Compiler API.
- inspired by [eslint\-plugin\-compat](https://www.npmjs.com/package/eslint-plugin-compat).
- This plugin is under development.

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
    "typescript-compat-dom": {
        "browserslist": ["ie 11"]
    }
  }
}
```


