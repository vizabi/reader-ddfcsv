"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const in_clause_under_conjunction_1 = require("./in-clause-under-conjunction");
const head = require("lodash.head");
function getAppropriatePlugin(queryParam, options) {
    const plugins = [
        new in_clause_under_conjunction_1.InClauseUnderConjunction(queryParam, options)
    ];
    return head(plugins.filter(plugin => plugin.isMatched()));
}
exports.getAppropriatePlugin = getAppropriatePlugin;
//# sourceMappingURL=index.js.map