import { generateCatalog } from '../catalog/catalog.pipeline.js';

try {
  generateCatalog();
} catch (error) {
  console.error(error);
  process.exit(1);
}
