# eslint-plugin-typescript-compat [![Actions Status: test](https://github.com/azu/eslint-plugin-typescript-compat/workflows/test/badge.svg)](https://github.com/azu/eslint-plugin-typescript-compat/actions?query=workflow%3A"test")

ESLint rule for browser compatibility of your TypeScript code.

- Lints the compatibilities between ECMAScript API.
    - [ ] DOM API is not support yet
- Refers [mdn-browser-compat-data](https://www.npmjs.com/package/mdn-browser-compat-data), TypeScript Compiler API, and browserslist.
- Inspired by [eslint-plugin-compat](https://www.npmjs.com/package/eslint-plugin-compat) and [eslint-plugin-typescript-compat-dom](https://github.com/hitode909/eslint-plugin-typescript-compat-dom)
    - [eslint-plugin-compat](https://www.npmjs.com/package/eslint-plugin-compat) aims to JavaScript, while this plugin aims to TypeScript.
    - [eslint-plugin-es](https://github.com/mysticatea/eslint-plugin-es) disallow to use ECMAScript syntax, but it does not support method like `Array.prototype.includes`

## Supports

- [ ] JavaScript Built-in Object
    - [x] Prototype method like `Array.prototype.find`
    - [ ] Object like `Promise`
- [ ] DOM API

## Installation

### 1. Install

You need to install TypeScript and [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser)

```
$ npm install eslint-plugin-typescript-compat typescript @typescript-eslint/parser --save-dev
```

### 2. Update ESLint Config

`.eslintrc.json`:

```diff
   {
+    "extends": ["plugin:typescript-compat/recommended"],
+    "env": {
+      "browser": true
+    },
     // ...
   }
```

### 3. Add a target for browserlist

Browser targets are configured using [browserslist](https://github.com/browserslist/browserslist).

You can configure browser targets in your `package.json`.

Example) Your project need to support IE 11.

```diff
{
     // ...
+    "browserslist": [
+      "ie 11"
+    ]
}
```

For more details, see [browserslist](https://github.com/browserslist/browserslist).

## Options

### Adding Polyfills

Add polyfills to the `settings` section of your eslint config.


```jso5
{
  // ...
  "settings": {
    "polyfills": [
      // Example of instance method, must add `.prototype.`
      "Array.prototype.find"
    ]
  }
}
```

## LICENCE

MIT

This ESLint plugin is based on these. 

- [TypeScript Compiler APIとmdn-browser-compat-dataとbrowserslistを使ってサポートされていない呼び出しを見つける - hitode909の日記](https://blog.sushi.money/entry/2020/03/01/173306)
- [hitode909/eslint-plugin-typescript-compat-dom: Uses mdn-browser-compat-data, browserslist, TypeScript Compiler API and lints compatibilities between browsers DOM APIs.](https://github.com/hitode909/eslint-plugin-typescript-compat-dom)


