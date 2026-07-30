import type {
  CatalogIssue,
  CatalogValidationResult,
} from './catalog.types.js';

export function printCatalogIssues(issues: CatalogIssue[]): void {
  for (const issue of issues) {
    const label = issue.severity === 'error' ? 'ERROR' : 'WARNING';
    console.log(`[${label}] ${issue.message}`);
  }
}

export function printCatalogValidation(
  validation: CatalogValidationResult,
): void {
  printCatalogIssues(validation.issues);
  console.log(
    `Проверка каталога завершена. Непокрытых комбинаций: ${validation.missingRuleCombinations.length}.`,
  );
}
