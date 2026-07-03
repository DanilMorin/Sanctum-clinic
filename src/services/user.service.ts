/*
 принимает данные Telegram-пользователя;
приводит telegramId к строке;
создаёт пользователя, если его ещё нет;
обновляет username, firstName, lastName, если пользователь уже есть.
*/
import type { User } from '@prisma/client';
import {
  userRepository,
  type TelegramUserInput,
} from '../repositories/user.repository.js';

export interface TelegramUserServiceInput {
  telegramId: number | string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export class UserService {
  async getOrCreateTelegramUser(
    input: TelegramUserServiceInput,
  ): Promise<User> {
    const telegramUserInput: TelegramUserInput = {
      telegramId: String(input.telegramId),
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
    };

    return userRepository.upsertTelegramUser(telegramUserInput);
  }

  async findByTelegramId(telegramId: number | string): Promise<User | null> {
    return userRepository.findByTelegramId(String(telegramId));
  }

  async findById(id: number): Promise<User | null> {
    return userRepository.findById(id);
  }
}

export const userService = new UserService();