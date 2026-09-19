import { getBotSupabase } from "../database/supabaseClient";

export class AuditService {
  static async logEvent(
    applicationId: string,
    actorDiscordId: string,
    actorName: string,
    eventType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const supabase = getBotSupabase();
    if (!supabase) {
      console.log(`[AUDIT MOCK] ${eventType} on App ${applicationId} by ${actorName} (${actorDiscordId})`, metadata);
      return;
    }

    try {
      const isValidUUID = actorDiscordId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorDiscordId);
      let finalActorUUID: string | null = isValidUUID ? actorDiscordId : null;

      if (!isValidUUID && actorDiscordId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("discord_id", actorDiscordId)
          .maybeSingle();
        finalActorUUID = profile?.id || null;
      }

      await supabase.from("application_events").insert({
        application_id: applicationId,
        actor_id: finalActorUUID,
        actor_name: actorName,
        event_type: eventType,
        metadata,
      });
    } catch (err) {
      console.error("[AUDIT ERROR] Failed to log application event:", err);
    }
  }
}
