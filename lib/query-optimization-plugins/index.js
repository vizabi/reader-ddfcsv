"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const in_clause_under_conjunction_plugin_1 = require("./in-clause-under-conjunction-plugin");
const head = require("lodash/head");
function getAppropriatePlugin(fileReader, basePath, queryParam, datapackage) {
    const plugins = [
        new in_clause_under_conjunction_plugin_1.InClauseUnderConjunctionPlugin(fileReader, basePath, queryParam, datapackage)
    ];
    return head(plugins.filter(plugin => plugin.isMatched()));
}
exports.getAppropriatePlugin = getAppropriatePlugin;
//# sourceMappingURL=index.js.map