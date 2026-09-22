import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { name: "Development & Tech", slug: "development", color: "#00F0FF" },
  { name: "Patch Notes & Changelogs", slug: "patch-notes", color: "#10B981" },
  { name: "Community Events", slug: "community-events", color: "#EC4899" },
  { name: "City & Server Notices", slug: "city-notices", color: "#F59E0B" },
];

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      
      // Check existing categories
      let { data: categories, error } = await supabase
        .from("news_categories")
        .select("*")
        .order("name", { ascending: true });

      // If empty, auto-seed default categories
      if (!error && (!categories || categories.length === 0)) {
        const { data: inserted, error: insertErr } = await supabase
          .from("news_categories")
          .insert(DEFAULT_CATEGORIES)
          .select();

        if (!insertErr && inserted) {
          categories = inserted;
        }
      }

      if (categories && categories.length > 0) {
        return NextResponse.json(categories, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        });
      }
    }

    return NextResponse.json(DEFAULT_CATEGORIES);
  } catch (err: any) {
    console.error("News categories error:", err);
    return NextResponse.json(DEFAULT_CATEGORIES);
  }
}
