import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  grantDiscordSupporterRole, 
  sendDiscordDeliveryWebhook, 
  DiscordRoleResult 
} from "@/lib/discord/roles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();
        let query = supabase.from("package_orders").select("*").order("created_at", { ascending: false });

        if (status && status !== "ALL") {
          query = query.eq("status", status);
        }
        if (search) {
          query = query.or(`character_name.ilike.%${search}%,discord_username.ilike.%${search}%,discord_id.ilike.%${search}%,package_name.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          return NextResponse.json({ orders: data });
        }
      } catch (err: any) {
        console.warn("[SUPABASE] package_orders query failed, using mockDb fallback:", err.message);
      }
    }

    let orders = mockDb.getPackageOrders();
    if (status && status !== "ALL") {
      orders = orders.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.character_name?.toLowerCase().includes(q) ||
          o.discord_username.toLowerCase().includes(q) ||
          o.discord_id.toLowerCase().includes(q) ||
          o.package_name.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[GET PACKAGE ORDERS ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch package orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, staff_notes, staff_name, action } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 }
      );
    }

    // 1. Fetch current order to get details
    let existingOrder: any = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();
        const { data } = await supabase
          .from("package_orders")
          .select("*")
          .eq("id", order_id)
          .single();
        if (data) existingOrder = data;
      } catch (err) {
        console.warn("[SUPABASE] Error fetching existing order:", err);
      }
    }

    if (!existingOrder) {
      existingOrder = mockDb.getPackageOrders().find((o) => o.id === order_id);
    }

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    let roleResult: DiscordRoleResult | null = null;
    const targetStatus = status || existingOrder.status;

    // 2. Automated Discord Bot Role Assignment
    const shouldGrantRole = 
      action === "sync_role" || 
      ((targetStatus === "delivered" || targetStatus === "active") && existingOrder.status !== "delivered" && existingOrder.status !== "active");

    if (shouldGrantRole && existingOrder.discord_id) {
      roleResult = await grantDiscordSupporterRole(
        existingOrder.discord_id,
        existingOrder.package_tier
      );
    }

    // Build enhanced staff notes with audit log
    let finalNotes = staff_notes ?? existingOrder.staff_notes ?? "";
    if (roleResult) {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (roleResult.success) {
        finalNotes = finalNotes 
          ? `${finalNotes}\n[${timestamp} Auto-Bot: Granted @${roleResult.roleName}]`
          : `[${timestamp} Auto-Bot: Granted @${roleResult.roleName}]`;
      } else if (!roleResult.skipped) {
        finalNotes = finalNotes 
          ? `${finalNotes}\n[${timestamp} Auto-Bot Warning: ${roleResult.error}]`
          : `[${timestamp} Auto-Bot Warning: ${roleResult.error}]`;
      }
    }

    // 3. Update Database (Supabase + mockDb fallback)
    let updatedOrder: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();
        const { data, error } = await supabase
          .from("package_orders")
          .update({
            status: targetStatus,
            staff_notes: finalNotes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order_id)
          .select()
          .single();

        if (!error && data) {
          updatedOrder = data;
        }
      } catch (err: any) {
        console.warn("[SUPABASE] Update package order failed, updating mockDb:", err.message);
      }
    }

    // Always update mockDb
    const mockUpdated = mockDb.updatePackageOrderStatus(order_id, targetStatus, finalNotes);
    if (!updatedOrder) {
      updatedOrder = mockUpdated;
    }

    // 4. Send Discord Delivery Broadcast Webhook if marked delivered
    if (targetStatus === "delivered" && existingOrder.status !== "delivered") {
      await sendDiscordDeliveryWebhook(updatedOrder, staff_name);
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      discord_role: roleResult,
    });
  } catch (error: any) {
    console.error("[PATCH PACKAGE ORDER ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update package order" },
      { status: 500 }
    );
  }
}

