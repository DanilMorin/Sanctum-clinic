# Current State

## Project
Sanctum Clinic SPF Bot

## Current Stage
Stage 1. Basic Telegram Bot Bootstrap

## Current Goal
Start the app, read environment variables, initialize Telegram bot, and respond to /start.

## Done
- PRD.md created
- Architecture defined
- Project stages defined
- Technology stack selected
- Docker app container starts with Telegram bootstrap dependencies installed

## In Progress
- Creating basic backend structure
- Implementing Telegram bot bootstrap
- Verifying Docker Compose runtime for Stage 1

## Next Files To Create
- src/config/env.ts
- src/lib/logger.ts
- src/bot/telegram/index.ts
- src/bot/telegram/commands/start.command.ts
- src/index.ts

## Important Rules
- Do not add quiz logic yet
- Do not put business logic in Telegram handlers
- Keep architecture ready for Mini App and MAX
- Telegram bot should only handle input/output
