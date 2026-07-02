# Roadmap: Sanctum Clinic SPF Bot

## Этап 1 — Базовый запуск проекта и Telegram-бота

### Цель
Бот должен запускаться, читать `.env`, подключаться к Telegram и отвечать на `/start`.

### Что делаем
- Настраиваем `env.ts`
- Настраиваем `logger.ts`
- Подключаем `telegraf-hardened`
- Создаём Telegram bot instance
- Добавляем команду `/start`
- Добавляем проверку `BOT_ENABLED`
- Добавляем корректный запуск из `src/index.ts`

### Результат этапа
- Приложение запускается
- Если `BOT_ENABLED=true`, Telegram-бот стартует
- Если `BOT_ENABLED=false`, Telegram-бот не запускается
- Бот отвечает на `/start`
- Бот показывает приветственный текст
- Бот показывает кнопку «Начать подбор»
- Логика теста ещё не реализована

---

## Этап 2 — Описание доменной модели теста

### Цель
Создать структуру вопросов, вариантов ответов и правил выбора.

### Что делаем
- `quiz.types.ts`
- `quiz.constants.ts`
- `quiz.rules.ts`
- Типы `SkinType`, `SkinFeature`, `Lifestyle`, `SpfUsage`, `ProductFormat`
- Список из 5 вопросов
- Правила `single choice` / `multiple choice`
- Правило для «Без особенностей»
- Правило определения `priorityFeature`

### Результат этапа
- В проекте есть единый источник правды для вопросов и вариантов ответов
- Есть чистые функции правил теста
- Логика не зависит от Telegram
- Логику можно использовать потом в Mini App и MAX

---

## Этап 3 — Prisma-схема и миграция БД

### Цель
Создать рабочую структуру базы данных.

### Что делаем
- Финализируем `prisma/schema.prisma`
- Создаём модели:
  - `User`
  - `QuizSession`
  - `Product`
  - `RecommendationRule`
  - `RecommendationAlternative`
- Запускаем миграцию
- Проверяем таблицы через phpMyAdmin

### Результат этапа
- MySQL содержит все нужные таблицы
- Таблицы видны в phpMyAdmin
- Prisma Client может работать с моделями

---

## Этап 4 — Repository layer

### Цель
Вынести работу с Prisma в отдельные репозитории.

### Что делаем
- `user.repository.ts`
- `quiz-session.repository.ts`
- `product.repository.ts`
- `recommendation-rule.repository.ts`

### Результат этапа
- Сервисы не обращаются к Prisma напрямую
- Вся работа с БД идёт через repositories

---

## Этап 5 — Бизнес-логика теста

### Цель
Реализовать основную логику прохождения теста.

### Что делаем
- `user.service.ts`
- `quiz.service.ts`
- `recommendation.service.ts`
- `product.service.ts`
- Создание пользователя
- Создание quiz session
- Сохранение ответов
- Определение `priorityFeature`
- Завершение теста
- Получение результата

### Результат этапа
- Тест можно создать, пройти и завершить без Telegram
- Бизнес-логика находится в services
- Telegram, Mini App и MAX смогут использовать одну и ту же логику

---

## Этап 6 — Telegram wizard / текстовый режим

### Цель
Сделать прохождение теста через Telegram-кнопки.

### Что делаем
- `start.command.ts`
- `quiz.handler.ts`
- `callback.handler.ts`
- `quiz.keyboard.ts`
- `result.presenter.ts`
- Обработка шагов 1–5
- Inline-кнопки
- Мультивыбор на шаге 2
- Кнопка «Далее»
- Вывод результата
- Кнопка «Пройти заново»

### Результат этапа
Пользователь проходит весь SPF-тест в Telegram без Mini App.

---

## Этап 7 — Seed данных рекомендаций

### Цель
Заполнить базу начальными продуктами и правилами подбора.

### Что делаем
- `prisma/seed.ts`
- Список продуктов
- Правила `RecommendationRule`
- Альтернативы `RecommendationAlternative`
- Команда `npm run prisma:seed`

### Результат этапа
- В базе есть продукты
- В базе есть правила подбора
- Бот возвращает реальные рекомендации из БД

---

## Этап 8 — API для будущего Mini App

### Цель
Подготовить backend API, который позже будет использовать Mini App.

### Что делаем
- `GET /api/quiz/questions`
- `POST /api/quiz/sessions`
- `PATCH /api/quiz/sessions/:id/answers`
- `POST /api/quiz/sessions/:id/complete`
- `GET /api/quiz/sessions/:id/result`
- `GET /api/products/:id`

### Результат этапа
- Mini App сможет использовать готовую бизнес-логику
- API не дублирует Telegram-логику
- Контроллеры обращаются к services

---

## Этап 9 — Telegram Mini App

### Цель
Заменить текстовый режим красивым интерфейсом Mini App.

### Что делаем после готовности дизайна
- Создаём frontend в `miniapp/`
- Подключаем Telegram WebApp SDK
- Получаем `initData`
- Проверяем авторизацию на backend
- Выводим вопросы
- Отправляем ответы
- Показываем результат

### Результат этапа
- Пользователь проходит тест через Telegram Mini App
- Backend остаётся тем же
- Бизнес-логика не дублируется на фронте

---

## Этап 10 — Адаптация под MAX

### Цель
Адаптировать проект под MAX после уточнения платформы.

### Что делаем
- Изучаем API/SDK MAX
- Добавляем provider/adaptor
- Используем существующие services и API
- Добавляем `maxId` в `User`

### Результат этапа
- MAX использует существующую бизнес-логику
- Telegram и MAX не смешаны в одном коде