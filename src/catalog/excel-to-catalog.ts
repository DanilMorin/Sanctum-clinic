import fs from 'node:fs';
import path from 'node:path';

import {
  Lifestyle,
  ProductCategory,
  SkinFeature,
  SkinType,
} from '@prisma/client';
import * as XLSX from 'xlsx';

import type {
  CatalogIssue,
  CatalogProduct,
  CatalogRule,
  SpfCatalog,
} from './catalog.types.js';

type RawCellValue = string | number | boolean | null | undefined;
type ExcelRecord = Record<string, RawCellValue>;

export const DEFAULT_EXCEL_PATH = path.resolve('data/spf.xlsx');
const RULES_SHEET_NAME = 'Вопросы и логика';

const productColumnGroups = [
  {
    name: 'Основная рекомендация',
    brand: 'Бренд',
    spf: 'SPF',
    texture: 'Текстура',
    isMakeupBase: 'База под макияж',
    description: 'Описание',
    imageUrl: 'Изображение',
    category: ProductCategory.pharmacy,
  },
  {
    name: 'Альтернатива 1',
    brand: 'Бренд (альт.1)',
    spf: 'SPF (альт.1)',
    texture: 'Текстура (альт.1)',
    isMakeupBase: 'База под макияж (альт.1)',
    description: 'Описание (альт.1)',
    imageUrl: 'Изображение (альт.1)',
    category: ProductCategory.pharmacy,
  },
  {
    name: 'Альтернатива 2',
    brand: 'Бренд (альт.2)',
    spf: 'SPF (альт.2)',
    texture: 'Текстура (альт.2)',
    isMakeupBase: 'База под макияж (альт.2)',
    description: 'Описание (альт.2)',
    imageUrl: 'Изображение (альт.2)',
    category: ProductCategory.pharmacy,
  },
  {
    name: 'Альтернатива 3',
    brand: 'Бренд (альт.3)',
    spf: 'SPF (альт.3)',
    texture: 'Текстура (альт.3)',
    isMakeupBase: 'База под макияж (альт.3)',
    description: 'Описание (альт.3)',
    imageUrl: 'Изображение (альт.3)',
    category: ProductCategory.pharmacy,
  },
  {
    name: 'Проф. вариант',
    brand: 'Бренд (проф.)',
    spf: 'SPF (проф.)',
    texture: 'Текстура (проф.)',
    isMakeupBase: 'База под макияж (проф.)',
    description: 'Описание (проф.)',
    imageUrl: 'Изображение (проф.)',
    category: ProductCategory.professional,
  },
] as const;

function normalizeText(value: RawCellValue): string {
  return value === null || value === undefined
    ? ''
    : String(value).trim();
}

function nullableText(value: RawCellValue): string | null {
  const text = normalizeText(value);

  return text || null;
}

function parseBoolean(value: RawCellValue): boolean | null {
  const text = normalizeText(value).toLowerCase();

  if (text === 'да') {
    return true;
  }

  if (text === 'нет') {
    return false;
  }

  return null;
}

function mapValue<T extends string>(
  value: RawCellValue,
  fieldName: string,
  values: Record<string, T>,
): T {
  const text = normalizeText(value);
  const mappedValue = values[text];

  if (!mappedValue) {
    throw new Error(
      `Неизвестное значение поля "${fieldName}": "${text}".`,
    );
  }

  return mappedValue;
}

function mapSkinType(value: RawCellValue): SkinType {
  return mapValue(value, 'Тип кожи', {
    Жирная: SkinType.oily,
    Комбинированная: SkinType.combination,
    Сухая: SkinType.dry,
  });
}

function mapSkinFeature(value: RawCellValue): SkinFeature {
  return mapValue(value, 'Особенность', {
    'Акне / высыпания': SkinFeature.acne,
    Розацеа: SkinFeature.rosacea,
    Купероз: SkinFeature.couperose,
    Пигментация: SkinFeature.pigmentation,
    'Чувствительная / раздражённая': SkinFeature.sensitive,
    'Без особенностей': SkinFeature.none,
  });
}

function mapLifestyle(value: RawCellValue): Lifestyle {
  return mapValue(value, 'Образ жизни', {
    Активный: Lifestyle.active,
    Обычный: Lifestyle.normal,
    Любой: Lifestyle.any,
  });
}

function parseProduct(
  row: ExcelRecord,
  columns: (typeof productColumnGroups)[number],
): CatalogProduct | null {
  const name = normalizeText(row[columns.name]);

  if (!name) {
    return null;
  }

  return {
    name,
    brand: nullableText(row[columns.brand]),
    category: columns.category,
    spf: nullableText(row[columns.spf]),
    texture: nullableText(row[columns.texture]),
    isMakeupBase: parseBoolean(row[columns.isMakeupBase]),
    description: nullableText(row[columns.description]),
    doctorComment: null,
    imageUrl: nullableText(row[columns.imageUrl]),
  };
}

function getProductConflictFields(
  existing: CatalogProduct,
  candidate: CatalogProduct,
): string[] {
  const fields: Array<keyof Omit<CatalogProduct, 'name'>> = [
    'brand',
    'category',
    'spf',
    'texture',
    'isMakeupBase',
    'description',
    'doctorComment',
    'imageUrl',
  ];

  return fields.filter(
    (field) =>
      existing[field] !== null &&
      candidate[field] !== null &&
      existing[field] !== candidate[field],
  );
}

function mergeProduct(
  existing: CatalogProduct,
  candidate: CatalogProduct,
): CatalogProduct {
  return {
    name: existing.name,
    brand: existing.brand ?? candidate.brand,
    category: existing.category,
    spf: existing.spf ?? candidate.spf,
    texture: existing.texture ?? candidate.texture,
    isMakeupBase: existing.isMakeupBase ?? candidate.isMakeupBase,
    description: existing.description ?? candidate.description,
    doctorComment: existing.doctorComment ?? candidate.doctorComment,
    imageUrl: existing.imageUrl ?? candidate.imageUrl,
  };
}

export function convertExcelToCatalog(
  excelPath = DEFAULT_EXCEL_PATH,
): { catalog: SpfCatalog; issues: CatalogIssue[] } {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel-файл не найден: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[RULES_SHEET_NAME];

  if (!sheet) {
    throw new Error(`Лист "${RULES_SHEET_NAME}" не найден.`);
  }

  const rows = XLSX.utils.sheet_to_json<ExcelRecord>(sheet, {
    defval: null,
  });
  const productsByName = new Map<string, CatalogProduct>();
  const rules: CatalogRule[] = [];
  const issues: CatalogIssue[] = [];

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    const products = productColumnGroups.map((columns) =>
      parseProduct(row, columns),
    );
    const mainProduct = products[0];
    const professionalProduct = products[4];

    if (!mainProduct) {
      throw new Error(
        `В строке ${rowNumber} не заполнена основная рекомендация.`,
      );
    }

    for (const product of products) {
      if (!product) {
        continue;
      }

      const existingProduct = productsByName.get(product.name);

      if (!existingProduct) {
        productsByName.set(product.name, product);
        continue;
      }

      const conflictFields = getProductConflictFields(
        existingProduct,
        product,
      );

      if (conflictFields.length) {
        issues.push({
          severity: 'warning',
          message: `Строка ${rowNumber}: у товара "${product.name}" отличаются поля ${conflictFields.join(
            ', ',
          )}. Сохранены первые непустые значения.`,
        });
      }

      productsByName.set(
        product.name,
        mergeProduct(existingProduct, product),
      );
    }

    rules.push({
      skinType: mapSkinType(row['Тип кожи']),
      priorityFeature: mapSkinFeature(row['Особенность']),
      lifestyle: mapLifestyle(row['Образ жизни']),
      mainProduct: mainProduct.name,
      alternatives: products
        .slice(1, 4)
        .filter((product): product is CatalogProduct => product !== null)
        .map((product) => product.name),
      professionalProduct: professionalProduct?.name ?? null,
    });
  }

  return {
    catalog: {
      version: 1,
      products: Array.from(productsByName.values()).sort((left, right) =>
        left.name.localeCompare(right.name, 'ru'),
      ),
      rules,
    },
    issues,
  };
}
