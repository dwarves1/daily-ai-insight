import { supabase, type NewsItem } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Sparkles } from 'lucide-react'
import NewsCard from '@/components/NewsCard'
import FilterBar from '@/components/FilterBar'

async function getNewsItems(): Promise<NewsItem[]> {
    const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('published_at', { ascending: false })
        .order('importance_score', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching news:', error)
        return []
    }

    return data || []
}

export const revalidate = 3600 // 1시간마다 재검증

export default async function HomePage() {
    const newsItems = await getNewsItems()
    const today = format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })

    return (
        <main className="min-h-screen bg-ai-darker">
            {/* Header */}
            <header className="border-b border-white/10 bg-ai-dark/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-ai-accent" />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient">
                                Today's AI Insights
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">{today}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <FilterBar initialItems={newsItems} />
            </div>

            {/* News Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
                {newsItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">
                            아직 수집된 뉴스가 없습니다. 😢
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            매일 오전 7시에 새로운 AI 뉴스가 업데이트됩니다.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1" id="news-container">
                        {newsItems.map((item) => (
                            <NewsCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-12">
                <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                        Powered by GPT-4o-mini & Supabase | Daily AI Insight © 2025
                    </p>
                </div>
            </footer>
        </main>
    )
}
