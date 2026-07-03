/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecommendationAlternative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecommendationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `QuizSession` DROP FOREIGN KEY `QuizSession_recommendationRuleId_fkey`;

-- DropForeignKey
ALTER TABLE `QuizSession` DROP FOREIGN KEY `QuizSession_userId_fkey`;

-- DropForeignKey
ALTER TABLE `RecommendationAlternative` DROP FOREIGN KEY `RecommendationAlternative_productId_fkey`;

-- DropForeignKey
ALTER TABLE `RecommendationAlternative` DROP FOREIGN KEY `RecommendationAlternative_recommendationRuleId_fkey`;

-- DropForeignKey
ALTER TABLE `RecommendationRule` DROP FOREIGN KEY `RecommendationRule_mainProductId_fkey`;

-- DropForeignKey
ALTER TABLE `RecommendationRule` DROP FOREIGN KEY `RecommendationRule_professionalProductId_fkey`;

-- DropTable
DROP TABLE `Product`;

-- DropTable
DROP TABLE `QuizSession`;

-- DropTable
DROP TABLE `RecommendationAlternative`;

-- DropTable
DROP TABLE `RecommendationRule`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` VARCHAR(191) NULL,
    `maxId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_telegramId_key`(`telegramId`),
    UNIQUE INDEX `users_maxId_key`(`maxId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `status` ENUM('started', 'completed', 'abandoned') NOT NULL DEFAULT 'started',
    `skinType` ENUM('oily', 'combination', 'dry') NULL,
    `skinFeatures` JSON NULL,
    `priorityFeature` ENUM('acne', 'rosacea', 'couperose', 'pigmentation', 'sensitive', 'none') NULL,
    `lifestyle` ENUM('active', 'normal', 'any') NULL,
    `spfUsage` ENUM('makeup_base', 'standalone') NULL,
    `productFormat` ENUM('pharmacy', 'professional', 'both') NULL,
    `recommendationRuleId` INTEGER NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quiz_sessions_userId_idx`(`userId`),
    INDEX `quiz_sessions_status_idx`(`status`),
    INDEX `quiz_sessions_recommendationRuleId_idx`(`recommendationRuleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `category` ENUM('pharmacy', 'professional') NOT NULL,
    `spf` VARCHAR(191) NULL,
    `texture` VARCHAR(191) NULL,
    `isMakeupBase` BOOLEAN NULL,
    `description` TEXT NULL,
    `doctorComment` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `products_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skinType` ENUM('oily', 'combination', 'dry') NOT NULL,
    `priorityFeature` ENUM('acne', 'rosacea', 'couperose', 'pigmentation', 'sensitive', 'none') NOT NULL,
    `lifestyle` ENUM('active', 'normal', 'any') NOT NULL,
    `mainProductId` INTEGER NULL,
    `professionalProductId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `recommendation_rules_mainProductId_idx`(`mainProductId`),
    INDEX `recommendation_rules_professionalProductId_idx`(`professionalProductId`),
    UNIQUE INDEX `recommendation_rules_skinType_priorityFeature_lifestyle_key`(`skinType`, `priorityFeature`, `lifestyle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_alternatives` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recommendationRuleId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `recommendation_alternatives_productId_idx`(`productId`),
    UNIQUE INDEX `recommendation_alternatives_recommendationRuleId_productId_key`(`recommendationRuleId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quiz_sessions` ADD CONSTRAINT `quiz_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_sessions` ADD CONSTRAINT `quiz_sessions_recommendationRuleId_fkey` FOREIGN KEY (`recommendationRuleId`) REFERENCES `recommendation_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_rules` ADD CONSTRAINT `recommendation_rules_mainProductId_fkey` FOREIGN KEY (`mainProductId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_rules` ADD CONSTRAINT `recommendation_rules_professionalProductId_fkey` FOREIGN KEY (`professionalProductId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_alternatives` ADD CONSTRAINT `recommendation_alternatives_recommendationRuleId_fkey` FOREIGN KEY (`recommendationRuleId`) REFERENCES `recommendation_rules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_alternatives` ADD CONSTRAINT `recommendation_alternatives_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
