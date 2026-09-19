import { NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      const { data: categories, error: catError } = await supabase
        .from("faq_categories")
        .select("*, faqs(*)")
        .order("order_index", { ascending: true });

      if (!catError && categories) {
        return NextResponse.json(categories);
      }
    }

    return NextResponse.json(mockDb.getFaqsWithCategories());
  } catch (err) {
    return NextResponse.json(mockDb.getFaqsWithCategories());
  }
}
