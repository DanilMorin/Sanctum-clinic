import type {
  Lifestyle,
  ProductCategory,
  SkinFeature,
  SkinType,
} from '@prisma/client';

export interface CatalogProduct {
  name: string;
  brand: string | null;
  category: ProductCategory;
  spf: string | null;
  texture: string | null;
  isMakeupBase: boolean | null;
  description: string | null;
  doctorComment: string | null;
  imageUrl: string | null;
}

export interface CatalogRule {
  skinType: SkinType;
  priorityFeature: SkinFeature;
  lifestyle: Lifestyle;
  mainProduct: string | null;
  alternatives: string[];
  professionalProduct: string | null;
}

export interface SpfCatalog {
  version: 1;
  products: CatalogProduct[];
  rules: CatalogRule[];
}

export interface CatalogIssue {
  severity: 'warning' | 'error';
  message: string;
}

export interface CatalogValidationResult {
  issues: CatalogIssue[];
  missingRuleCombinations: string[];
}
