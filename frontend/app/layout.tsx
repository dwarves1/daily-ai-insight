import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
    title: 'Daily AI Insight - AI 뉴스 큐레이션',
    description: '매일 아침 AI 관련 핫 이슈와 뉴스를 3줄 요약으로 만나보세요',
    keywords: ['AI', '인공지능', '뉴스', '큐레이션', 'GPT', '머신러닝'],
    authors: [{ name: 'Daily AI Insight' }],
    openGraph: {
        title: 'Daily AI Insight',
        description: '매일 아침 AI 관련 핫 이슈와 뉴스를 3줄 요약으로 만나보세요',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko" className="dark">
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
                {children}
            </body>
        </html>
    )
}
