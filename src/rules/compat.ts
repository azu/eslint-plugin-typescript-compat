import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import CompatData from "@mdn/browser-compat-data";
import { BrowserName, SupportBlock } from "@mdn/browser-compat-data/types";
import browserslist from "browserslist";
import semver from "semver";
import ts from "typescript";
import EStree from "@typescript-eslint/typescript-estree";

const log = (...args: any[]) => {
    if (process.env.DEBUG !== "eslint-plugin-typescript-compat") {
        return;
    }
    console.log("[eslint-plugin-typescript-compat]", ...args);
};

function collectBaseClassNames(object: ts.Type): string[] {
    const names: string[] = [];
    const symbol = object.getSymbol();
    if (symbol) {
        names.push(symbol.getEscapedName().toString());
    }
    const baseTypes = object.getBaseTypes();
    //     const keys = [
    //         "getFlags",
    //         "getSymbol",
    //         "getProperties",
    //         "getProperty",
    //         "getApparentProperties",
    //         "getCallSignatures",
    //         "getConstructSignatures",
    //         "getStringIndexType",
    //         "getNumberIndexType",
    //         "getBaseTypes",
    //         "getNonNullableType",
    //         "getConstraint",
    //         "getDefault",
    //         "isUnion",
    //         "isIntersection",
    //         "isUnionOrIntersection",
    //         "isLiteral",
    //         "isStringLiteral",
    //         "isNumberLiteral",
    //         "isTypeParameter",
    //         "isClassOrInterface",
    //         "isClass",
    //     ]
    //     keys.forEach(key => {
    //         // @ts-ignore
    //         if (typeof object[key] === "function") {
    //             try {
    //                 // @ts-ignore
    //                 log(`object.${key}`, object[key]());
    //             } catch {
    //             }
    //         }
    //     })
    // }
    if (baseTypes) {
        for (const base of baseTypes) {
            names.push(...collectBaseClassNames(base));
        }
    }
    return names;
}

function isLibDomSymbol(symbol: ts.Symbol): Boolean {
    if (!symbol) return false;
    const decs = symbol.declarations;
    if (!decs) return false;
    // TODO: better detection
    return decs.every((dec) => dec.getSourceFile().fileName.match(/lib\.dom\.d\.ts/));
}

function isBrowserName(name: string): name is BrowserName {
    return CompatData.browsers.hasOwnProperty(name);
}

function toMdnName(name: string): string {
    const mapping: { [key: string]: string } = {
        and_chr: "chrome_android",
        and_ff: "firefox_android",
        samsung: "samsunginternet_android",
        op_mob: "opera_android",
        ios_saf: "safari_ios",
        android: "webview_android"
    } as const;
    const browserName = mapping[name] || name;
    return browserName;
}

function getNonSupportedBrowsers(support: SupportBlock, targetBrowsersList: string[]): { browserName: string }[] {
    const nonSupportResults: { browserName: string }[] = [];
    const normalizeSyntax = (v: string): string => {
        return v.replace("≤", "<=").replace("≧", ">=");
    };
    for (const browserAndVersion of targetBrowsersList) {
        const browser = toMdnName(browserAndVersion.split(" ")[0]);
        // 4.3.3-4.3.4 to 4.3.3
        const version = browserAndVersion.split(/[ -]/)[1] || "0";
        const browserSupport = support[browser as BrowserName];
        if (!isBrowserName(browser)) {
            // skip kaios, op_mini, baidu, and_qq, and_uc
            continue;
        }
        if (!browserSupport) {
            nonSupportResults.push({
                browserName: browserAndVersion
            });
            continue;
        }
        const browsers = Array.isArray(browserSupport) ? browserSupport : [browserSupport];
        for (const b of browsers) {
            const added = b.version_added;
            if (added === true) continue;
            if (added === false || added === null) {
                nonSupportResults.push({
                    browserName: browserAndVersion
                });
                continue;
            }
            try {
                const semAdded = semver.minVersion(normalizeSyntax(added));
                const semV = semver.minVersion(normalizeSyntax(version));
                if (semAdded && semV) {
                    if (semver.gt(semAdded, semV)) {
                        nonSupportResults.push({
                            browserName: browserAndVersion
                        });
                    }
                }
            } catch (error) {
                log("Parse Error", added, version);
            }
        }
    }
    return nonSupportResults;
}

const createPolyfillSets = (polyfills: string[]) => {
    const set = new Set<string>();
    polyfills.forEach((polyfillPattern) => {
        const parts = polyfillPattern.split(".");
        set.add(polyfillPattern);
        if (parts[0] && parts[1] === "prototype" && parts[2]) {
            // FIXME: support Array.find as Array.prototype.find
            set.add(`${parts[0]}.${parts[2]}`);
            // A.prototype.b to AConstructor.b
            set.add(`${parts[0]}Constructor.${parts[2]}`);
            // ReadonlyArray
            if (["Array", "Map", "Set"].includes(parts[0])) {
                set.add(`Readonly${parts[0]}.${parts[2]}`);
            }
        }
    });
    return set;
};
export type Options = [
    {
        browserslist: string | string[];
        polyfills: string[];
    }
];
const messages = {
    "compat-dom": "{{ name }} is not supported in {{ browser }}. {{ url }}"
};
export default ESLintUtils.RuleCreator((name) => "")<Options, keyof typeof messages>({
    name: "compat-dom",
    meta: {
        docs: {
            description: `Disable prepend()`,
            recommended: "error",
            requiresTypeChecking: true
        },
        messages: messages,
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    browserslist: {
                        anyOf: [
                            {
                                type: "array",
                                items: {
                                    type: "string"
                                }
                            },
                            { type: "string" }
                        ]
                    },
                    polyfills: {
                        type: "array",
                        items: [
                            {
                                type: "string"
                            }
                        ]
                    }
                }
            }
        ],
        type: "problem"
    },
    defaultOptions: [
        {
            browserslist: "defaults",
            polyfills: []
        }
    ],
    create(context, [options]) {
        const browserslistConfig =
            (context.settings.browserslist as undefined | string | string[]) ?? options.browserslist ?? "defaults";
        const targetBrowsersList = browserslist(browserslistConfig, { path: context.getFilename() });
        const ignorePolyfillSet = createPolyfillSets(
            (context.settings.polyfills as undefined | string[]) ?? options.polyfills ?? options
        );
        const IdentifierParentSet = new Set();
        const errors: { node: EStree.TSESTree.MemberExpression; messageId: "compat-dom"; data: any }[] = [];
        return {
            MemberExpression: (node) => {
                const checker = context.parserServices?.program?.getTypeChecker();
                if (!checker) return;
                const tsObject = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.object);
                log("tsObject", tsObject);
                if (!tsObject) {
                    log("Not found tsObject");
                    return;
                }
                const objectType = checker.getTypeAtLocation(tsObject);
                const tsProperty = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.property);
                log("tsProperty", tsProperty);
                if (!tsProperty) {
                    log("Not found tsProperty");
                    return;
                }
                const propertyType = checker.getTypeAtLocation(tsProperty);
                const propertySymbol = checker.getSymbolAtLocation(tsProperty);
                // if (!isLibDomSymbol(propertySymbol)) return;
                // intrinsicName:any has not symbol
                if (!propertySymbol) {
                    log("Not found propertySymbol", propertyType);
                    return;
                }
                const propertyName = propertySymbol.getName();
                // Support ReadOnlyArray
                // FIXME: Can not found ReadOnlyArray in `objectType`.
                // But, `propertySymbol.parent` is ReadOnlyArray type
                log("objectType", objectType);
                const propertyParentTypeName = (propertySymbol as any)?.parent?.escapedName.toString();
                const baseClassNames = new Set(
                    collectBaseClassNames(objectType).concat(propertyParentTypeName ? [propertyParentTypeName] : [])
                );
                log("baseClassNames", baseClassNames);
                for (const className of baseClassNames) {
                    const normalizeClassName = (className: string) => {
                        // e.g. ArrayConstructor
                        if (className.endsWith("Constructor")) {
                            return {
                                name: className.replace(/Constructor$/, ""),
                                rawName: className
                            };
                        }
                        // e.g. ReadonlyArray
                        if (className.startsWith("Readonly")) {
                            return {
                                name: className.replace(/^Readonly/, ""),
                                rawName: className
                            };
                        }
                        return {
                            name: className,
                            rawName: className
                        };
                    };
                    log("className", className);
                    const normalizedClass = normalizeClassName(className);
                    log("normalizedClass", normalizedClass);
                    const compatData = CompatData.javascript.builtins[normalizedClass.name];
                    if (!compatData) continue;
                    const compat = compatData[propertyName];
                    log("compat", compat);
                    if (!compat) continue;
                    const support = compat?.__compat?.support;
                    if (!support) continue;
                    // Support testing
                    const nonSupportedBrowsers = getNonSupportedBrowsers(support, targetBrowsersList);
                    if (nonSupportedBrowsers.length === 0) continue;

                    if (ignorePolyfillSet.has(`${normalizedClass.rawName}.${propertyName}`)) {
                        return; // skip it is polyfill-ed
                    }

                    errors.push({
                        node: node,
                        messageId: "compat-dom",
                        data: {
                            objectName: normalizedClass.rawName,
                            propertyName: propertyName,
                            name: `${normalizedClass.rawName}.${propertyName}`,
                            browser: nonSupportedBrowsers.map((browser) => browser.browserName).join(", "),
                            url: compat?.__compat?.mdn_url
                        }
                    });
                    return;
                }
            },
            Identifier: (node) => {
                if (node.parent) {
                    const { type } = node.parent;
                    if (
                        // type === "Property" || // ex. const { Set } = require('immutable');
                        type === "FunctionDeclaration" || // ex. function Set() {}
                        // type === "VariableDeclarator" || // ex. const Set = () => {}
                        type === "ClassDeclaration" || // ex. class Set {}
                        type === "ImportDefaultSpecifier" || // ex. import Set from 'set';
                        type === "ImportSpecifier" || // ex. import {Set} from 'set';
                        type === "ImportDeclaration" // ex. import {Set} from 'set';
                    ) {
                        IdentifierParentSet.add(node.name);
                    }
                }
                // const checker = context.parserServices?.program?.getTypeChecker();
                // if (!checker) return;
                // const tsObject = context.parserServices?.esTreeNodeToTSNodeMap?.get(node);
                // if (!tsObject) return;
                // const objectSymbol = checker.getSymbolAtLocation(tsObject);
                // if (!objectSymbol) return;
                //
                // // if (!isLibDomSymbol(objectSymbol)) return;
                // const name = objectSymbol.getEscapedName().toString();
                // const compat = CompatData.api[name];
                // log("compat", compat);
                // if (!compat) return;
                // const support = compat?.__compat?.support;
                // if (!support) return;
                // const nonSupportedBrowsers = getNonSupportedBrowsers(support, targetBrowsersList);
                // if (nonSupportedBrowsers.length === 0) return;
                //
                // context.report({
                //     node: node,
                //     messageId: "compat-dom",
                //     data: {
                //         name: `${name}`,
                //         browser: nonSupportedBrowsers.map(browser => browser.browserName).join(", "),
                //         url: compat?.__compat?.mdn_url
                //     }
                // });
                // return;
            },
            "Program:exit": () => {
                function getName(node: EStree.TSESTree.Node): string {
                    switch (node.type) {
                        case "NewExpression": {
                            // @ts-ignore
                            return node.callee.name;
                        }
                        case "MemberExpression": {
                            // @ts-ignore
                            return node.object.name;
                        }
                        case "ExpressionStatement": {
                            // @ts-ignore
                            return node.expression.name;
                        }
                        case "CallExpression": {
                            // @ts-ignore
                            return node.callee.name;
                        }
                        default:
                            throw new Error("not found");
                    }
                }

                log("IdentifierParentSet", ...IdentifierParentSet);
                log("Errors length", errors.length, "File", context.getFilename());
                errors
                    .filter((error) => {
                        return !IdentifierParentSet.has(error.data.objectName);
                    })
                    .forEach((error) => {
                        context.report({
                            node: error.node,
                            messageId: error.messageId,
                            data: error.data
                        });
                    });
            }
        };
    }
});
