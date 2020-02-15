/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */
"use strict";

var rule = require("../../../lib/rules/no-prepend"),

RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester({
    parserOptions: {
        // ecmaVersion: 6,
        // sourceType: 'module',
        // ecmaFeatures: {},
        preserveNodeMaps: true,
        tsconfigRootDir: './tests/fixture-project/',
        // project: './tsconfig.json',
    },
    parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run("no-prepend", rule, {

    valid: [
        `var e: Element = new Element();
         e.appendChild();
         `,
    ],

    invalid: [
        {
            code: `
              var e = new Element();
              e.prepend();
            `,
            errors: [{
                message: "IE11 does not have prepend()",
                type: "CallExpression"
            }]
        }
    ]
});
