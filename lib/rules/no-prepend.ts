import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import CompatData from 'mdn-browser-compat-data';
/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */

 console.log(CompatData.api.ParentNode);

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
                const tsNode = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.property);
                if (!tsNode) return;
                const type = checker.getTypeAtLocation(tsNode);
                const symbol = type.symbol;
                // find is better?
                const isLibDomMethod = symbol?.getDeclarations()?.every(dec => dec.getSourceFile().fileName.match(/lib\.dom\.d\.ts/));

                const name = symbol?.getName();

                if (!isLibDomMethod) return;

                // TODO: get implementing interfaces from symbol. eg: HTMLDivElement -> Element -> ParentNode
                const compat = CompatData.api.ParentNode[name];
                const supported = (compat?.__compat?.support.ie as any)?.version_added;
                console.log(name, compat?.__compat?.support.ie);
                if (supported) return;

                 context.report({
                     node: node,
                     messageId: "notSupported",
                 });
            },
        };
    },
});
