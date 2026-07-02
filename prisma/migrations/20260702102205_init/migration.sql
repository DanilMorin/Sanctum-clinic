-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` VARCHAR(191) NULL,
    `maxId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_telegramId_key`(`telegramId`),
    UNIQUE INDEX `User_maxId_key`(`maxId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizSession` (
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecommendationRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skinType` ENUM('oily', 'combination', 'dry') NOT NULL,
    `priorityFeature` ENUM('acne', 'rosacea', 'couperose', 'pigmentation', 'sensitive', 'none') NOT NULL,
    `lifestyle` ENUM('active', 'normal', 'any') NOT NULL,
    `mainProductId` INTEGER NULL,
    `professionalProductId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RecommendationRule_skinType_priorityFeature_lifestyle_idx`(`skinType`, `priorityFeature`, `lifestyle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecommendationAlternative` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recommendationRuleId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RecommendationAlternative_recommendationRuleId_productId_key`(`recommendationRuleId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuizSession` ADD CONSTRAINT `QuizSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizSession` ADD CONSTRAINT `QuizSession_recommendationRuleId_fkey` FOREIGN KEY (`recommendationRuleId`) REFERENCES `RecommendationRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationRule` ADD CONSTRAINT `RecommendationRule_mainProductId_fkey` FOREIGN KEY (`mainProductId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationRule` ADD CONSTRAINT `RecommendationRule_professionalProductId_fkey` FOREIGN KEY (`professionalProductId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationAlternative` ADD CONSTRAINT `RecommendationAlternative_recommendationRuleId_fkey` FOREIGN KEY (`recommendationRuleId`) REFERENCES `RecommendationRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendationAlternative` ADD CONSTRAINT `RecommendationAlternative_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
