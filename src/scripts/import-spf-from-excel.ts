/*
Файл для чтения xlxs и добавление данных в базу данных
*/
import fs from 'node:fs';
import path from 'node:path';
import {
    Lifestyle,
    PrismaClient,
    ProductCategory,
    SkinFeature,
    SkinType,
} from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

const EXCEL_FILE_PATH = path.resolve('data/spf.xlsx');
const SHEET_NAME = 'Вопросы и логика';

type RawCellValue = string | number | boolean | null | undefined;

interface ExcelRow {
    skinType: SkinType;
    priorityFeature: SkinFeature;
    lifestyle: Lifestyle;

    mainProduct: ProductInput;
    alternatives: ProductInput[];
    professionalProduct: ProductInput | null;
}

interface ProductInput {
    name: string;
    brand: string | null;
    category: ProductCategory;
    spf: string | null;
    texture: string | null;
    isMakeupBase: boolean | null;
    description: string | null;
    imageUrl: string | null;
}

function normalizeText(value: RawCellValue): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function nullableText(value: RawCellValue): string | null {
    const text = normalizeText(value);

    return text.length > 0 ? text : null;
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

function mapSkinType(value: RawCellValue): SkinType {
    const text = normalizeText(value);

    const map: Record<string, SkinType> = {
        Жирная: SkinType.oily,
        Комбинированная: SkinType.combination,
        Сухая: SkinType.dry,
    };

    const result = map[text];

    if (!result) {
        throw new Error(`Unknown skin type: "${text}"`);
    }

    return result;
}

function mapSkinFeature(value: RawCellValue): SkinFeature {
    const text = normalizeText(value);

    const map: Record<string, SkinFeature> = {
        'Акне / высыпания': SkinFeature.acne,
        Розацеа: SkinFeature.rosacea,
        Купероз: SkinFeature.couperose,
        Пигментация: SkinFeature.pigmentation,
        'Чувствительная / раздражённая': SkinFeature.sensitive,
        'Без особенностей': SkinFeature.none,
    };

    const result = map[text];

    if (!result) {
        throw new Error(`Unknown skin feature: "${text}"`);
    }

    return result;
}

function mapLifestyle(value: RawCellValue): Lifestyle {
    const text = normalizeText(value);

    const map: Record<string, Lifestyle> = {
        Активный: Lifestyle.active,
        Обычный: Lifestyle.normal,
        Любой: Lifestyle.any,
    };

    const result = map[text];

    if (!result) {
        throw new Error(`Unknown lifestyle: "${text}"`);
    }

    return result;
}

function createProductInput(params: {
    name: RawCellValue;
    brand: RawCellValue;
    category: ProductCategory;
    spf: RawCellValue;
    texture: RawCellValue;
    isMakeupBase: RawCellValue;
    description: RawCellValue;
    imageUrl: RawCellValue;
}): ProductInput | null {
    const name = normalizeText(params.name);

    if (!name) {
        return null;
    }

    return {
        name,
        brand: nullableText(params.brand),
        category: params.category,
        spf: nullableText(params.spf),
        texture: nullableText(params.texture),
        isMakeupBase: parseBoolean(params.isMakeupBase),
        description: nullableText(params.description),
        imageUrl: nullableText(params.imageUrl),
    };
}

function readExcelRows(): ExcelRow[] {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
        throw new Error(`Excel file was not found: ${EXCEL_FILE_PATH}`);
    }

    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.Sheets[SHEET_NAME];

    if (!sheet) {
        throw new Error(`Sheet "${SHEET_NAME}" was not found`);
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, RawCellValue>>(sheet, {
        defval: null,
    });

    return rows.map((row, index) => {
        const rowNumber = index + 2;

        const mainProduct = createProductInput({
            name: row['Основная рекомендация'],
            brand: row['Бренд'],
            category: ProductCategory.pharmacy,
            spf: row['SPF'],
            texture: row['Текстура'],
            isMakeupBase: row['База под макияж'],
            description: row['Описание'],
            imageUrl: row['Изображение'],
        });

        if (!mainProduct) {
            throw new Error(`Main product is empty at row ${rowNumber}`);
        }

        const alternative1 = createProductInput({
            name: row['Альтернатива 1'],
            brand: row['Бренд (альт.1)'],
            category: ProductCategory.pharmacy,
            spf: row['SPF (альт.1)'],
            texture: row['Текстура (альт.1)'],
            isMakeupBase: row['База под макияж (альт.1)'],
            description: row['Описание (альт.1)'],
            imageUrl: row['Изображение (альт.1)'],
        });

        const alternative2 = createProductInput({
            name: row['Альтернатива 2'],
            brand: row['Бренд (альт.2)'],
            category: ProductCategory.pharmacy,
            spf: row['SPF (альт.2)'],
            texture: row['Текстура (альт.2)'],
            isMakeupBase: row['База под макияж (альт.2)'],
            description: row['Описание (альт.2)'],
            imageUrl: row['Изображение (альт.2)'],
        });

        const alternative3 = createProductInput({
            name: row['Альтернатива 3'],
            brand: row['Бренд (альт.3)'],
            category: ProductCategory.pharmacy,
            spf: row['SPF (альт.3)'],
            texture: row['Текстура (альт.3)'],
            isMakeupBase: row['База под макияж (альт.3)'],
            description: row['Описание (альт.3)'],
            imageUrl: row['Изображение (альт.3)'],
        });

        const professionalProduct = createProductInput({
            name: row['Проф. вариант'],
            brand: row['Бренд (проф.)'],
            category: ProductCategory.professional,
            spf: row['SPF (проф.)'],
            texture: row['Текстура (проф.)'],
            isMakeupBase: row['База под макияж (проф.)'],
            description: row['Описание (проф.)'],
            imageUrl: row['Изображение (проф.)'],
        });

        return {
            skinType: mapSkinType(row['Тип кожи']),
            priorityFeature: mapSkinFeature(row['Особенность']),
            lifestyle: mapLifestyle(row['Образ жизни']),
            mainProduct,
            alternatives: [alternative1, alternative2, alternative3].filter(
                (product): product is ProductInput => Boolean(product),
            ),
            professionalProduct,
        };
    });
}

async function upsertProduct(input: ProductInput) {
    const existingProduct = await prisma.product.findFirst({
        where: {
            name: input.name,
        },
    });

    if (existingProduct) {
        return prisma.product.update({
            where: {
                id: existingProduct.id,
            },
            data: {
                brand: input.brand,
                category: input.category,
                spf: input.spf,
                texture: input.texture,
                isMakeupBase: input.isMakeupBase,
                description: input.description,
                imageUrl: input.imageUrl,
            },
        });
    }

    return prisma.product.create({
        data: input,
    });
}

async function importRows(rows: ExcelRow[]): Promise<void> {
    await prisma.quizSession.updateMany({
        data: {
            recommendationRuleId: null,
        },
    });
    await prisma.recommendationAlternative.deleteMany();
    await prisma.recommendationRule.deleteMany();
    await prisma.product.deleteMany();

    for (const row of rows) {
        const mainProduct = await upsertProduct(row.mainProduct);

        const professionalProduct = row.professionalProduct
            ? await upsertProduct(row.professionalProduct)
            : null;

        const recommendationRule = await prisma.recommendationRule.create({
            data: {
                skinType: row.skinType,
                priorityFeature: row.priorityFeature,
                lifestyle: row.lifestyle,
                mainProductId: mainProduct.id,
                professionalProductId: professionalProduct?.id ?? null,
            },
        });

        for (const [index, alternative] of row.alternatives.entries()) {
            const product = await upsertProduct(alternative);

            await prisma.recommendationAlternative.create({
                data: {
                    recommendationRuleId: recommendationRule.id,
                    productId: product.id,
                    sortOrder: index + 1,
                },
            });
        }
    }
}

async function main(): Promise<void> {
    console.log('Import SPF data from Excel...');
    console.log(`File: ${EXCEL_FILE_PATH}`);
    console.log(`Sheet: ${SHEET_NAME}`);

    const rows = readExcelRows();

    console.log(`Rows found: ${rows.length}`);

    await importRows(rows);

    const productsCount = await prisma.product.count();
    const rulesCount = await prisma.recommendationRule.count();
    const alternativesCount = await prisma.recommendationAlternative.count();

    console.log('Import completed.');
    console.log(`Products: ${productsCount}`);
    console.log(`Recommendation rules: ${rulesCount}`);
    console.log(`Alternatives: ${alternativesCount}`);
}

main()
    .catch((error) => {
        console.error('Import failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });