import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import CompatData from 'mdn-browser-compat-data';
import { SupportBlock } from 'mdn-browser-compat-data/types';
import browserslist from 'browserslist';
import ts from 'typescript';

function collectBaseSymbols(t: ts.BaseType): ts.Symbol[] {
    const symbols: ts.Symbol[] = [];
    symbols.push(t.symbol);
    const baseTypes = t.getBaseTypes();
    if (baseTypes) for (const base of baseTypes) {
        symbols.push(...collectBaseSymbols(base));
    }
    return symbols;
}

function isLibDomSymbol(symbol: ts.Symbol): Boolean {
    if (!symbol) return false;
    const decs = symbol.declarations;
    // TODO: better detection
    return decs.every(dec => dec.getSourceFile().fileName.match(/lib\.dom\.d\.ts/));
}

function toMdnName(name: string): string {
    const mapping: { [key: string]: string } = {
        and_chr: 'chrome_android',
        and_ff: 'firefox_android',
        samsung: 'samsunginternet_android',
        op_mob: 'opera_android',
        ios_saf: 'safari_ios',
        android: 'chrome_android',
    };
    return mapping[name] || name;
}

function isSupported(support: SupportBlock, targetBrowsersList: string[]): [Boolean, string?] {
    //if (!support) return [false, undefined];
    for (const browserAndVersion of targetBrowsersList) {
        const browser = toMdnName(browserAndVersion.split(' ')[0]);
        // extract 13.0 from 'ios_saf 13.0-13.1'
        const version = Number(browserAndVersion.split(/[ -]/)[1]) || 0;
        const browserSupport = support[browser];
        if (!browserSupport) {
            // skip kaios, op_mini, baidu, and_qq, and_uc
            continue;
        }
        if (!browserSupport) return [false, browserAndVersion];
        const browsers = Array.isArray(browserSupport) ? browserSupport : [browserSupport];
        for (const b of browsers) {
            const added = b.version_added;
            if (added === false) return [false, browserAndVersion];
            if (Number(added) > version) return [false, browserAndVersion];
        }
    }
    return [true, undefined];
}

export = ESLintUtils.RuleCreator(name => '')({
    name: "compat-dom",
    meta: {
        docs: {
            description: `Disable prepend()`,
            category: "Possible Errors",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            'compat-dom': "{{ method }} is not supported in {{ browser }}"
        },
        schema: [
            {
                type: 'object',
                // additionalProperties: false,
                properties: {
                    browserslist: {
                        anyOf: [
                            {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                            },
                            { type: 'string' }
                        ]
                    },
                },
            },
        ],
        type: "problem",
    },
    defaultOptions: [
        {
            browserslist: "defaults",
        },
    ],
    create(context, [options]) {
        const browserslistConfig = options.browserslist || 'defaults';
        const targetBrowsersList = browserslist(browserslistConfig, { path: context.getFilename() });
        return {
            'MemberExpression': (node) => {
                const checker = context.parserServices?.program?.getTypeChecker();
                if (!checker) return;
                const tsObject = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.object);
                if (!tsObject) return;
                const objectType = checker.getTypeAtLocation(tsObject);

                const tsProperty = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.property);
                if (!tsProperty) return;
                const propertyType = checker.getTypeAtLocation(tsProperty);
                const propertySymbol = propertyType.symbol;
                if (!isLibDomSymbol(propertySymbol)) return;

                const name = propertySymbol.getName();

                for (const objectSymbol of collectBaseSymbols(objectType).filter(isLibDomSymbol)) {
                    const className = objectSymbol.getEscapedName().toString();
                    const compats = CompatData.api[className];
                    if (!compats) continue;
                    const compat = compats[name];
                    if (!compat) continue;
                    const support = compat?.__compat?.support;
                    if (!support) continue;
                    const supportedAndBrokenBrowser = isSupported(support, targetBrowsersList);
                    if (supportedAndBrokenBrowser[0]) continue;

                    context.report({
                        node: node,
                        messageId: "compat-dom",
                        data: {
                            method: name,
                            browser: supportedAndBrokenBrowser[1],
                        }
                    });
                    return;
                }
            },
            'Identifier': (node) => {
                const checker = context.parserServices?.program?.getTypeChecker();
                if (!checker) return;
                const tsObject = context.parserServices?.esTreeNodeToTSNodeMap?.get(node);
                if (!tsObject) return;
                const objectSymbol = checker.getSymbolAtLocation(tsObject);
                if (!objectSymbol) return;

                if (!isLibDomSymbol(objectSymbol)) return;
                const name = objectSymbol.getEscapedName().toString();
                const compat = CompatData.api[name];
                if (!compat) return;
                const support = compat?.__compat?.support;
                if (!support) return;
                const supportedAndBrokenBrowser = isSupported(support, targetBrowsersList);
                if (supportedAndBrokenBrowser[0]) return;

                context.report({
                    node: node,
                    messageId: "compat-dom",
                    data: {
                        method: name,
                        browser: supportedAndBrokenBrowser[1],
                    }
                });
                return;
            }
        };
    },
});
