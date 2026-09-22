import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      const { data: articles, error: newsError } = await supabase
        .from("news_articles")
        .select("*, category:news_categories(*)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (newsError) {
        console.error("Public news query error:", newsError);
        return NextResponse.json({ error: newsError.message, articles: [] }, { status: 500 });
      }

      return NextResponse.json(articles || [], {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    return NextResponse.json([], {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
      },
    });
  } catch (err: any) {
    console.error("Public news GET error:", err);
    return NextResponse.json({ error: err.message, articles: [] }, { status: 500 });
  }
}
