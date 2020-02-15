/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */
"use strict";

var rule = require("../../../lib/rules/no-prepend"),

RuleTester = require("eslint").RuleTester;

var ruleTester = new RuleTester({
    parserOptions: {
        preserveNodeMaps: true,
        tsconfigRootDir: './tests/fixture-project/',
        project: './tsconfig.json',
        createDefaultProgram: true,
    },

    parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run("no-prepend", rule, {

    valid: [
        `const p = (e: Array) => { e.prepend() };`,
        `var e: Element = new Element();
         e.appendChild();
         `,
    ],

    invalid: [
        {
            code: `const p = (e: Element) => { e.prepend() };`,
            errors: [{
                message: "IE11 does not have prepend()",
                type: "CallExpression"
            }]
        },
        {
            code: `
              document.querySelector('div').prepend();
            `,
            errors: [{
                message: "IE11 does not have prepend()",
                type: "CallExpression"
            }]
        }
    ]
});
