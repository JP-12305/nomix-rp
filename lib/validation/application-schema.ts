import { z } from "zod";

export const applicationSchema = z.object({
  // Step 1: Personal Info
  age: z.coerce
    .number({ invalid_type_error: "Please enter a valid age." })
    .min(18, "You must be at least 18 years old to join NOMIX Roleplay.")
    .max(99, "Please enter a realistic age."),
  country: z
    .string()
    .min(2, "Country / Region is required.")
    .max(100, "Country name is too long."),
  timezone: z
    .string()
    .min(2, "Timezone is required.")
    .max(50, "Timezone identifier is too long."),
  fivem_id: z
    .string()
    .min(2, "FiveM Name is required.")
    .max(100, "FiveM Name is too long."),

  // Step 2: RP Experience & Content Creator Status
  played_before: z.string().min(1, "Please select whether you have played FiveM before."),
  previous_servers: z
    .string()
    .min(10, "Please describe your past roleplay experience (at least 10 characters)."),
  whitelist_experience: z.string().optional(),

  // Content Creator Section
  is_content_creator: z.boolean().optional(),
  creator_platform: z.string().optional(),
  creator_other_platform: z.string().optional(),
  creator_channel_url: z.string().optional(),

  // Step 3: Character Concept
  char_name: z
    .string()
    .min(4, "Character name must be at least 4 characters.")
    .regex(/^[A-Za-z]+ [A-Za-z]+.*$/, "Character name must include both First and Last name (e.g. Marcus Vance)."),
  char_age: z.coerce
    .number({ invalid_type_error: "Character age must be a number." })
    .min(18, "Character must be at least 18 years old.")
    .max(90, "Character age must be realistic."),
  char_gender: z.string().min(1, "Please select your character's gender."),
  char_goals: z
    .string()
    .min(20, "Character short and long term goals must be at least 20 characters."),
  char_background: z.string().optional(),
  char_personality: z.string().optional(),

  // Roleplay Knowledge (Optional / Legacy compatibility)
  def_rdm: z.string().optional(),
  def_vdm: z.string().optional(),
  def_meta: z.string().optional(),
  def_power: z.string().optional(),
  def_failrp: z.string().optional(),

  // Step 4: Scenario Questions
  scenario_police_stop: z
    .string()
    .min(40, "Detailed scenario response required (minimum 40 characters)."),
  scenario_hostage: z
    .string()
    .min(40, "Detailed scenario response required (minimum 40 characters)."),
  scenario_loss: z
    .string()
    .min(30, "Explain how your character reacts to narrative defeat/loss (min 30 characters)."),

  // Step 5: Agreements
  agree_rules: z.literal(true, {
    errorMap: () => ({ message: "You must agree to all server rules." }),
  }),
  agree_nvl: z.literal(true, {
    errorMap: () => ({ message: "You must accept the strict No Valuing Life policy." }),
  }),
  agree_microphone: z.literal(true, {
    errorMap: () => ({ message: "A clear working microphone is mandatory." }),
  }),
}).superRefine((data, ctx) => {
  if (data.is_content_creator) {
    if (!data.creator_platform || data.creator_platform.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select your streaming / content platform.",
        path: ["creator_platform"],
      });
    }
    if (data.creator_platform === "Other" && (!data.creator_other_platform || data.creator_other_platform.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your platform name (min 2 characters).",
        path: ["creator_other_platform"],
      });
    }
    if (!data.creator_channel_url || data.creator_channel_url.trim().length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide your channel URL or handle.",
        path: ["creator_channel_url"],
      });
    }
  }
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
  1: ["age", "country", "timezone", "fivem_id"],
  2: [
    "played_before", 
    "previous_servers", 
    "whitelist_experience", 
    "is_content_creator", 
    "creator_platform", 
    "creator_other_platform", 
    "creator_channel_url"
  ],
  3: ["char_name", "char_age", "char_gender", "char_goals"],
  4: ["scenario_police_stop", "scenario_hostage", "scenario_loss"],
  5: ["agree_rules", "agree_nvl", "agree_microphone"],
};
