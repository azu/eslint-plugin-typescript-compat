import { ESLintUtils } from '@typescript-eslint/experimental-utils';
/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */
"use strict";

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
            'CallExpression': (node: any) => {
                // console.log(context.parserServices.esTreeNodeToTSNodeMap.get(node));
                const checker = context.parserServices?.program?.getTypeChecker();
                const tsNode = context.parserServices?.esTreeNodeToTSNodeMap?.get(node.callee.object);
                const type = tsNode && checker?.getTypeAtLocation(tsNode);
                // console.log(type);
                // console.log(checker.isTypeAssignableTo(type, checker.get));
                // console.log(type.symbol.escapedName);
                if (node.callee.property.name === 'prepend' && type?.symbol?.escapedName.toString().match(/Element/)) { // XXX
                    context.report({
                        node: node,
                        messageId: "noPrepend",
                    });
                }
            },
        };
    },
});
