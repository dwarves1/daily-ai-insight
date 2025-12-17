#!/usr/bin/env python3
"""
Daily AI Insight - AI 뉴스 큐레이션 에이전트
매일 주요 AI RSS 피드를 수집하고 GPT-4o-mini로 분석하여 상위 10개를 선정합니다.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dotenv import load_dotenv
import feedparser
import requests
from openai import OpenAI
from supabase import create_client, Client
from dateutil import parser as date_parser

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 환경 변수 로드
load_dotenv()

# 클라이언트 초기화
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# RSS 피드 소스 (AI 관련 주요 매체)
RSS_FEEDS = [
    {
        'name': 'TechCrunch AI',
        'url': 'https://techcrunch.com/category/artificial-intelligence/feed/'
    },
    {
        'name': 'OpenAI Blog',
        'url': 'https://openai.com/blog/rss.xml'
    },
    {
        'name': 'MIT Technology Review AI',
        'url': 'https://www.technologyreview.com/topic/artificial-intelligence/feed'
    },
    {
        'name': 'Ars Technica AI',
        'url': 'https://feeds.arstechnica.com/arstechnica/technology-lab'
    },
    {
        'name': 'AI News',
        'url': 'https://www.artificialintelligence-news.com/feed/'
    },
    {
        'name': 'VentureBeat – AI Section',
        'url': 'https://venturebeat.com/category/ai/feed/'
    },
    {
        'name': 'Google AI Blog',
        'url': 'https://blog.google/technology/ai/rss/'
    },
    {
        'name': 'Artificial Intelligence (cs.AI)',
        'url': 'https://export.arxiv.org/rss/cs.AI'
    }
]


def fetch_rss_feeds(hours_ago: int = 24) -> List[Dict]:
    """
    RSS 피드에서 최근 기사를 가져옵니다.
    
    Args:
        hours_ago: 최근 몇 시간 내의 기사를 가져올지 (기본값: 24시간)
    
    Returns:
        기사 딕셔너리 리스트
    """
    cutoff_time = datetime.now() - timedelta(hours=hours_ago)
    all_articles = []
    
    logger.info(f"Fetching RSS feeds from {len(RSS_FEEDS)} sources...")
    
    for feed_info in RSS_FEEDS:
        try:
            logger.info(f"Parsing {feed_info['name']}...")
            feed = feedparser.parse(feed_info['url'])
            
            for entry in feed.entries:
                try:
                    # 날짜 파싱 (여러 형식 시도)
                    published_date = None
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        published_date = datetime(*entry.published_parsed[:6])
                    elif hasattr(entry, 'published'):
                        published_date = date_parser.parse(entry.published)
                    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                        published_date = datetime(*entry.updated_parsed[:6])
                    
                    # 최근 24시간 내 기사만 필터링
                    if published_date and published_date >= cutoff_time:
                        # 본문 추출 (summary 또는 content 사용)
                        content = ''
                        if hasattr(entry, 'summary'):
                            content = entry.summary
                        elif hasattr(entry, 'content'):
                            content = entry.content[0].value if entry.content else ''
                        
                        article = {
                            'title': entry.title,
                            'url': entry.link,
                            'content': content[:2000],  # 최대 2000자로 제한
                            'published_date': published_date,
                            'source': feed_info['name']
                        }
                        all_articles.append(article)
                        logger.info(f"  ✓ {entry.title[:50]}...")
                        
                except Exception as e:
                    logger.warning(f"  ✗ Error parsing entry: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error fetching {feed_info['name']}: {e}")
            continue
    
    logger.info(f"Total articles collected: {len(all_articles)}")
    return all_articles


def analyze_with_gpt(article: Dict) -> Optional[Dict]:
    """
    GPT-4o-mini를 사용하여 기사를 분석합니다.
    
    Args:
        article: 기사 정보 딕셔너리
    
    Returns:
        분석 결과 (요약, 태그, 점수) 또는 None
    """
    system_prompt = """너는 IT 전문 에디터이자 AI 트렌드 분석가다.
주어진 AI 관련 기사를 읽고 다음 정보를 JSON 형식으로 출력하라:

1. title: 기사 제목을 자연스러운 한국어로 번역 (원제의 의미를 최대한 살림)
2. summary: 한국어로 작성된 3줄 요약 (각 줄은 완전한 문장, 배열 형태)
3. tags: 핵심 키워드 3개 (영어 또는 한국어, 배열 형태)
4. importance_score: 1~10점 (AI 업계 영향도 기준)

평가 기준:
- 기술 혁신성: 새로운 모델, 알고리즘, 서비스 출시
- 산업 영향도: 주요 기업 동향, 시장 변화
- 사회적 파급력: 윤리, 규제, 광범위한 영향

JSON 형식:
{
  "title": "한국어로 번역된 제목",
  "summary": ["요약 문장 1", "요약 문장 2", "요약 문장 3"],
  "tags": ["태그1", "태그2", "태그3"],
  "importance_score": 8
}

9-10점: 업계 판도를 바꿀 초대형 뉴스 (예: ChatGPT 출시급)
7-8점: 주요 기업의 중요한 발표, 규제 변화
5-6점: 주목할 만한 기술 개선, 서비스 업데이트
3-4점: 소소한 업데이트, 보도자료성 뉴스
1-2점: 미미한 영향
🎯 실제 작동 방식
GPT가 기사 분석: 제목, 본문, 출처를 종합적으로 평가
3가지 기준 적용: 혁신성 + 영향도 + 파급력을 종합
1-10점 스코어링: 객관적 기준에 따라 점수 부여
상위 10개 선정: 점수 기준 내림차순 정렬
"""
    
    user_prompt = f"""기사 제목: {article['title']}

기사 내용:
{article['content']}

출처: {article['source']}"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=500
        )
        
        analysis = json.loads(response.choices[0].message.content)
        
        # 유효성 검증
        if not all(key in analysis for key in ['title', 'summary', 'tags', 'importance_score']):
            logger.warning(f"Invalid analysis format for {article['title']}")
            return None
        
        if len(analysis['summary']) != 3:
            logger.warning(f"Summary should have exactly 3 items for {article['title']}")
            return None
        
        if not (1 <= analysis['importance_score'] <= 10):
            logger.warning(f"Invalid importance_score for {article['title']}")
            return None
        
        logger.info(f"  Analyzed: {article['title'][:50]}... (Score: {analysis['importance_score']})")
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing article {article['title']}: {e}")
        return None


def select_top_articles(articles: List[Dict], limit: int = 5) -> List[Dict]:
    """
    GPT 분석 결과를 바탕으로 상위 기사를 선정합니다.
    
    Args:
        articles: 분석된 기사 리스트
        limit: 선정할 기사 수
    
    Returns:
        상위 기사 리스트
    """
    logger.info(f"Analyzing {len(articles)} articles with GPT-4o-mini...")
    
    analyzed_articles = []
    
    for article in articles:
        analysis = analyze_with_gpt(article)
        if analysis:
            # 원본 영어 제목 보존
            original_title = article['title']
            analyzed_articles.append({
                **article,
                **analysis,
                'original_title': original_title  # 원본 제목 보존
            })
    
    # 중요도 점수로 정렬하여 상위 선정
    top_articles = sorted(
        analyzed_articles,
        key=lambda x: x['importance_score'],
        reverse=True
    )[:limit]
    
    logger.info(f"Selected top {len(top_articles)} articles")
    return top_articles


def save_to_supabase(articles: List[Dict]) -> int:
    """
    선정된 기사를 Supabase에 저장합니다.
    
    Args:
        articles: 저장할 기사 리스트
    
    Returns:
        저장된 기사 수
    """
    logger.info(f"Saving {len(articles)} articles to Supabase...")
    
    saved_count = 0
    
    for article in articles:
        try:
            # 데이터 준비
            data = {
                'title': article.get('title', article.get('original_title', 'Untitled')),  # GPT가 번역한 한국어 제목 사용
                'summary': article['summary'],  # JSONB 배열
                'tags': article['tags'],  # TEXT[] 배열
                'original_url': article['url'],
                'importance_score': article['importance_score'],
                'published_at': article['published_date'].strftime('%Y-%m-%d')
            }
            
            # Upsert (URL 기준 중복 방지)
            result = supabase.table('news_items').upsert(
                data,
                on_conflict='original_url'
            ).execute()
            
            saved_count += 1
            logger.info(f"  ✓ Saved: {article['title'][:50]}...")
            
        except Exception as e:
            logger.error(f"  ✗ Error saving article {article['title']}: {e}")
            continue
    
    logger.info(f"Successfully saved {saved_count}/{len(articles)} articles")
    return saved_count


def main():
    """메인 실행 함수"""
    logger.info("=" * 80)
    logger.info("Daily AI Insight - News Curation Agent")
    logger.info("=" * 80)
    
    try:
        # 1. RSS 피드 수집
        articles = fetch_rss_feeds(hours_ago=24)
        
        if not articles:
            logger.warning("No articles found in the last 24 hours")
            return
        
        # 2. GPT 분석 및 상위 10개 선정
        top_articles = select_top_articles(articles, limit=10)
        
        if not top_articles:
            logger.warning("No articles passed the analysis")
            return
        
        # 3. Supabase에 저장
        saved_count = save_to_supabase(top_articles)
        
        logger.info("=" * 80)
        logger.info(f"✅ Curation complete! {saved_count} articles saved.")
        logger.info("=" * 80)
        
        # 결과 요약 출력
        for i, article in enumerate(top_articles, 1):
            logger.info(f"{i}. {article['title']}")
            logger.info(f"   Score: {article['importance_score']}, Tags: {', '.join(article['tags'])}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise


if __name__ == '__main__':
    main()
