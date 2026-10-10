# 🌐 Multilingual Chat Assistant

> **Production-ready real-time chat assistant built with TypeScript, WebSockets, PostgreSQL, and cross-lingual RAG (Retrieval-Augmented Generation) across 8+ languages.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-ws-orange.svg)](https://github.com/websockets/ws)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-29%2F29%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌐 Language Selection
- 🇺🇿 [O'zbek tili (README.md)](README.md)
- 🇬🇧 [English (README.en.md)](README.en.md)
- 🇷🇺 [Русский (README.ru.md)](README.ru.md)

---

## 🌟 Key Features

1. **Multilingual AI Intelligence (8+ Languages):**
   - Automated language identification (`LanguageDetectorService`) supporting Uzbek (Latin & Cyrillic), Russian, English, Spanish, German, French, Turkish, and Chinese.
   - Calibrated confidence scoring and contextually fluent localized responses.
2. **Real-Time WebSocket Gateway:**
   - Low-latency bi-directional connection (`ws://.../ws`).
   - Token streaming chunks (`chat:chunk`) and typing indicators (`typing:indicator`).
   - Seamless room and conversation session management (`session:join`, `session:ready`).
3. **Cross-Lingual RAG Knowledge Retrieval:**
   - Ingests and indexes enterprise documents and FAQ knowledge bases.
   - Cross-lingual semantic retrieval surfaces relevant information regardless of query language and attaches citations to responses.
4. **PostgreSQL & In-Memory Resilient Persistence:**
   - PostgreSQL schema with tables: `chat_sessions`, `chat_messages`, `knowledge_documents`, `user_feedbacks`.
   - Embedded memory storage fallback ensures uninterrupted operation even without an active PostgreSQL instance.
5. **Modern Interactive Web UI:**
   - Clean, dark-mode Tailwind CSS interface in `public/index.html`.
   - Language switch dropdown, quick prompt suggestions, and real-time streaming bubbles.
6. **REST API & Telemetry Analytics:**
   - Health check probe (`/health`), conversation transcripts, knowledge base publishing, and usage analytics (`/api/v1/analytics`).

---

## 🏛 Architecture

```
multilingual-chat-assistant/
├── src/
│   ├── config/              # App configuration (Port, Database, Languages)
│   ├── database/            # PostgreSQL client and in-memory fallback
│   ├── gateway/             # WebSocket server with chunk streaming
│   ├── http/                # REST endpoints and static UI file server
│   ├── modules/
│   │   ├── chat/            # Core chat orchestration & conversation memory
│   │   ├── language/        # Multilingual detection and translation
│   │   └── rag/             # Knowledge base index and semantic search
│   ├── tests/               # 29 automated node:test specifications
│   └── main.ts              # Server bootstrap and graceful shutdown
├── public/                  # Responsive web client (HTML5, Tailwind)
├── Dockerfile               # Multi-stage production container
├── docker-compose.yml       # App + PostgreSQL container orchestration
└── package.json             # Build scripts and dependencies
```

---

## 🚀 Installation & Getting Started

### 1. Requirements
- Node.js 20.x or higher
- npm or yarn

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/afzalbek-dev/multilingual-chat-assistant.git
cd multilingual-chat-assistant

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Configure environment variables
cp .env.example .env

# Start application server
npm start
```

Web Interface: `http://localhost:3000`  
WebSocket Endpoint: `ws://localhost:3000/ws`  
Health Check: `http://localhost:3000/health`

---

## 🐳 Docker Deployment

Run both the application and PostgreSQL in containers:
```bash
docker-compose up -d --build
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and active WebSocket connections |
| `GET` | `/api/v1/sessions` | List active chat sessions |
| `GET` | `/api/v1/sessions/:id/messages` | Retrieve conversation message history |
| `POST` | `/api/v1/chat` | Send a message and receive an AI response |
| `GET` | `/api/v1/knowledge` | Query or list knowledge documents |
| `POST` | `/api/v1/knowledge` | Ingest a new document into the knowledge base |
| `GET` | `/api/v1/analytics` | Telemetry metrics and language distributions |

---

## 🧪 Testing & Verification

Run the complete test suite:
```bash
npm test
```

Results:
```
ℹ tests 29
ℹ suites 6
ℹ pass 29
ℹ fail 0
ℹ duration_ms 1456.85
```

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
