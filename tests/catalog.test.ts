import assert from 'node:assert/strict';
import test from 'node:test';

import { loadCatalog } from '../src/catalog/catalog.io.js';
import { validateCatalog } from '../src/catalog/catalog.schema.js';

test('versioned SPF catalog is structurally valid', () => {
  const catalog = loadCatalog();
  const { validation } = validateCatalog(catalog);
  const errors = validation.issues.filter(
    (issue) => issue.severity === 'error',
  );

  assert.deepEqual(errors, []);
  assert.equal(catalog.products.length, 26);
  assert.equal(catalog.rules.length, 25);
});

test('catalog reports all currently missing recommendation combinations', () => {
  const catalog = loadCatalog();
  const { validation } = validateCatalog(catalog);

  assert.deepEqual(validation.missingRuleCombinations, []);
});

test('catalog validation rejects references to unknown products', () => {
  const catalog = loadCatalog();
  const invalidCatalog = structuredClone(catalog);

  invalidCatalog.rules[0].mainProduct = 'Несуществующий товар';

  const { validation } = validateCatalog(invalidCatalog);

  assert.ok(
    validation.issues.some(
      (issue) =>
        issue.severity === 'error' &&
        issue.message.includes('Несуществующий товар'),
    ),
  );
});
