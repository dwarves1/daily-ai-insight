# Daily AI Insight ✨

> 매일 아침 7시, AI 관련 핵심 뉴스를 3줄 요약으로 만나보세요.

**Daily AI Insight**는 GPT-4o-mini를 활용하여 주요 AI 뉴스를 자동으로 큐레이션하고, 타이포그래피 중심의 세련된 카드뉴스 형태로 제공하는 반응형 웹 애플리케이션입니다.

## 🎯 주요 기능

- 🤖 **AI 기반 큐레이션**: GPT-4o-mini가 매일 뉴스를 분석하여 중요도 기준 상위 10개 선정
- 📰 **자동 수집**: TechCrunch, OpenAI Blog, MIT Tech Review 등 주요 RSS 피드에서 실시간 수집
- 🎨 **타이포그래피 중심 디자인**: 이미지 없이 텍스트와 그라데이션만으로 구성된 세련된 UI
- 🔄 **자동 업데이트**: GitHub Actions로 매일 오전 7시 자동 실행
- 🏷️ **스마트 필터링**: 날짜 및 태그 기반 필터링 지원
- 📱 **완전 반응형**: 모바일부터 데스크톱까지 최적화된 UI

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Supabase JS Client**

### Backend
- **Python 3.11+**
- **OpenAI API** (GPT-4o-mini)
- **Feedparser** (RSS)
- **Supabase Python Client**

### Database
- **Supabase** (PostgreSQL)

### Automation
- **GitHub Actions**

## 📁 프로젝트 구조

```
daily-ai-insight/
├── frontend/              # Next.js 애플리케이션
│   ├── app/
│   │   ├── layout.tsx    # 루트 레이아웃
│   │   ├── page.tsx      # 메인 페이지
│   │   └── globals.css   # 글로벌 스타일
│   ├── components/
│   │   ├── NewsCard.tsx  # 뉴스 카드 컴포넌트
│   │   └── FilterBar.tsx # 필터 바 컴포넌트
│   └── lib/
│       └── supabase.ts   # Supabase 클라이언트
├── backend/               # Python AI Agent
│   ├── agent.py          # 메인 큐레이션 스크립트
│   ├── requirements.txt  # Python 의존성
│   └── .env.example      # 환경 변수 템플릿
├── database/
│   └── schema.sql        # Supabase 테이블 스키마
└── .github/workflows/
    └── daily_digest.yml  # 자동화 워크플로우
```

## 🚀 시작하기

### 1. 사전 요구사항

- Node.js 18+ 및 npm
- Python 3.11+
- Supabase 계정
- OpenAI API 키
- GitHub 계정 (자동화를 위한)

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `database/schema.sql` 파일 실행
3. Settings > API에서 다음 정보 확인:
   - Project URL
   - `anon` public key (Frontend용)
   - `service_role` key (Backend용)

### 3. Backend 설정

```bash
cd backend

# Python 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력
```

`.env` 파일 설정:
```env
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
```

### 4. 수동으로 Agent 실행 (테스트)

```bash
cd backend
python agent.py
```

성공하면 Supabase `news_items` 테이블에 10개의 뉴스가 저장됩니다.

### 5. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력
```

`.env.local` 파일 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 6. Frontend 실행

```bash
cd frontend
npm run dev
```

브라우저에서 http://localhost:3000 접속

## ⚙️ GitHub Actions 자동화 설정

### 1. GitHub Repository Secrets 설정

GitHub 리포지토리 > Settings > Secrets and variables > Actions에서 다음 Secrets 추가:

- `OPENAI_API_KEY`: OpenAI API 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_KEY`: Supabase service_role 키

### 2. 워크플로우 활성화

코드를 GitHub에 push하면 `.github/workflows/daily_digest.yml`이 자동으로 인식됩니다.

- **자동 실행**: 매일 오전 7시 (한국 시간)
- **수동 실행**: Actions 탭 > Daily AI News Digest > Run workflow

## 🌐 배포

### Vercel에 Frontend 배포 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. GitHub 리포지토리 연결
3. Root Directory를 `frontend`로 설정
4. Environment Variables에 `.env.local` 내용 추가
5. Deploy 클릭

**주의**: Backend는 GitHub Actions에서 실행되므로 별도 배포 불필요

## 📊 데이터베이스 스키마

```sql
news_items (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  summary JSONB NOT NULL,          -- ["요약1", "요약2", "요약3"]
  tags TEXT[] NOT NULL,             -- ["LLM", "NVIDIA", "Ethics"]
  original_url TEXT UNIQUE,
  importance_score INTEGER (1-10),
  published_at DATE,
  created_at TIMESTAMP
)
```

## 🎨 디자인 컨셉

**"이미지 없는 카드뉴스"**

- 다크 모드 기본 (`#0a0a0a` 배경)
- 그라데이션 카드 배경
- Space Grotesk (제목) + Inter (본문) 폰트
- 파스텔톤 태그 뱃지
- 체크 아이콘이 있는 3줄 요약
- 호버 애니메이션 및 반응형 레이아웃

## 🔧 트러블슈팅

### Backend 실행 시 RSS 피드를 가져오지 못함
- 인터넷 연결 확인
- RSS 피드 URL이 유효한지 확인
- Firewall 설정 확인

### Frontend에서 데이터가 보이지 않음
1. Supabase 테이블에 데이터가 있는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 환경 변수가 올바른지 확인

### GitHub Actions가 실행되지 않음
- Secrets이 올바르게 설정되었는지 확인
- 워크플로우 파일 경로가 정확한지 확인 (`.github/workflows/`)
- Actions 권한이 활성화되어 있는지 확인

## 🤝 기여

이슈 및 Pull Request는 언제나 환영합니다!

## 📄 라이선스

MIT License

## 🙏 Acknowledgments

- OpenAI GPT-4o-mini
- Supabase
- Next.js
- TechCrunch, MIT Technology Review, OpenAI Blog 등 RSS 피드 제공자

---

**Made with ❤️ for AI enthusiasts**
