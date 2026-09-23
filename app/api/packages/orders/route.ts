import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

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
    const { order_id, status, staff_notes } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: "order_id and status are required" },
        { status: 400 }
      );
    }

    let updatedOrder: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();
        const { data, error } = await supabase
          .from("package_orders")
          .update({
            status,
            staff_notes: staff_notes || null,
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
    const mockUpdated = mockDb.updatePackageOrderStatus(order_id, status, staff_notes);
    if (!updatedOrder) {
      updatedOrder = mockUpdated;
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("[PATCH PACKAGE ORDER ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update package order" },
      { status: 500 }
    );
  }
}
