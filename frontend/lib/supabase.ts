import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface NewsItem {
    id: string
    title: string
    summary: string[]
    tags: string[]
    original_url: string
    importance_score: number
    published_at: string
    created_at: string
}
