CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id VARCHAR(64) NOT NULL DEFAULT 'anonymous',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
    original_text TEXT NOT NULL,
    detected_language VARCHAR(10) NOT NULL DEFAULT 'en',
    translated_text TEXT,
    confidence NUMERIC(4,3) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_feedbacks (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL,
    rating INTEGER NOT NULL, -- 1 to 5
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_language ON knowledge_documents(language);
