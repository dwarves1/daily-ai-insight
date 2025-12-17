'use client'

import { useState } from 'react'
import { type NewsItem } from '@/lib/supabase'
import { ExternalLink, Check } from 'lucide-react'

interface NewsCardProps {
    item: NewsItem
}

export default function NewsCard({ item }: NewsCardProps) {
    const [isTitleExpanded, setIsTitleExpanded] = useState(false)

    return (
        <article className="relative bg-gradient-card rounded-2xl p-6 sm:p-8 border border-white/10 card-hover backdrop-blur-sm">
            {/* Importance Badge */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <div className="bg-ai-accent/20 text-ai-accent-light px-3 py-1 rounded-full text-xs font-semibold border border-ai-accent/30">
                    {item.importance_score}/10
                </div>
            </div>

            {/* Title */}
            <h2
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                className={`text-2xl sm:text-3xl font-display font-bold leading-tight mb-4 pr-20 cursor-pointer transition-all duration-200 hover:text-ai-accent-light ${isTitleExpanded ? '' : 'line-clamp-2'}`}
            >
                {item.title}
            </h2>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Summary */}
            <div className="space-y-3 mb-6">
                {item.summary.map((line, index) => (
                    <div key={index} className="flex gap-3 items-start">
                        <div className="flex-shrink-0 mt-1">
                            <Check className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-gray-300 leading-relaxed">{line}</p>
                    </div>
                ))}
            </div>

            {/* Read More Button */}
            <div className="flex justify-end">
                <a
                    href={item.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ai-accent hover:bg-ai-accent-light text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-ai-accent/50"
                >
                    원본 읽기
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Published Date */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500">
                    Published: {new Date(item.published_at).toLocaleDateString('ko-KR')}
                </p>
            </div>
        </article>
    )
}
