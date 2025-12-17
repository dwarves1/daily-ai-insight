'use client'

import { useState, useMemo } from 'react'
import { type NewsItem } from '@/lib/supabase'
import { Calendar, Tag } from 'lucide-react'

interface FilterBarProps {
    initialItems: NewsItem[]
}

export default function FilterBar({ initialItems }: FilterBarProps) {
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTag, setSelectedTag] = useState<string>('')

    // 모든 고유 태그 추출
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        initialItems.forEach(item => {
            item.tags.forEach(tag => tagSet.add(tag))
        })
        return Array.from(tagSet).sort()
    }, [initialItems])

    // 모든 고유 날짜 추출
    const allDates = useMemo(() => {
        const dateSet = new Set<string>()
        initialItems.forEach(item => {
            dateSet.add(item.published_at)
        })
        return Array.from(dateSet).sort().reverse()
    }, [initialItems])

    // 필터 변경 핸들러
    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDate(e.target.value)
        filterNews(e.target.value, selectedTag)
    }

    const handleTagClick = (tag: string) => {
        const newTag = selectedTag === tag ? '' : tag
        setSelectedTag(newTag)
        filterNews(selectedDate, newTag)
    }

    const filterNews = (date: string, tag: string) => {
        const container = document.getElementById('news-container')
        if (!container) return

        const cards = container.querySelectorAll('article')

        cards.forEach((card, index) => {
            const item = initialItems[index]
            const matchesDate = !date || item.published_at === date
            const matchesTag = !tag || item.tags.includes(tag)

            if (matchesDate && matchesTag) {
                card.classList.remove('hidden')
            } else {
                card.classList.add('hidden')
            }
        })
    }

    return (
        <div className="bg-ai-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 space-y-4">
            {/* Date Picker */}
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-ai-accent flex-shrink-0" />
                <select
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="flex-1 bg-ai-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ai-accent"
                >
                    <option value="">모든 날짜</option>
                    {allDates.map(date => (
                        <option key={date} value={date}>
                            {new Date(date).toLocaleDateString('ko-KR')}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-ai-accent flex-shrink-0" />
                    <span className="text-sm text-gray-400">태그 필터</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedTag === tag
                                    ? 'bg-ai-accent text-white shadow-lg shadow-ai-accent/50'
                                    : 'bg-ai-dark text-gray-400 hover:bg-ai-dark/80 hover:text-white border border-white/10'
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Filters Display */}
            {(selectedDate || selectedTag) && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-500">활성 필터:</span>
                    {selectedDate && (
                        <span className="text-xs bg-ai-accent/20 text-ai-accent-light px-2 py-1 rounded">
                            {new Date(selectedDate).toLocaleDateString('ko-KR')}
                        </span>
                    )}
                    {selectedTag && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            #{selectedTag}
                        </span>
                    )}
                    <button
                        onClick={() => {
                            setSelectedDate('')
                            setSelectedTag('')
                            filterNews('', '')
                        }}
                        className="text-xs text-gray-400 hover:text-white ml-auto"
                    >
                        초기화
                    </button>
                </div>
            )}
        </div>
    )
}
