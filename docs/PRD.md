# PRD: Sanctum Clinic SPF Bot

## 1. Project Summary

Sanctum Clinic SPF Bot is a Telegram bot for selecting a personalized SPF product based on a short questionnaire.

The user answers 5 questions. The backend determines the priority skin feature, finds a matching recommendation in the database, and returns the result.

The first version works as a regular Telegram bot with text messages and inline buttons. Later, a Telegram Mini App will be added. After the Telegram version is complete, the project should be adapted for MAX.

## 2. Current Development Goal

Build the backend architecture and Telegram bot logic in a way that allows a future Mini App to use the same business logic and database.

Important principle:

Telegram bot, Mini App API, and future MAX integration must not duplicate business logic.

Target architecture:

```txt
Telegram Bot ─┐
              ├── Services ─── Repositories ─── Prisma ─── MySQL
Mini App API ─┘

Future MAX ───┘
```

## 3. Technology Stack

* Backend: Node.js + TypeScript
* ORM: Prisma
* Database: MySQL
* Telegram library: telegraf-hardened
* Local/deploy environment: Docker Compose
* Database UI: phpMyAdmin
* Future frontend: Telegram Mini App
* Future channel: MAX

## 4. Project Structure

```txt
Sanctum-clinic/
├── docs/
│   └── PRD.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── index.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── bot/
│   │   ├── telegram/
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   │   └── start.command.ts
│   │   │   ├── handlers/
│   │   │   │   ├── quiz.handler.ts
│   │   │   │   └── callback.handler.ts
│   │   │   ├── keyboards/
│   │   │   │   └── quiz.keyboard.ts
│   │   │   ├── presenters/
│   │   │   │   └── result.presenter.ts
│   │   │   └── middlewares/
│   │   │       └── user.middleware.ts
│   │   └── max/
│   │       └── README.md
│   ├── api/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── dto/
│   ├── services/
│   ├── repositories/
│   ├── domain/
│   ├── lib/
│   └── utils/
├── miniapp/
├── tests/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 5. Environment Variables

Required `.env` variables:

```env
BOT_TOKEN=your_telegram_bot_token
BOT_ENABLED=true
TELEGRAM_PROXY_URL=
ADMIN_CHAT_ID=your_admin_chat_id
WEB_APP_URL=https://your-domain-or-tunnel-url

DATABASE_URL="mysql://leadbot:leadbot_password@mysql:3306/leadbot"
SHADOW_DATABASE_URL="mysql://leadbot:leadbot_password@mysql:3306/leadbot_shadow"

API_PORT=3000

MYSQL_DATABASE=leadbot
MYSQL_SHADOW_DATABASE=leadbot_shadow
MYSQL_USER=leadbot
MYSQL_PASSWORD=leadbot_password
MYSQL_ROOT_PASSWORD=root_password

PHPMYADMIN_PORT=8080
```

## 6. User Flow

### Step 0. Start

User sends:

```txt
/start
```

Bot shows:

```txt
Персонализированный подбор SPF от врача-дерматолога

Ответьте на 5 коротких вопросов — и получите персональную рекомендацию, подобранную с учётом особенностей вашей кожи.
```

Button:

```txt
Начать подбор
```

### Step 1. Skin Type

Single choice.

Options:

* Жирная — блеск, расширенные поры
* Комбинированная — жирная Т-зона, нормальные щёки
* Сухая — ощущение стянутости, шелушение

### Step 2. Skin Features

Multiple choice.

Options:

* Акне / высыпания
* Розацеа
* Купероз
* Пигментация
* Чувствительная / раздражённая
* Без особенностей

Selection rule:

* If `Без особенностей` is selected, all other options are cleared.
* If any other option is selected, `Без особенностей` is cleared.

### Step 3. Lifestyle

Single choice.

Options:

* Активный — спорт, много времени на улице, важна стойкость
* Обычный — город, офис, стандартный ритм

### Step 4. SPF Usage

Single choice.

Options:

* Как база под макияж — важна лёгкая текстура, незаметность на коже
* Как самостоятельный уход — без макияжа или поверх других средств

Note:

This answer is saved but does not affect the MVP recommendation rule yet.

### Step 5. Product Format

Single choice.

Options:

* Аптечная косметика
* Профессиональная косметика
* Рассмотрю оба варианта

## 7. Recommendation Logic

### 7.1 Priority Feature

If the user selected several skin features, the system must select one priority feature.

Priority order:

```txt
Купероз
Розацеа
Пигментация
Акне / высыпания
Чувствительная / раздражённая
Без особенностей
```

Example:

If the user selected `Акне / высыпания` and `Купероз`, the recommendation must be based on `Купероз`.

### 7.2 Recommendation Rule Lookup

The recommendation is selected by:

```txt
skinType + priorityFeature + lifestyle
```

If a rule has `lifestyle = any`, it matches both lifestyle options.

### 7.3 Result Filtering by Product Format

If user selected `Аптечная косметика`:

* show main pharmacy recommendation;
* show pharmacy alternatives if available;
* do not show professional product.

If user selected `Профессиональная косметика`:

* show only professional product;
* do not show pharmacy recommendation;
* do not show alternatives.

If user selected `Рассмотрю оба варианта`:

* show main pharmacy recommendation;
* show alternatives if available;
* show professional product.

## 8. Result Screen

The result must include:

* user answer summary;
* selected priority skin feature;
* explanation of why this feature was selected;
* main recommendation card;
* alternatives card if available and allowed;
* professional recommendation card if allowed;
* disclaimer.

Always show disclaimer:

```txt
Если вы беременны, кормите грудью или принимаете системные ретиноиды, перед использованием солнцезащитного средства проконсультируйтесь с вашим врачом.
```

## 9. Final Card

After the result, the bot may show an additional informational card:

```txt
Солнцезащитные средства, особенно плотные формулы, важно правильно смывать. Остатки SPF могут забивать поры и снижать эффективность ухода.
```

Later, this block can include:

* SPF cleansing advice;
* two-step cleansing explanation;
* HydraFacial information.

## 10. Database Models

Required models:

```txt
User
QuizSession
Product
RecommendationRule
RecommendationAlternative
```

### User

Stores Telegram/MAX user identity.

Important fields:

```txt
id
telegramId
maxId
username
firstName
lastName
createdAt
updatedAt
```

### QuizSession

Stores one test attempt.

Important fields:

```txt
id
userId
status
skinType
skinFeatures
priorityFeature
lifestyle
spfUsage
productFormat
recommendationRuleId
startedAt
completedAt
createdAt
updatedAt
```

### Product

Stores SPF product information.

Important fields:

```txt
id
name
brand
category
spf
texture
isMakeupBase
description
doctorComment
imageUrl
createdAt
updatedAt
```

### RecommendationRule

Stores matching logic.

Important fields:

```txt
id
skinType
priorityFeature
lifestyle
mainProductId
professionalProductId
createdAt
updatedAt
```

### RecommendationAlternative

Stores alternative products for a recommendation rule.

Important fields:

```txt
id
recommendationRuleId
productId
sortOrder
createdAt
updatedAt
```

## 11. Development Stages

### Stage 1. Basic Telegram Bot Bootstrap

Goal:

Start the app, read environment variables, initialize Telegram bot, and respond to `/start`.

Files:

```txt
src/config/env.ts
src/lib/logger.ts
src/bot/telegram/index.ts
src/bot/telegram/commands/start.command.ts
src/index.ts
```

Expected result:

```txt
/start → welcome message + "Начать подбор" button
```

### Stage 2. Quiz Domain

Goal:

Create types, constants, questions, options, and pure quiz rules.

Files:

```txt
src/domain/quiz/quiz.types.ts
src/domain/quiz/quiz.constants.ts
src/domain/quiz/quiz.rules.ts
```

Expected result:

```txt
The project has one source of truth for quiz questions and answer rules.
```

### Stage 3. Prisma Database Schema

Goal:

Finalize Prisma schema and apply migration.

Files:

```txt
prisma/schema.prisma
```

Expected result:

```txt
MySQL contains all required tables.
Tables are visible in phpMyAdmin.
```

### Stage 4. Repositories

Goal:

Create a database access layer. Services must not use Prisma directly.

Files:

```txt
src/repositories/user.repository.ts
src/repositories/quiz-session.repository.ts
src/repositories/product.repository.ts
src/repositories/recommendation-rule.repository.ts

Repositories:

UserRepository — finds and upserts Telegram/MAX users.
QuizSessionRepository — creates quiz sessions, saves answers, completes sessions, finds active/latest sessions.
ProductRepository — reads SPF product data.
RecommendationRuleRepository — finds matching recommendation rules by skinType + priorityFeature + lifestyle, with fallback to lifestyle = any.

Acceptance criteria:

1. All repository files are implemented.
2. Repositories import Prisma only from src/lib/prisma.ts.
3. Services will be able to work with repositories instead of Prisma.
4. npm run build passes without TypeScript errors.

### Stage 5. Services

Goal:

Implement business logic layer. Services must not depend on Telegram handlers or API controllers.

Files:

```txt
src/services/user.service.ts
src/services/quiz.service.ts
src/services/recommendation.service.ts
src/services/product.service.ts
Important rules:

Services can use repositories.
Services must not use Telegram-specific objects.
Services must not receive ctx from Telegraf.
Services must not contain UI text for Telegram.
Recommendation calculation must be testable without Telegram.

Acceptance criteria:

1. UserService can upsert Telegram user.
2. QuizService can start a quiz session.
3. QuizService can save all 5 answers.
4. QuizService can complete a quiz session.
5. RecommendationService can find a matching rule by skinType + priorityFeature + lifestyle.
6. RecommendationService falls back to lifestyle = any through repository.
7. RecommendationService filters result by productFormat.
8. npm run build passes without TypeScript errors.

### Stage 6. Telegram Text/Button Quiz

Goal:

Implement the full 5-step quiz flow in Telegram using inline buttons.

Files:

```txt
src/bot/telegram/handlers/quiz.handler.ts
src/bot/telegram/handlers/callback.handler.ts
src/bot/telegram/keyboards/quiz.keyboard.ts
src/bot/telegram/presenters/result.presenter.ts
src/bot/telegram/index.ts

Flow:

/start
→ welcome message
→ "Начать подбор"
→ Step 1: skin type
→ Step 2: skin features with multiple choice
→ Step 3: lifestyle
→ Step 4: SPF usage
→ Step 5: product format
→ temporary profile result

Important:

At this stage, the database seed with real products and recommendation rules is not implemented yet. Therefore, after the final step the bot shows a temporary saved user profile instead of a real SPF recommendation.

Acceptance criteria:

1. User can start the quiz from Telegram.
2. User is saved to the users table.
3. New quiz session is created.
4. User can answer all 5 questions.
5. Step 2 supports multiple selection.
6. "Без особенностей" clears other selected features.
7. Selecting any other feature clears "Без особенностей".
8. Answers are saved to quiz_sessions.
9. Temporary result is shown after step 5.
10. "Пройти заново" starts a new quiz session.
11. npm run build passes without TypeScript errors.

### Stage 7. Seed Data

Goal:

Fill database with SPF products and recommendation rules.

Files:

```txt
prisma/seed.ts
```

Expected result:

```txt
Bot returns real recommendations from the database.
```

### Stage 8. Mini App API

Goal:

Expose backend endpoints for future Mini App.

Files:

```txt
src/api/index.ts
src/api/routes/quiz.routes.ts
src/api/routes/product.routes.ts
src/api/controllers/quiz.controller.ts
src/api/controllers/product.controller.ts
src/api/dto/quiz.dto.ts
src/api/dto/result.dto.ts
```

Expected API:

```txt
GET /api/quiz/questions
POST /api/quiz/sessions
PATCH /api/quiz/sessions/:id/answers
POST /api/quiz/sessions/:id/complete
GET /api/quiz/sessions/:id/result
GET /api/products/:id
```

### Stage 9. Telegram Mini App

Goal:

Build frontend after design is ready.

Location:

```txt
miniapp/
```

Expected result:

```txt
The user completes the quiz through Telegram Mini App.
```

### Stage 10. MAX Adaptation

Goal:

Adapt the project to MAX after platform details are clarified.

Location:

```txt
src/bot/max/
```

Expected result:

```txt
The same quiz and recommendation logic works through MAX.
```

## 12. Important Development Rules

1. Do not put business logic inside Telegram handlers.
2. Telegram handlers should only receive user actions and call services.
3. Mini App API must use the same services as Telegram bot.
4. Recommendation logic must be testable without Telegram.
5. Product and recommendation data must be stored in MySQL.
6. The bot must work without Mini App during MVP.
7. The `.env` file must not be committed to Git.
8. `.env.example` must contain all required variables.
9. phpMyAdmin is used only for local database inspection and manual editing.
10. MAX integration must remain isolated until platform details are clarified.

## 13. Immediate Next Stage

Start with:

```txt
Stage 1. Basic Telegram Bot Bootstrap
```

Implement:

```txt
src/config/env.ts
src/lib/logger.ts
src/bot/telegram/index.ts
src/bot/telegram/commands/start.command.ts
src/index.ts
```

Acceptance criteria:

```txt
1. App starts with npm run dev or docker compose up.
2. If BOT_ENABLED=true, Telegram bot starts.
3. If BOT_ENABLED=false, Telegram bot does not start.
4. Bot responds to /start.
5. Bot sends welcome text.
6. Bot shows inline button "Начать подбор".
7. No quiz logic is implemented at this stage.
```
