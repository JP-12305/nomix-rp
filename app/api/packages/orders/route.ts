import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  grantDiscordSupporterRole, 
  DiscordRoleResult 
} from "@/lib/discord/roles";
import { sendDiscordDonationApprovedNotification } from "@/lib/discord/discord-notify";

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
      try {
        roleResult = await grantDiscordSupporterRole(
          existingOrder.discord_id,
          existingOrder.package_tier
        );
      } catch (roleErr: any) {
        console.error("[ROLE GRANT ERROR]", roleErr);
        roleResult = {
          success: false,
          error: roleErr?.message || "Failed to contact Discord role service",
        };
      }
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
          ? `${finalNotes}\n[${timestamp} Auto-Bot Warning: ${roleResult.error || roleResult.details}]`
          : `[${timestamp} Auto-Bot Warning: ${roleResult.error || roleResult.details}]`;
      }
    }

    const isDelivering = targetStatus === "delivered" || targetStatus === "active";
    const nowIso = new Date().toISOString();

    // 3. Update Database (Supabase + mockDb fallback)
    let updatedOrder: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminSupabase();

        // Build base update object with production columns
        const updatePayload: Record<string, any> = {
          status: targetStatus,
          updated_at: nowIso,
        };

        if (isDelivering) {
          updatePayload.delivered_at = nowIso;
          updatePayload.delivered_by = staff_name || "Server Staff";
          if (roleResult?.success !== undefined) {
            updatePayload.discord_role_assigned = roleResult.success;
          }
        } else if (action === "sync_role" && roleResult?.success !== undefined) {
          updatePayload.discord_role_assigned = roleResult.success;
        }

        // Add staff_notes if provided
        if (finalNotes) {
          updatePayload.staff_notes = finalNotes;
        }

        // Attempt 1: Full update with all fields (including staff_notes if schema has it)
        let { data, error } = await supabase
          .from("package_orders")
          .update(updatePayload)
          .eq("id", order_id)
          .select()
          .single();

        // If error occurred (e.g. column 'staff_notes' doesn't exist in production schema)
        if (error) {
          console.warn("[SUPABASE] Full update failed, attempting column fallback:", error.message);

          // Attempt 2: If staff_notes was in payload, try without staff_notes
          if (updatePayload.staff_notes !== undefined) {
            delete updatePayload.staff_notes;
            const retry1 = await supabase
              .from("package_orders")
              .update(updatePayload)
              .eq("id", order_id)
              .select()
              .single();

            if (!retry1.error && retry1.data) {
              data = retry1.data;
              error = null;
            } else {
              error = retry1.error;
            }
          }

          // Attempt 3: Safe minimal update (only status and updated_at)
          if (error) {
            console.warn("[SUPABASE] Column fallback failed, falling back to minimal status update:", error?.message);
            const minimalRetry = await supabase
              .from("package_orders")
              .update({
                status: targetStatus,
                updated_at: nowIso,
              })
              .eq("id", order_id)
              .select()
              .single();

            if (!minimalRetry.error && minimalRetry.data) {
              data = minimalRetry.data;
              error = null;
            } else {
              error = minimalRetry.error;
            }
          }
        }

        if (!error && data) {
          updatedOrder = data;
        } else if (error) {
          console.error("[SUPABASE FINAL ERROR] Could not update order:", error);
        }
      } catch (err: any) {
        console.warn("[SUPABASE EXCEPTION] Update package order failed:", err.message);
      }
    }

    // Always update mockDb
    mockDb.updatePackageOrderStatus(
      order_id, 
      targetStatus, 
      finalNotes, 
      isDelivering ? (staff_name || "Server Staff") : undefined,
      roleResult?.success
    );

    // Guaranteed fallback: merge existing order with updated values
    if (!updatedOrder) {
      updatedOrder = {
        ...existingOrder,
        status: targetStatus,
        staff_notes: finalNotes || existingOrder.staff_notes || null,
        delivered_by: isDelivering ? (staff_name || "Server Staff") : existingOrder.delivered_by,
        delivered_at: isDelivering ? nowIso : existingOrder.delivered_at,
        discord_role_assigned: roleResult ? roleResult.success : existingOrder.discord_role_assigned,
        updated_at: nowIso,
      };
    } else {
      // If table lacked staff_notes column in Supabase, preserve it in returned object
      if (finalNotes && !updatedOrder.staff_notes) {
        updatedOrder.staff_notes = finalNotes;
      }
    }

    // 4. Send Discord Delivery & Donation Approved Broadcast (tagging the user)
    if (targetStatus === "delivered" && existingOrder.status !== "delivered") {
      try {
        await sendDiscordDonationApprovedNotification(updatedOrder, staff_name);
      } catch (notifyErr: any) {
        console.error("[DISCORD NOTIFY ERROR] Broadcast failed:", notifyErr?.message || notifyErr);
      }
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

