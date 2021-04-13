import * as t from '@babel/types';
import * as fs from 'fs';
import {
  AddonAPI,
  DefinitionFunctionParams,
} from '@lifeart/ember-language-server';
import { Location, Range } from 'vscode-languageserver/node';
import { URI } from 'vscode-uri';
import ASTPath from '@lifeart/ember-language-server/lib/glimmer-utils';

function getImportSpecifierName(
  importDeclaration: t.ImportDeclaration,
  position: any
) {
  const importNameData = importDeclaration.specifiers.find((item) => {
    const importLine = item.loc?.start.line;
    const importStartCol = item.loc?.start.column;
    const importStartEnd = item.loc?.end.column;

    return (
      importStartCol &&
      importStartEnd &&
      position.line + 1 === importLine &&
      importStartCol <= position.character &&
      importStartEnd >= position.character
    );
  }) as t.ImportSpecifier;

  return importNameData && importNameData.type === 'ImportSpecifier'
    ? (importNameData.imported as t.Identifier).name
    : '';
}

function pathsToLocations(paths: Location[], importName?: string): Location[] {
  return paths.map((modulePath) => {
    const uriPath = modulePath.uri;
    const file = fs.readFileSync(URI.parse(uriPath).path, 'utf8');
    const arr = file.split(/\r?\n/);
    const idxFound = arr.findIndex(
      (line) => line.includes(importName) && line.includes('export')
    );

    return Location.create(
      modulePath.uri,
      Range.create(idxFound, 0, idxFound, 0)
    );
  });
}

function hasNodeType(node: any, type: string) {
  if (!node) {
    return false;
  }

  return node.type === type;
}

function isImportSpecifier(path: ASTPath): boolean {
  return hasNodeType(path.parent, 'ImportSpecifier');
}
module.exports = class ElsAddonImportDefinition implements AddonAPI {
  async onDefinition(_: string, params: DefinitionFunctionParams) {
    const results = params.results;

    if (isImportSpecifier(params.focusPath)) {
      const importDec = (params.focusPath.parentFromLevel(
        2
      ) as unknown) as t.ImportDeclaration;

      const importName = getImportSpecifierName(importDec, params.position);
      if (importName) {
        return pathsToLocations(params.results, importName);
      }
    }
    return [...results];
  }
};
