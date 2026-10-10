# 🌐 Multilingual Chat Assistant

> **Готовый к промышленной эксплуатации чат-ассистент реального времени, построенный на TypeScript, WebSockets, PostgreSQL и кросс-языковом RAG (Retrieval-Augmented Generation) с поддержкой 8+ языков.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-ws-orange.svg)](https://github.com/websockets/ws)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-29%2F29%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌐 Выбор языка / Language Selection
- 🇺🇿 [O'zbek tili (README.md)](README.md)
- 🇬🇧 [English (README.en.md)](README.en.md)
- 🇷🇺 [Русский (README.ru.md)](README.ru.md)

---

## 🌟 Ключевые возможности

1. **Мультиязычный диалоговый интеллект (8+ Языков):**
   - Автоматическое определение языка сообщения (`LanguageDetectorService`) с поддержкой узбекского (латиница и кириллица), русского, английского, испанского, немецкого, французского, турецкого и китайского языков.
   - Калиброванная оценка уверенности (`confidence score`) и генерация естественных локализованных ответов.
2. **WebSocket-шлюз реального времени:**
   - Высокоскоростное двунаправленное соединение (`ws://.../ws`).
   - Потоковая передача чанков (`chat:chunk`) и индикация набора текста (`typing:indicator`).
   - Управление сессиями и комнатами пользователей (`session:join`, `session:ready`).
3. **Кросс-языковой RAG (Поиск по базе знаний):**
   - Индексация документов и баз знаний FAQ.
   - Семантический поиск находит нужный контекст даже при несовпадении языка вопроса и языка документа, добавляя точные цитаты к ответам.
4. **PostgreSQL и In-Memory Fallback Режим:**
   - Реляционные таблицы: `chat_sessions`, `chat_messages`, `knowledge_documents`, `user_feedbacks`.
   - Встроенный механизм локального хранилища в оперативной памяти обеспечивает полную работоспособность приложения даже без запущенного сервера PostgreSQL.
5. **Современный веб-интерфейс:**
   - Удобный темный интерфейс на Tailwind CSS в `public/index.html`.
   - Выбор языка / автоопределение, быстрые шаблоны вопросов и живая анимация потокового вывода.
6. **REST API и аналитика:**
   - Эндпоинты проверки здоровья (`/health`), истории переписки, добавления знаний и глобальной аналитики (`/api/v1/analytics`).

---

## 🏛 Архитектура

```
multilingual-chat-assistant/
├── src/
│   ├── config/              # Конфигурация приложения (Порт, БД, Языки)
│   ├── database/            # Сервис PostgreSQL и fallback хранилище
│   ├── gateway/             # WebSocket шлюз и потоковая передача
│   ├── http/                # REST API и сервер статических файлов
│   ├── modules/
│   │   ├── chat/            # Оркестрация диалогов и память контекста
│   │   ├── language/        # Определение языка и перевод
│   │   └── rag/             # Индексация базы знаний и семантический поиск
│   ├── tests/               # 29 автоматизированных тестов
│   └── main.ts              # Точка входа и корректное завершение
├── public/                  # Веб-интерфейс (HTML5, Tailwind CSS)
├── Dockerfile               # Многоэтапный Dockerfile
├── docker-compose.yml       # Стек приложения и PostgreSQL
└── package.json             # Скрипты и зависимости
```

---

## 🚀 Установка и запуск

### 1. Требования
- Node.js 20.x или выше
- npm или yarn

### 2. Локальный запуск
```bash
# Клонирование репозитория
git clone https://github.com/afzalbek-dev/multilingual-chat-assistant.git
cd multilingual-chat-assistant

# Установка зависимостей
npm install

# Компиляция TypeScript
npm run build

# Настройка переменных окружения
cp .env.example .env

# Запуск сервера
npm start
```

Веб-клиент: `http://localhost:3000`  
WebSocket эндпоинт: `ws://localhost:3000/ws`  
Проверка здоровья: `http://localhost:3000/health`

---

## 🐳 Запуск через Docker

Запуск приложения вместе с контейнером PostgreSQL:
```bash
docker-compose up -d --build
```

---

## 📡 Эндпоинты REST API

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/health` | Статус сервиса и количество активных WebSocket подключений |
| `GET` | `/api/v1/sessions` | Список активных сессий чата |
| `GET` | `/api/v1/sessions/:id/messages` | История сообщений конкретной сессии |
| `POST` | `/api/v1/chat` | Отправка сообщения и получение ответа через REST |
| `GET` | `/api/v1/knowledge` | Поиск или получение списка документов базы знаний |
| `POST` | `/api/v1/knowledge` | Добавление нового документа в базу знаний |
| `GET` | `/api/v1/analytics` | Сводная аналитика и статистика по языкам |

---

## 🧪 Тестирование

Запуск полного набора тестов:
```bash
npm test
```

Результат:
```
ℹ tests 29
ℹ suites 6
ℹ pass 29
ℹ fail 0
ℹ duration_ms 1456.85
```

---

## 📄 Лицензия
Проект распространяется под свободной лицензией [MIT](LICENSE).
