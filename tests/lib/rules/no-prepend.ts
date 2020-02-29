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
        `e.prepend();`,
        `e.appendChild();`,
         `class A { prepend() {} }; new A().prepend();`,
         `namespace Foo { class Element { }; new Element().prepend(); }`,
    ],

    invalid: [
        {
            code: `const p = (e: Element) => { e.prepend() };`,
            errors: [{
                messageId: "no-prepend",
                type: "MemberExpression"
            }]
        },
        {
            code: `const p = (e: Element) => { e.prepend };`,
            errors: [{
                messageId: "no-prepend",
                type: "MemberExpression"
            }]
        },
        {
            code: `document.querySelector('div').prepend();`,
            errors: [{
                messageId: "no-prepend",
                type: "MemberExpression"
            }],
        },
        {
            code: `document.querySelector('div');`,
            errors: [{
                messageId: "no-prepend",
                type: "MemberExpression"
            }],
            options: [ { browserslist: ['ie 6']} ],
        },
    ]
});
