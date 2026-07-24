# Production-упаковка

Проект запускается на одном сервере четырьмя Docker Compose-сервисами:

- `mysql` — база данных только во внутренней Docker-сети;
- `migrate` — одноразовое применение Prisma-миграций;
- `app` — REST API и Telegram-бот;
- `web` — собранная Mini App и внутренний reverse proxy к `app`.

Наружу публикуется только `127.0.0.1:8080`. На SpaceWeb уже установлен
системный Nginx с HTTPS, поэтому во время деплоя он будет направлен на этот
локальный порт. MySQL и Node.js API напрямую в интернет не публикуются.

## 1. Создание production-настроек

Windows PowerShell:

```powershell
Copy-Item .env.prod.example .env.prod
```

Linux:

```bash
cp .env.prod.example .env.prod
chmod 600 .env.prod
```

Заполните `.env.prod` реальными значениями. Файл игнорируется Git и не должен
попадать в репозиторий.

Обязательные особенности:

- `TELEGRAM_PROXY_URL` использует проверенный HTTP proxy;
- `WEB_APP_URL` содержит публичный HTTPS-адрес Mini App без завершающего `/`;
- хост MySQL в `DATABASE_URL` — `mysql`, не `localhost`;
- пароль внутри `DATABASE_URL` должен быть URL-кодирован, если содержит
  специальные символы.

## 2. Проверка конфигурации

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  config
```

В выводе не должно быть ошибок о незаданных переменных.

## 3. Сборка

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  build
```

Если старый Docker Desktop на Windows выдаёт ошибку Compose Bake, для одной
локальной проверки можно выполнить:

```powershell
$env:COMPOSE_BAKE = 'false'
```

На Ubuntu SpaceWeb это обычно не требуется.

## 4. Запуск

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  up -d
```

Сервис `migrate` должен успешно завершиться, после чего запустятся `app` и
`web`.

Проверка:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  ps

curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/api/quiz/questions
```

## 5. Первичное наполнение базы

На новой пустой базе один раз выполните:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  run --rm --no-deps migrate npx prisma db seed
```

Запускайте seed только на новой пустой базе. Текущая реализация перед заполнением
удаляет существующие сессии викторины, правила рекомендаций и продукты, поэтому
повторный запуск на рабочей базе приведёт к потере этих данных.

## 6. Логи

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  logs -f app web
```

В логе Telegram ожидается:

```text
Telegram bot started {"proxyEnabled":true}
```

Proxy URL, токен бота и пароли в логах выводиться не должны.

## 7. Обновление

```bash
git fetch origin main
git checkout main
git pull --ff-only origin main

docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  up -d --build
```

Prisma-миграции применяются автоматически перед запуском новой версии
приложения.

## 8. Остановка

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  down
```

Не добавляйте `-v`: этот параметр удалит volume с MySQL.

## 9. Резервное копирование

До test production достаточно настроить ежедневный dump MySQL и резервную
копию диска средствами SpaceWeb. Бэкап должен храниться в российской локации.

Пример ручного dump:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  exec -T mysql \
  sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  > sanctum-backup.sql
```

Файл dump содержит пользовательские данные и требует защищённого хранения.

## 10. Что настраивается во время деплоя на SpaceWeb

После загрузки проекта на сервер:

1. проверяем версии Docker и Compose;
2. создаём `/opt/sanctum-clinic` и `.env.prod`;
3. запускаем Compose;
4. находим действующий Nginx-конфиг домена `swtest.ru`;
5. заменяем стандартную страницу на proxy к `http://127.0.0.1:8080`;
6. проверяем HTTPS, Mini App, `/api` и `/health`;
7. указываем публичный URL Mini App в Telegram;
8. проходим полный тест и проверяем запись в MySQL.

Конфигурацию системного Nginx нельзя заменять вслепую: сначала необходимо
посмотреть пути действующего сертификата и текущий server block на SpaceWeb.
