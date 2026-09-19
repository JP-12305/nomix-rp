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
    .min(3, "FiveM / Steam / Discord identifier is required."),

  // Step 2: RP Experience
  played_before: z.string().min(1, "Please select whether you have played FiveM before."),
  previous_servers: z
    .string()
    .min(10, "Please describe your past roleplay experience (at least 10 characters)."),
  whitelist_experience: z.string().optional(),

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
  char_background: z
    .string()
    .min(60, "Character backstory must be detailed (minimum 60 characters)."),
  char_personality: z
    .string()
    .min(25, "Character personality traits and flaws must be at least 25 characters."),
  char_goals: z
    .string()
    .min(25, "Character short and long term goals must be at least 25 characters."),

  // Step 4: Roleplay Knowledge
  def_rdm: z
    .string()
    .min(25, "Please give a thorough explanation of Random Deathmatch (min 25 characters)."),
  def_vdm: z
    .string()
    .min(25, "Please give a thorough explanation of Vehicle Deathmatch (min 25 characters)."),
  def_meta: z
    .string()
    .min(25, "Please explain Metagaming and external stream information (min 25 characters)."),
  def_power: z
    .string()
    .min(25, "Please explain Powergaming and forced roleplay (min 25 characters)."),
  def_failrp: z
    .string()
    .min(25, "Please explain Fail RP and value of immersion (min 25 characters)."),

  // Step 5: Scenario Questions
  scenario_police_stop: z
    .string()
    .min(50, "Detailed scenario response required (minimum 50 characters)."),
  scenario_hostage: z
    .string()
    .min(50, "Detailed scenario response required (minimum 50 characters)."),
  scenario_loss: z
    .string()
    .min(40, "Explain how your character reacts to narrative defeat/loss (min 40 characters)."),

  // Step 6: Agreements
  agree_rules: z.literal(true, {
    errorMap: () => ({ message: "You must agree to all server rules." }),
  }),
  agree_nvl: z.literal(true, {
    errorMap: () => ({ message: "You must accept the strict No Valuing Life policy." }),
  }),
  agree_microphone: z.literal(true, {
    errorMap: () => ({ message: "A clear working microphone is mandatory." }),
  }),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
  1: ["age", "country", "timezone", "fivem_id"],
  2: ["played_before", "previous_servers", "whitelist_experience"],
  3: ["char_name", "char_age", "char_gender", "char_background", "char_personality", "char_goals"],
  4: ["def_rdm", "def_vdm", "def_meta", "def_power", "def_failrp"],
  5: ["scenario_police_stop", "scenario_hostage", "scenario_loss"],
  6: ["agree_rules", "agree_nvl", "agree_microphone"],
};
