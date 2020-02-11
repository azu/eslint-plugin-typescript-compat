/**
 * @fileoverview Disallow prepend()
 * @author no-prepend
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-prepend"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-prepend", rule, {

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "prepend() is forbidden",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});
