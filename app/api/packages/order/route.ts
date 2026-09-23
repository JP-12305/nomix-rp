import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

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

    // Attempt Discord Webhook Notification to Staff Channel if configured
    const webhookUrl = 
      process.env.DISCORD_STAFF_WEBHOOK_URL || 
      process.env.DISCORD_DONOR_WEBHOOK_URL || 
      process.env.DISCORD_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        const tierColor = 
          package_tier === "emerald" ? 0x10B981 : 
          package_tier === "gold" ? 0xF59E0B : 
          0x94A3B8;

        const embedFields = [
          { name: "👤 Discord Member", value: `<@${discord_id}> (${discord_username})`, inline: true },
          { name: "🎭 Character Name", value: `**${character_name}**`, inline: true },
          { name: "💎 Package Tier", value: `**${package_name}** (${price})`, inline: true },
        ];

        if (custom_plate) {
          embedFields.push({ name: "🏷️ Custom Plate(s)", value: `\`${custom_plate}\``, inline: true });
        }
        if (custom_phone) {
          embedFields.push({ name: "📱 Custom Phone", value: `\`${custom_phone}\``, inline: true });
        }
        if (vehicle_preference) {
          embedFields.push({ name: "🏎️ Vehicle Preference", value: vehicle_preference, inline: true });
        }
        if (notes) {
          embedFields.push({ name: "📝 Notes", value: notes, inline: false });
        }

        embedFields.push({
          name: "⚡ Next Step",
          value: "Open `/admin` portal to deliver in-game perks and verify Discord Supporter role.",
          inline: false,
        });

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "NOMIX Supporter Bot",
            avatar_url: "https://play.nomixroleplay.xyz/logo/logo.png",
            embeds: [
              {
                title: `💎 NEW DONOR ORDER: ${package_name.toUpperCase()} TIER`,
                description: `A new supporter package order has been received from **${discord_username}**.`,
                color: tierColor,
                fields: embedFields,
                footer: { text: `Order ID: ${createdOrder.id} • NOMIX RP Store` },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      } catch (webhookErr) {
        console.error("[DISCORD WEBHOOK ERROR]", webhookErr);
      }
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
