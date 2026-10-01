import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { sendDiscordNewOrderNotification } from "@/lib/discord/discord-notify";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      discord_id,
      discord_username,
      discord_avatar,
      package_tier,
      package_name,
      price,
      character_name,
      custom_plate,
      custom_phone,
      choice_type,
      vehicle_preference,
      notes,
    } = body;

    if (!discord_id || !package_tier || !character_name) {
      return NextResponse.json(
        { error: "Missing required fields: discord_id, package_tier, and character_name are required." },
        { status: 400 }
      );
    }

    const orderPayload = {
      user_id,
      discord_id,
      discord_username: discord_username || "Unknown",
      discord_avatar,
      package_tier,
      package_name: package_name || package_tier.toUpperCase(),
      price: price || "$0",
      character_name,
      custom_plate,
      custom_phone,
      choice_type,
      vehicle_preference,
      notes,
      status: "pending" as const,
    };

    let createdOrder: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();
        const { data, error } = await supabase
          .from("package_orders")
          .insert(orderPayload)
          .select()
          .single();

        if (error) {
          console.warn("[SUPABASE] package_orders table not available, falling back to mockDb:", error.message);
          createdOrder = mockDb.addPackageOrder(orderPayload);
        } else {
          createdOrder = data;
          mockDb.addPackageOrder(orderPayload);
        }
      } catch (err: any) {
        console.warn("[SUPABASE ERROR] Fallback to mockDb:", err.message);
        createdOrder = mockDb.addPackageOrder(orderPayload);
      }
    } else {
      createdOrder = mockDb.addPackageOrder(orderPayload);
    }

    // Dispatch real-time notification to Discord "New Orders" staff channel
    try {
      await sendDiscordNewOrderNotification(createdOrder);
    } catch (notifyErr) {
      console.error("[NEW ORDER NOTIFY ERROR]", notifyErr);
    }

    return NextResponse.json(
      { success: true, order: createdOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PACKAGE ORDER ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process package order" },
      { status: 500 }
    );
  }
}
