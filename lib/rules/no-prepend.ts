import { ESLintUtils } from '@typescript-eslint/experimental-utils';
/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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
            noPrepend: "IE11 does not have prepend()"
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
                const tsNode = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.property);
                if (!tsNode) return;
                const type = checker.getTypeAtLocation(tsNode);
                const symbol = type.symbol;
                // find is better?
                const isLibDomMethod = symbol?.getDeclarations()?.every(dec => dec.getSourceFile().fileName.match(/lib\.dom\.d\.ts/));

                const name = symbol?.getName();

                // TODO: collect forbidden methods from mdn-browser-compat-data
                if (name === 'prepend' && isLibDomMethod) {
                     context.report({
                         node: node,
                         messageId: "noPrepend",
                     });
                 }
            },
        };
    },
});
