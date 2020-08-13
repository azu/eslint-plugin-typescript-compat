import { RuleTester } from "eslint";
import rule from "../../../lib/rules/compat-dom";

var ruleTester = new RuleTester({
    parserOptions: {
        preserveNodeMaps: true,
        tsconfigRootDir: "./tests/fixture-project/",
        project: "./tsconfig.json",
        createDefaultProgram: true,
        ecmaVersion: 2017,
        sourceType: "module"
    },
    ecmaFeatures: {
        modules: true
    },
    parser: require.resolve("@typescript-eslint/parser")
});

// @ts-expect-error
ruleTester.run("compat-dom", rule, {
    valid: [
        {
            code: `[].indexOf(0)`,
            options: [{ browserslist: ["ie 11"] }]
        },
        {
            code: `[].forEach(() => {})`,
            options: [{ browserslist: ["ie 11"] }]
        },
        {
            // Array#find like function
            code: `var obj = { find(cb){ return cb() }};\nobj.find(() => {});`,
            options: [{ browserslist: ["ie 11"] }]
        },
        // any type is just ignored
        {
            code: `const array = [] as any;\n array.includes(1);`,
            options: [{ browserslist: ["ie 11"] }]
        },
        {
            // IE has Map
            code: `new Map()`,
            options: [{ browserslist: ["ie 11"] }]
        },
        // Allow polyfill-ed
        {
            code: `Array.prototype.find = (cb) => { return cb() };
[].find(() => {});`,
            options: [{ browserslist: ["ie 11"] }]
        },
        // Allow declaration by user
        {
            code: `class Array { find(cb){ return cb(); } };
const array = new Array();
array.find(() => {});`,
            options: [{ browserslist: ["ie 11"] }]
        }
    ],
    invalid: [
        {
            // Array#find is not defined in IE11
            code: `[].find(() => {})`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.find is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Array#find is not defined in IE11
            code: `Array.from([])`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "ArrayConstructor.from is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/from",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // ReadonlyArray#find
            code: `const array = [] as const;
array.find(() => {})`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.find is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Object#entries is not defined in IE11
            code: `Object.entries([])`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "ObjectConstructor.entries is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/entries",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Array#includes is not defined in IE11
            code: `Object.keys({ key: "value" }).includes(1)`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.includes is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Map#keys is not supported in IE 11
            code: `const map = new Map(); console.log(map.keys());`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Map.keys is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/keys",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Nest object
            code: `
const obj = {
    a: {
        b: {
            items: []
        }
    }
};
obj.a.b.items.find(item => item === "name")
`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.find is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Class property and this
            code: `
class A {
    items: string[] = [];
    findItem = (name: string) => {
        return this.items.find(item => item === name);
    }    
}`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.find is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
                    type: "MemberExpression"
                }
            ]
        },
        {
            // Function Arguments
            code: `
// items is user defined variable
// <user-defined>.find 
function fn(items: string[]) {
    return items.find(item => item === "ok");
}`,
            options: [{ browserslist: ["ie 11"] }],
            errors: [
                {
                    message:
                        "Array.find is not supported in ie 11. https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
                    type: "MemberExpression"
                }
            ]
        }
    ]
});
