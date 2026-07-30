import {
  DEFAULT_CATALOG_PATH,
  saveCatalog,
} from './catalog.io.js';
import {
  assertCatalogIsValid,
  validateCatalog,
} from './catalog.schema.js';
import { convertExcelToCatalog } from './excel-to-catalog.js';
import {
  printCatalogIssues,
  printCatalogValidation,
} from './catalog.reporting.js';

export function generateCatalog(): void {
  const { catalog, issues: conversionIssues } =
    convertExcelToCatalog();
  const { catalog: normalizedCatalog, validation } =
    validateCatalog(catalog);

  printCatalogIssues(conversionIssues);
  printCatalogValidation(validation);
  assertCatalogIsValid(validation);
  saveCatalog(normalizedCatalog);

  console.log(`Каталог сохранён: ${DEFAULT_CATALOG_PATH}`);
  console.log(`Товаров: ${normalizedCatalog.products.length}`);
  console.log(`Правил: ${normalizedCatalog.rules.length}`);
}
