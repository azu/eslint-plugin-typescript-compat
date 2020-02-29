import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import CompatData from 'mdn-browser-compat-data';
import ts from 'typescript';
/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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

export = ESLintUtils.RuleCreator(name => '')({
    name: "no-prepend",
    meta: {
        docs: {
            description: `Disable prepend()`,
            category: "Possible Errors",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            notSupported: "Not Supported"
        },
        schema: [],
        type: "problem",
    },
    defaultOptions: [],

    create(context) {
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
                    // TODO: receive browserlist
                    const supported = (compat?.__compat?.support.ie as any)?.version_added;
                    if (supported) return;

                    // TODO: set label
                    context.report({
                        node: node,
                        messageId: "notSupported",
                    });
                    return;
                }
            },
        };
    },
});
