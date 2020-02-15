/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow prepend()",
            category: "Compatibility",
            recommended: false,
            requiresTypeChecking: true,
        },
        fixable: null,
    },

    create: function (context) {
        return {
            'CallExpression': (node) => {
                // console.log(context.parserServices.esTreeNodeToTSNodeMap.get(node));
                const checker = context.parserServices.program.getTypeChecker();
                const tsNode = context.parserServices.esTreeNodeToTSNodeMap.get(node.callee.object);
                const type = checker.getTypeAtLocation(tsNode);
                // console.log(type);
                // console.log(checker.isTypeAssignableTo(type, checker.get));
                // console.log(type.symbol.escapedName);
                if (node.callee.property.name === 'prepend' && type && type.symbol && type.symbol.escapedName.match(/Element/)) { // XXX
                    context.report({
                        node: node,
                        message: "IE11 does not have prepend()",
                    });
                }
            },
        };
    }
};
