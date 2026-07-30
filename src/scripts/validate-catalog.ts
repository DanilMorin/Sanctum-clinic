import { loadCatalog } from '../catalog/catalog.io.js';
import {
  assertCatalogIsValid,
  validateCatalog,
} from '../catalog/catalog.schema.js';
import { printCatalogValidation } from '../catalog/catalog.reporting.js';

try {
  const catalog = loadCatalog();
  const { validation } = validateCatalog(catalog);

  printCatalogValidation(validation);
  assertCatalogIsValid(validation);
} catch (error) {
  console.error(error);
  process.exit(1);
}
