# eslint-plugin-sketch

sketch rule

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-sketch`:

```
$ npm install eslint-plugin-sketch --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-sketch` globally.

## Usage

Add `sketch` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "sketch"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "sketch/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





