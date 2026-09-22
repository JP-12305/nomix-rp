import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    if (!articleId) {
      return NextResponse.json({ error: "Missing article ID." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", articleId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Article deleted." });
    }

    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  } catch (err: any) {
    console.error("Delete article error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    const body = await request.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing article ID." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      const { data: updated, error } = await supabase
        .from("news_articles")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)
        .select("*, category:news_categories(*)")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, article: updated });
    }

    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  } catch (err: any) {
    console.error("Update article error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
