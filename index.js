"use strict";
var t = _interopRequireWildcard(require("@babel/types"));
var fs = _interopRequireWildcard(require("fs"));
var _node = require("vscode-languageserver/node");
var _vscodeUri = require("vscode-uri");
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {
        };
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {
                    };
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
function getImportSpecifierName(importDeclaration, position) {
    const importNameData = importDeclaration.specifiers.find((item)=>{
        var ref, ref1, ref2;
        const importLine = (ref = item.loc) === null || ref === void 0 ? void 0 : ref.start.line;
        const importStartCol = (ref1 = item.loc) === null || ref1 === void 0 ? void 0 : ref1.start.column;
        const importStartEnd = (ref2 = item.loc) === null || ref2 === void 0 ? void 0 : ref2.end.column;
        return importStartCol && importStartEnd && position.line + 1 === importLine && importStartCol <= position.character && importStartEnd >= position.character;
    });
    return importNameData && importNameData.type === 'ImportSpecifier' ? importNameData.imported.name : '';
}
function pathsToLocations(paths, importName) {
    return paths.map((modulePath)=>{
        const uriPath = modulePath.uri;
        const file = fs.readFileSync(_vscodeUri.URI.parse(uriPath).path, 'utf8');
        const arr = file.split(/\r?\n/);
        const idxFound = arr.findIndex((line)=>line.includes(importName) && line.includes('export')
        );
        return _node.Location.create(modulePath.uri, _node.Range.create(idxFound, 0, idxFound, 0));
    });
}
function hasNodeType(node, type) {
    if (!node) {
        return false;
    }
    return node.type === type;
}
function isImportSpecifier(path) {
    return hasNodeType(path.parent, 'ImportSpecifier');
}
module.exports = (function() {
    class ElsAddonImportDefinition {
        async onDefinition(_, params) {
            const results = params.results;
            if (isImportSpecifier(params.focusPath)) {
                const importDec = params.focusPath.parentFromLevel(2);
                const importName = getImportSpecifierName(importDec, params.position);
                if (importName) {
                    return pathsToLocations(params.results, importName);
                }
            }
            return [
                ...results
            ];
        }
    }
    return ElsAddonImportDefinition;
})();

