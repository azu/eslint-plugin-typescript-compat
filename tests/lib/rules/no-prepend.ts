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
                message: "prepend is not supported in ie 11",
                type: "MemberExpression"
            }],
            options: [ { browserslist: ['ie 11']} ],
        },
        {
            code: `const p = (e: Element) => { e.prepend };`,
            errors: [{
                message: "prepend is not supported in ie 11",
                type: "MemberExpression"
            }],
            options: [ { browserslist: ['ie 11']} ],
        },
        {
            code: `document.querySelector('div').prepend();`,
            errors: [{
                message: "prepend is not supported in ie 11",
                type: "MemberExpression"
            }],
            options: [ { browserslist: ['ie 11']} ],
        },
        {
            code: `document.querySelector('div');`,
            errors: [{
                message: "querySelector is not supported in ie 6",
                type: "MemberExpression"
            }],
            options: [ { browserslist: ['ie 6']} ],
        },
    ]
});
