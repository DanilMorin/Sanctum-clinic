# Mini App

## Purpose

This folder contains the Telegram Mini App frontend for the SPF test.

The Mini App must stay simple:

- static HTML;
- CSS;
- vanilla JavaScript;
- no React/Vue at the MVP stage;
- no duplicated business logic.

## Screens

1. Welcome screen
2. Quiz screen with 5 questions
3. Result screen

## API

The Mini App uses backend API:

```txt
GET /api/quiz/questions
POST /api/quiz/sessions
PATCH /api/quiz/sessions/:id/answers
POST /api/quiz/sessions/:id/complete