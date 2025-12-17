-- Daily AI Insight Database Schema
-- Supabase PostgreSQL을 위한 테이블 생성 스크립트

-- news_items 테이블 생성
CREATE TABLE IF NOT EXISTS news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary JSONB NOT NULL,  -- ["요약1", "요약2", "요약3"] 형태의 배열
    tags TEXT[] NOT NULL,    -- ['LLM', 'NVIDIA', 'Ethics'] 형태의 배열
    original_url TEXT NOT NULL UNIQUE,  -- URL 기반 중복 방지
    importance_score INTEGER NOT NULL CHECK (importance_score >= 1 AND importance_score <= 10),
    published_at DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_importance_score ON news_items(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_items USING GIN(tags);

-- Row Level Security (RLS) 활성화
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정 (공개 데이터)
CREATE POLICY "Allow public read access" ON news_items
    FOR SELECT
    TO public
    USING (true);

-- 서비스 역할(Service Role)만 삽입/수정/삭제 가능
CREATE POLICY "Allow service role full access" ON news_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 코멘트 추가
COMMENT ON TABLE news_items IS 'AI 뉴스 큐레이션 데이터를 저장하는 테이블';
COMMENT ON COLUMN news_items.summary IS '3줄 요약을 담은 JSONB 배열';
COMMENT ON COLUMN news_items.tags IS '핵심 태그 배열 (최대 3개)';
COMMENT ON COLUMN news_items.importance_score IS '중요도 점수 (1-10)';
