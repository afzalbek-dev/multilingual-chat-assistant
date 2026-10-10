# 🌐 Multilingual Chat Assistant

> **TypeScript, WebSockets, PostgreSQL va kross-lingval RAG (Retrieval-Augmented Generation) asosida qurilgan, 8+ tilda real vaqtda aqlli suhbat olib boruvchi production-tayyor chat yordamchisi platformasi.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![WebSockets](https://img.shields.io/badge/WebSockets-ws-orange.svg)](https://github.com/websockets/ws)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg-blue.svg)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-29%2F29%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌐 Tillarni tanlash / Language Selection
- 🇺🇿 [O'zbek tili (README.md)](README.md)
- 🇬🇧 [English (README.en.md)](README.en.md)
- 🇷🇺 [Русский (README.ru.md)](README.ru.md)

---

## 🌟 Asosiy Imkoniyatlar

1. **Ko'p Tilli AI Muloqot (8+ Tilda):**
   - O'zbekcha (Lotin va Kirill), Inglizcha, Ruscha, Ispancha, Nemischa, Fransuzcha, Turkcha va Xitoycha tillarini avtomatik aniqlash (`LanguageDetectorService`).
   - Til bo'yicha ishonchlilik koeffitsienti (`confidence score`) va avtomatik moslashtirilgan javoblar.
2. **Real Vaqt Rejimida WebSockets Gateway:**
   - Tezkor ikki tomonlama muloqot (`ws://.../ws`).
   - Xabarlarni oqimli uzatish (`chat:chunk` streaming) va yozish indikatori (`typing:indicator`).
   - Xona va sessiyalarni boshqarish (`session:join`, `session:ready`).
3. **Kross-Lingval RAG (Bilimlar Bazasi Qidiruvi):**
   - Hujjatlar va ma'lumotnomalar orqali semantik qidiruv.
   - Foydalanuvchi boshqa tilda savol bersa ham, kerakli bilimlar bazasi maqolalarini topib, javobga iqtibos (`citation snippet`) sifatida qo'shib beradi.
4. **PostgreSQL va In-Memory Fallback Bazas:**
   - PostgreSQL orqali to'liq ma'lumotlar saqlanishi (`chat_sessions`, `chat_messages`, `knowledge_documents`, `user_feedbacks`).
   - Agar tashqi PostgreSQL ulanmagan bo'lsa, xizmat uzluksiz ishlashini ta'minlovchi xotira ombori (`in-memory fallback`).
5. **Zamonaviy Web Interfeys:**
   - `public/index.html` da joylashgan Tailwind CSS bilan bezatilgan chiroyli chat interfeysi.
   - Tilni tanlash yoki avtomatik aniqlash tugmasi, tayyor tezkor savollar, fikr-mulohaza (`feedback`) yuborish.
6. **REST API & Tahliliy Dashboard:**
   - Salomatlik tekshiruvi (`/health`), suhbatlar tarixi, bilimlar bazasiga yangi maqola qo'shish va global tahlil (`/api/v1/analytics`).

---

## 🏛 Arxitektura

```
multilingual-chat-assistant/
├── src/
│   ├── config/              # Muhit sozlamalari (Port, DB, Tillar)
│   ├── database/            # PostgreSQL servisi va In-Memory ombor
│   ├── gateway/             # WebSocket shlyuzi va oqimli uzatish
│   ├── http/                # REST API va statik UI serveri
│   ├── modules/
│   │   ├── chat/            # Suhbat xizmati va kontekst boshqaruvi
│   │   ├── language/        # Tilni aniqlash va tarjima qilish
│   │   └── rag/             # Bilimlar bazasi va semantik qidiruv
│   ├── tests/               # 29 ta avtomatlashtirilgan testlar
│   └── main.ts              # Dasturni ishga tushirish (Bootstrap)
├── public/                  # Veb mijoz (index.html, Tailwind CSS)
├── Dockerfile               # Ko'p bosqichli Docker fayli
├── docker-compose.yml       # Docker Compose (Ilova + PostgreSQL)
└── package.json             # Loyiha konfiguratsiyasi
```

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Talablar
- Node.js 20.x yoki undan yuqori
- npm yoki yarn

### 2. Mahalliy o'rnatish
```bash
# Repozitoriyni klonlash
git clone https://github.com/afzalbek-dev/multilingual-chat-assistant.git
cd multilingual-chat-assistant

# Bog'liqliklarni o'rnatish
npm install

# TypeScript'ni kompilyatsiya qilish
npm run build

# Muhit o'zgaruvchilarini sozlash
cp .env.example .env

# Serverni ishga tushirish
npm start
```

Veb interfeys: `http://localhost:3000`  
WebSocket havolasi: `ws://localhost:3000/ws`  
Salomatlik holati: `http://localhost:3000/health`

---

## 🐳 Docker orqali ishga tushirish

Ilova va PostgreSQL bazasini birgalikda ishga tushirish:
```bash
docker-compose up -d --build
```

---

## 📡 REST API Yo'nalishlari

| Usul | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/health` | Xizmat holati va WebSocket ulanishlari soni |
| `GET` | `/api/v1/sessions` | Suhbat sessiyalari ro'yxati |
| `GET` | `/api/v1/sessions/:id/messages` | Sessiya xabarlari tarixi |
| `POST` | `/api/v1/chat` | REST orqali savol yuborish va javob olish |
| `GET` | `/api/v1/knowledge` | Bilimlar bazasi maqolalarini olish / qidirish |
| `POST` | `/api/v1/knowledge` | Bilimlar bazasiga yangi maqola qo'shish |
| `GET` | `/api/v1/analytics` | Tillar bo'yicha statistika va xabarlar soni |

---

## 🧪 Sinovlar (Testing)

Barcha testlarni ishga tushirish:
```bash
npm test
```

Natija:
```
ℹ tests 29
ℹ suites 6
ℹ pass 29
ℹ fail 0
ℹ duration_ms 1456.85
```

---

## 📄 Litsenziya
Ushbu loyiha [MIT Litsenziyasi](LICENSE) asosida taqdim etiladi.
