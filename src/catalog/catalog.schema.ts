import { z } from 'zod';

import type {
  CatalogValidationResult,
  SpfCatalog,
} from './catalog.types.js';

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .nullable();

const productSchema = z.object({
  name: z.string().trim().min(1),
  brand: nullableTrimmedString,
  category: z.enum(['pharmacy', 'professional']),
  spf: nullableTrimmedString,
  texture: nullableTrimmedString,
  isMakeupBase: z.boolean().nullable(),
  description: nullableTrimmedString,
  doctorComment: nullableTrimmedString,
  imageUrl: nullableTrimmedString,
});

const ruleSchema = z.object({
  skinType: z.enum(['oily', 'combination', 'dry']),
  priorityFeature: z.enum([
    'acne',
    'rosacea',
    'couperose',
    'pigmentation',
    'sensitive',
    'none',
  ]),
  lifestyle: z.enum(['active', 'normal', 'any']),
  mainProduct: nullableTrimmedString,
  alternatives: z.array(z.string().trim().min(1)),
  professionalProduct: nullableTrimmedString,
});

const catalogSchema = z.object({
  version: z.literal(1),
  products: z.array(productSchema).min(1),
  rules: z.array(ruleSchema).min(1),
});

const skinTypes = ['oily', 'combination', 'dry'] as const;
const skinFeatures = [
  'acne',
  'rosacea',
  'couperose',
  'pigmentation',
  'sensitive',
  'none',
] as const;
const lifestyles = ['normal', 'active'] as const;

function getRuleKey(rule: {
  skinType: string;
  priorityFeature: string;
  lifestyle: string;
}): string {
  return `${rule.skinType}:${rule.priorityFeature}:${rule.lifestyle}`;
}

export function validateCatalog(value: unknown): {
  catalog: SpfCatalog;
  validation: CatalogValidationResult;
} {
  const catalog = catalogSchema.parse(value) as SpfCatalog;
  const issues: CatalogValidationResult['issues'] = [];
  const productNames = new Set<string>();

  for (const product of catalog.products) {
    if (productNames.has(product.name)) {
      issues.push({
        severity: 'error',
        message: `Товар "${product.name}" указан в каталоге несколько раз.`,
      });
    }

    productNames.add(product.name);
  }

  const ruleKeys = new Set<string>();

  for (const rule of catalog.rules) {
    const ruleKey = getRuleKey(rule);

    if (ruleKeys.has(ruleKey)) {
      issues.push({
        severity: 'error',
        message: `Правило "${ruleKey}" указано в каталоге несколько раз.`,
      });
    }

    ruleKeys.add(ruleKey);

    const referencedProducts = [
      rule.mainProduct,
      ...rule.alternatives,
      rule.professionalProduct,
    ].filter((name): name is string => Boolean(name));

    for (const productName of referencedProducts) {
      if (!productNames.has(productName)) {
        issues.push({
          severity: 'error',
          message: `Правило "${ruleKey}" ссылается на отсутствующий товар "${productName}".`,
        });
      }
    }
  }

  const missingRuleCombinations: string[] = [];

  for (const skinType of skinTypes) {
    for (const priorityFeature of skinFeatures) {
      for (const lifestyle of lifestyles) {
        const exactKey = getRuleKey({
          skinType,
          priorityFeature,
          lifestyle,
        });
        const fallbackKey = getRuleKey({
          skinType,
          priorityFeature,
          lifestyle: 'any',
        });

        if (!ruleKeys.has(exactKey) && !ruleKeys.has(fallbackKey)) {
          missingRuleCombinations.push(exactKey);
        }
      }
    }
  }

  for (const combination of missingRuleCombinations) {
    issues.push({
      severity: 'warning',
      message: `Нет рекомендации для комбинации "${combination}".`,
    });
  }

  return {
    catalog,
    validation: {
      issues,
      missingRuleCombinations,
    },
  };
}

export function assertCatalogIsValid(
  validation: CatalogValidationResult,
): void {
  const errors = validation.issues.filter(
    (issue) => issue.severity === 'error',
  );

  if (!errors.length) {
    return;
  }

  throw new Error(
    ['Каталог не прошёл проверку:', ...errors.map((issue) => `- ${issue.message}`)].join(
      '\n',
    ),
  );
}
