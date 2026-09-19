import { NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      const { data: articles, error: newsError } = await supabase
        .from("news_articles")
        .select("*, category:news_categories(*)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!newsError && articles) {
        return NextResponse.json(articles);
      }
    }

    return NextResponse.json(mockDb.getNews());
  } catch (err) {
    return NextResponse.json(mockDb.getNews());
  }
}
