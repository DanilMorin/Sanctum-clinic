import fs from 'node:fs';
import path from 'node:path';

import type { SpfCatalog } from './catalog.types.js';
import {
  assertCatalogIsValid,
  validateCatalog,
} from './catalog.schema.js';

export const DEFAULT_CATALOG_PATH = path.resolve(
  'catalog/spf.catalog.json',
);

export function loadCatalog(
  catalogPath = DEFAULT_CATALOG_PATH,
): SpfCatalog {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Файл каталога не найден: ${catalogPath}`);
  }

  const rawCatalog: unknown = JSON.parse(
    fs.readFileSync(catalogPath, 'utf8'),
  );
  const { catalog, validation } = validateCatalog(rawCatalog);

  assertCatalogIsValid(validation);

  return catalog;
}

export function saveCatalog(
  catalog: SpfCatalog,
  catalogPath = DEFAULT_CATALOG_PATH,
): void {
  const { catalog: normalizedCatalog, validation } =
    validateCatalog(catalog);

  assertCatalogIsValid(validation);
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  fs.writeFileSync(
    catalogPath,
    `${JSON.stringify(normalizedCatalog, null, 2)}\n`,
    'utf8',
  );
}
