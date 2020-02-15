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
                console.log(context.parserServices.esTreeNodeToTSNodeMap.get(node));
                if (node.callee.property.name === 'prepend') {
                    context.report({
                        node: node,
                        message: "IE11 does not have prepend()",
                    });
                }
            },
        };
    }
};
