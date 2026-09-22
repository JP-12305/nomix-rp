import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      const { data: articles, error } = await supabase
        .from("news_articles")
        .select("*, category:news_categories(*)")
        .order("published_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { articles: articles || [] },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    return NextResponse.json({ articles: [] });
  } catch (err: any) {
    console.error("Admin news fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      cover_image,
      category_id,
      author_name,
      is_published = true,
    } = body;

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: "Title, excerpt, and article content are required." },
        { status: 400 }
      );
    }

    const finalSlug = (customSlug && customSlug.trim()) ? slugify(customSlug) : slugify(title);

    if (!finalSlug) {
      return NextResponse.json({ error: "Invalid article title or slug." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      // Check if slug already exists
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString().slice(-4)}` : finalSlug;

      const payload: Record<string, any> = {
        title: title.trim(),
        slug: uniqueSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        cover_image: cover_image?.trim() || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
        author_name: author_name?.trim() || "NOMIX Staff",
        is_published: Boolean(is_published),
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (category_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)) {
        payload.category_id = category_id;
      }

      const { data: createdArticle, error: insertErr } = await supabase
        .from("news_articles")
        .insert(payload)
        .select("*, category:news_categories(*)")
        .single();

      if (insertErr) {
        console.error("News insert error:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, article: createdArticle }, { status: 201 });
    }

    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  } catch (err: any) {
    console.error("Admin news publish error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
