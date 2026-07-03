import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface TelegramUserInput {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export class UserRepository {
    async findByTelegramId(telegramId: string): Promise<User | null> {//ищет пользователя по Telegram ID
        return prisma.user.findUnique({
            where: {
                telegramId,
            },
        });
    }

    async findByMaxId(maxId: string): Promise<User | null> {//ищет пользователя по MAX ID
        return prisma.user.findUnique({
            where: {
                maxId,
            },
        });
    }

    async findById(id: number): Promise<User | null> {//ищет пользователя по ID
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async createTelegramUser(input: TelegramUserInput): Promise<User> {//создаёт пользователя
        return prisma.user.create({
            data: {
                telegramId: input.telegramId,
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
            },
        });
    }

    async updateTelegramUser(//обновляет информацию о пользователе
        userId: number,
        input: TelegramUserInput,
    ): Promise<User> {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                telegramId: input.telegramId,
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
            },
        });
    }

    async upsertTelegramUser(input: TelegramUserInput): Promise<User> {//делает upsert: если пользователь есть — обновить, если нет — создать
        return prisma.user.upsert({
            where: {
                telegramId: input.telegramId,
            },
            create: {
                telegramId: input.telegramId,
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
            },
            update: {
                username: input.username,
                firstName: input.firstName,
                lastName: input.lastName,
            },
        });
    }
}

export const userRepository = new UserRepository();