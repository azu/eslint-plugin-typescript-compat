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
    - [x] Static method like `Array.from`
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
+    "parserOptions": {
+      "project": "./tsconfig.json"
+    },
     // ...
   }
```

Require [parserOptions.project](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#parseroptionsproject) setting for using type information.

Also, your `tsconfig.json` should define `lib` that you want to detect.
The default value of TypeScript's `lib` is `ES2015`(`ES6`). So, TypeScript checker does not recognize ES2016+ features by default.
 
> Note: If --lib is not specified a default list of libraries are injected. The default libraries injected are:
>
> ► For --target ES5: DOM,ES5,ScriptHost
>
> ► For --target ES6: DOM,ES6,DOM.Iterable,ScriptHost
>
> -- https://www.typescriptlang.org/docs/handbook/compiler-options.html

:memo: Internally note. TypeScript Checker return `intrinsicName: 'error',` or `intrinsicName: 'unknown'` for non-recognized type.

If you want to detect ES2016+ features like `Array.prototype.flag`, you need to set `"lib": ["ESNext"]`

```json5
{
    "compilerOptions": {
        // ...
        "lib": [
            "ESNext",
            "DOM"
        ]
    }
}

```

### 3. Add a target for browserlist

Browser targets are configured using [browserslist](https://github.com/browserslist/browserslist).

You can configure browser targets in your `package.json`.

For example, Your project need to support IE 11.

```diff
{
     // ...
+    "browserslist": [
+      "ie 11"
+    ]
}
```

For more details, see [browserslist](https://github.com/browserslist/browserslist).

## Example

When your browserlist configuration is:

```json5
     "browserslist": [
       "ie 11"
    ]
```

Following code includes `Array.prototype.includes`

```
const items = [1,2,3];
items.includes(2); 
```

This rule show following error.

> Array.included is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find"


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

MIT © azu

This ESLint plugin is based on these. 

- [TypeScript Compiler APIとmdn-browser-compat-dataとbrowserslistを使ってサポートされていない呼び出しを見つける - hitode909の日記](https://blog.sushi.money/entry/2020/03/01/173306)
- [hitode909/eslint-plugin-typescript-compat-dom: Uses mdn-browser-compat-data, browserslist, TypeScript Compiler API and lints compatibilities between browsers DOM APIs.](https://github.com/hitode909/eslint-plugin-typescript-compat-dom)


