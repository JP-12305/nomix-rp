import { 
  Application, 
  RuleCategory, 
  Rule, 
  FAQCategory, 
  FAQItem, 
  NewsCategory, 
  NewsArticle, 
  UserProfile, 
  ApplicationStatus,
  ServerStatusData,
  StaffNote,
  ApplicationEvent
} from "@/types";

// In-memory persistent state for local development / demo mode
class DatabaseStore {
  public profiles: UserProfile[] = [
    {
      id: "usr-demo-applicant",
      discord_id: "789123456789012345",
      username: "SpectreRider",
      display_name: "Spectre",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      role: "applicant",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "usr-demo-staff",
      discord_id: "123456789012345678",
      username: "NomixRecruiter",
      display_name: "Head of Whitelist",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // 17 Official Rule Categories from No Mix RP Rulebook
  public ruleCategories: RuleCategory[] = [
    {
      id: "cat-1",
      name: "1. General Community Rules",
      slug: "general-community",
      description: "Core standards of behavior, mutual respect, anti-hate speech, and staff directives across Discord and FiveM.",
      order_index: 1,
      is_active: true,
    },
    {
      id: "cat-2",
      name: "2. Discord Verification",
      slug: "discord-verification",
      description: "Rules regarding Discord membership, single account policy, and ban evasion prevention.",
      order_index: 2,
      is_active: true,
    },
    {
      id: "cat-3",
      name: "3. Roleplay Rules",
      slug: "roleplay-rules",
      description: "Serious RP standards: In-character mandate, Fail RP, RDM, VDM, Metagaming, Powergaming, Fear RP, and Combat Logging.",
      order_index: 3,
      is_active: true,
    },
    {
      id: "cat-4",
      name: "4. New Life Rule (NLR)",
      slug: "new-life-rule",
      description: "Guidelines governing memory loss and scene return after legitimate character death.",
      order_index: 4,
      is_active: true,
    },
    {
      id: "cat-5",
      name: "5. Police & Law Enforcement RP",
      slug: "police-law-enforcement",
      description: "Legitimate police interaction, cop baiting bans, corruption guidelines, and restricted equipment.",
      order_index: 5,
      is_active: true,
    },
    {
      id: "cat-6",
      name: "6. Medical / Hospital RP",
      slug: "medical-hospital",
      description: "Respect for EMS personnel, realistic medical injury roleplay, and hospital triage priorities.",
      order_index: 6,
      is_active: true,
    },
    {
      id: "cat-7",
      name: "7. Criminal & Gang RP",
      slug: "criminal-gang",
      description: "Purpose-driven crime, robbery restrictions, hostage guidelines, gang wars, and proportional violence.",
      order_index: 7,
      is_active: true,
    },
    {
      id: "cat-8",
      name: "8. Vehicle Rules",
      slug: "vehicle-rules",
      description: "Realistic driving standards, unrealistic vehicle usage, vehicle ramming, and vehicle theft rules.",
      order_index: 8,
      is_active: true,
    },
    {
      id: "cat-9",
      name: "9. Economy & Property",
      slug: "economy-property",
      description: "Strict prohibition on money glitches, item duplication, Real Money Trading (RMT), and account sharing.",
      order_index: 9,
      is_active: true,
    },
    {
      id: "cat-10",
      name: "10. Cheating & Third-Party Software",
      slug: "cheating-software",
      description: "Zero tolerance for trainers, injectors, aimbots, ESP, god modes, and unauthorized mod menus.",
      order_index: 10,
      is_active: true,
    },
    {
      id: "cat-11",
      name: "11. Bugs & Exploits",
      slug: "bugs-exploits",
      description: "Mandatory reporting of discovered bugs and prohibition on exploit abuse.",
      order_index: 11,
      is_active: true,
    },
    {
      id: "cat-12",
      name: "12. Staff & Administration",
      slug: "staff-administration",
      description: "Staff authority, decision appeals, anti-impersonation, and non-interference with moderation.",
      order_index: 12,
      is_active: true,
    },
    {
      id: "cat-13",
      name: "13. Streaming & Content Creation",
      slug: "streaming-content",
      description: "Broadcasting permissions, stream sniping bans, and community reputation standards.",
      order_index: 13,
      is_active: true,
    },
    {
      id: "cat-14",
      name: "14. Voice & Communication",
      slug: "voice-communication",
      description: "Voice changer standards, soundboard restrictions, and microphone spam prevention.",
      order_index: 14,
      is_active: true,
    },
    {
      id: "cat-15",
      name: "15. Reports & Appeals",
      slug: "reports-appeals",
      description: "Player report procedures, evidence requirements (video/clips/IDs), and ban appeal channels.",
      order_index: 15,
      is_active: true,
    },
    {
      id: "cat-16",
      name: "16. Rule Interpretation",
      slug: "rule-interpretation",
      description: "Spirit of the community and strict prohibition on intentionally exploiting technical loopholes.",
      order_index: 16,
      is_active: true,
    },
    {
      id: "cat-17",
      name: "17. Punishments",
      slug: "punishments",
      description: "Disciplinary ladder: Warning → Kick → Temporary Ban → Whitelist Suspension → Permanent Ban.",
      order_index: 17,
      is_active: true,
    },
  ];

  public rules: Rule[] = [
    // 1. General Community Rules
    {
      id: "r-1-1",
      category_id: "cat-1",
      rule_number: "1.1",
      title: "Respect Everyone",
      description: "Treat all members, players, staff, and departments with respect.",
      content: "Harassment, bullying, discrimination, threats, personal attacks, or targeted abuse will not be tolerated across Discord or in-game.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-1-2",
      category_id: "cat-1",
      rule_number: "1.2",
      title: "No Hate Speech",
      description: "Racist, homophobic, sexist, religiously targeted, or otherwise hateful content is prohibited.",
      content: "Hate speech results in an immediate, non-negotiable permanent ban from No Mix RP without possibility of appeal.",
      severity: "CRITICAL",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-1-3",
      category_id: "cat-1",
      rule_number: "1.3",
      title: "No Excessive Toxicity",
      description: "Trash talk and in-character arguments are acceptable within reasonable RP limits. Personal attacks outside RP are not.",
      content: "Keep all conflict strictly within character. Bringing OOC hostility, personal grudge venting, or toxicity into Discord channels is strictly prohibited.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-1-4",
      category_id: "cat-1",
      rule_number: "1.4",
      title: "No Spamming",
      description: "Do not spam messages, emojis, mentions, sounds, images, or commands.",
      content: "Flooding text or voice channels disrupts the community and will result in communication mutes or kicks.",
      severity: "LOW",
      order_index: 4,
      is_active: true,
    },
    {
      id: "r-1-5",
      category_id: "cat-1",
      rule_number: "1.5",
      title: "No Unauthorised Advertising",
      description: "Advertising other FiveM servers, Discord communities, websites, services, or products without permission is prohibited.",
      content: "Direct message advertising or public server links for other gaming communities will result in an immediate ban.",
      severity: "HIGH",
      order_index: 5,
      is_active: true,
    },
    {
      id: "r-1-6",
      category_id: "cat-1",
      rule_number: "1.6",
      title: "No NSFW Content",
      description: "Pornographic, sexually explicit, or excessively graphic content is prohibited.",
      content: "Posting explicit adult media, gore, or non-consensual graphic material is grounds for an immediate permanent ban.",
      severity: "CRITICAL",
      order_index: 6,
      is_active: true,
    },
    {
      id: "r-1-7",
      category_id: "cat-1",
      rule_number: "1.7",
      title: "Follow Staff Instructions",
      description: "Staff instructions must be followed. If you disagree with a decision, use the appropriate appeal or support system.",
      content: "Do not argue with staff during an ongoing scene or investigation. Comply immediately and open a support ticket afterward if you wish to appeal.",
      severity: "HIGH",
      order_index: 7,
      is_active: true,
    },

    // 2. Discord Verification
    {
      id: "r-2-1",
      category_id: "cat-2",
      rule_number: "2.1",
      title: "Verification Required",
      description: "All members must complete the official No Mix RP verification process before accessing the full Discord community.",
      content: "You must authenticate via our automated Discord system and link your account to participate in whitelist applications.",
      severity: "MEDIUM",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-2-2",
      category_id: "cat-2",
      rule_number: "2.2",
      title: "One Account",
      description: "Do not use alternate Discord accounts to bypass restrictions, punishments, or bans.",
      content: "Players are permitted exactly one primary Discord and FiveM account. Alternate accounts (alt accounts) are prohibited.",
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-2-3",
      category_id: "cat-2",
      rule_number: "2.3",
      title: "Ban Evasion",
      description: "Creating or using another account to evade a Discord or No Mix RP punishment will result in further action.",
      content: "Ban evasion will result in all associated hardware, IP, Discord, and Steam identifiers being permanently blacklisted.",
      severity: "CRITICAL",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-2-4",
      category_id: "cat-2",
      rule_number: "2.4",
      title: "False Information",
      description: "Do not intentionally provide false information during verification, applications, or staff investigations.",
      content: "Lying about your real age, identifiers, or prior whitelist history will lead to immediate revocation of your citizen visa.",
      severity: "HIGH",
      order_index: 4,
      is_active: true,
    },

    // 3. Roleplay Rules
    {
      id: "r-3-1",
      category_id: "cat-3",
      rule_number: "3.1",
      title: "Stay In Character",
      description: "Remain in character during active RP situations unless a staff member instructs otherwise.",
      content: "No Mix RP is a serious roleplay environment. Do not use out-of-character voice, break character during bugs, or mention game mechanics (e.g., 'pressing E'). RP through scenes and report issues to staff afterward.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-3-2",
      category_id: "cat-3",
      rule_number: "3.2",
      title: "Fail RP",
      description: "Do not perform actions that are clearly unrealistic or intended to break immersion.",
      content: `Examples of Fail RP:
• Surviving unrealistic crashes without consequences or injury roleplay
• Ignoring serious injuries and continuing to sprint or shoot
• Performing unrealistic stunts during serious situations
• Treating the server like an arcade environment`,
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-3-3",
      category_id: "cat-3",
      rule_number: "3.3",
      title: "Random Deathmatch — RDM",
      description: "You may not kill or attack another player without a valid roleplay reason.",
      content: "Meaningful verbal interaction and clear narrative escalation must precede any hostile physical altercation or lethal force. Killing on sight without dialogue is textbook RDM.",
      severity: "CRITICAL",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-3-4",
      category_id: "cat-3",
      rule_number: "3.4",
      title: "Vehicle Deathmatch — VDM",
      description: "Using a vehicle as a weapon against another player without a valid RP reason is prohibited.",
      content: "Intentionally running over pedestrians, ramming occupied vehicles at fatal speeds with no roleplay context, or using cars as battering rams is strictly banned.",
      severity: "CRITICAL",
      order_index: 4,
      is_active: true,
    },
    {
      id: "r-3-5",
      category_id: "cat-3",
      rule_number: "3.5",
      title: "Meta Gaming",
      description: "Do not use information obtained outside the game to influence your character's actions.",
      content: `Examples of Metagaming:
• Using Discord voice/text information in RP
• Watching someone's livestream to locate or track them
• Using a player's real name or identity because you saw it on Discord
• In-character knowledge must be discovered naturally in-game.`,
      severity: "CRITICAL",
      order_index: 5,
      is_active: true,
    },
    {
      id: "r-3-6",
      category_id: "cat-3",
      rule_number: "3.6",
      title: "Power Gaming",
      description: "Do not force actions or outcomes onto another player's character without giving them a reasonable opportunity to respond.",
      content: "Examples include roleplaying impossible physical feats, /me actions that leave no defense window (/me knocks unconscious with one punch), or ignoring roleplayed restraints.",
      severity: "HIGH",
      order_index: 6,
      is_active: true,
    },
    {
      id: "r-3-7",
      category_id: "cat-3",
      rule_number: "3.7",
      title: "Fear RP / Value of Life",
      description: "Your character must value their life at all times.",
      content: "If you are held at gunpoint, cornered, or placed in a clearly dangerous situation, you must respond realistically with authentic fear and compliance unless you hold an indisputable tactical advantage.",
      severity: "CRITICAL",
      order_index: 7,
      is_active: true,
    },
    {
      id: "r-3-8",
      category_id: "cat-3",
      rule_number: "3.8",
      title: "Combat Logging",
      description: "Leaving the server to avoid an active RP situation, arrest, death, robbery, or other consequence is prohibited.",
      content: "Disconnecting while downed, detained by law enforcement, or during an active gunfight is an automatic temporary or permanent ban.",
      severity: "CRITICAL",
      order_index: 8,
      is_active: true,
    },
    {
      id: "r-3-9",
      category_id: "cat-3",
      rule_number: "3.9",
      title: "RP Avoidance",
      description: "Do not intentionally avoid roleplay by hiding, disconnecting, switching characters, or exploiting game mechanics.",
      content: "Embrace roleplay scenarios even when they do not favor your character. Refusing to interact or exploiting safezones during active pursuit is prohibited.",
      severity: "HIGH",
      order_index: 9,
      is_active: true,
    },

    // 4. New Life Rule
    {
      id: "r-4-1",
      category_id: "cat-4",
      rule_number: "4.1",
      title: "New Life Rule (NLR)",
      description: "Guidelines governing memory loss and scene return upon character death and hospital respawn.",
      content: `If your character is killed and the situation results in a legitimate death/respawn:
• You should not immediately return to the previous scene.
• You should not use information from your previous life.
• You should not seek revenge based on information your character no longer reasonably possesses.
• Exceptions may apply to specific medical resuscitation or scripted scenarios.`,
      severity: "MEDIUM",
      order_index: 1,
      is_active: true,
    },

    // 5. Police & Law Enforcement RP
    {
      id: "r-5-1",
      category_id: "cat-5",
      rule_number: "5.1",
      title: "Respect Law Enforcement RP",
      description: "Police, Sheriff's Office, and other law enforcement personnel must be treated as legitimate RP characters.",
      content: "Officers are players providing critical city infrastructure. Do not treat law enforcement as simple AI obstacles or targets for griefing.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-5-2",
      category_id: "cat-5",
      rule_number: "5.2",
      title: "No Cop Baiting",
      description: "Do not intentionally provoke police solely to create a pursuit or gunfight without a legitimate RP reason.",
      content: "Doing burnouts in front of police stations, honking repeatedly at cruisers, or deliberately speeding past officers just to initiate a chase is cop baiting and strictly prohibited.",
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-5-3",
      category_id: "cat-5",
      rule_number: "5.3",
      title: "Realistic Police Interaction",
      description: "Law enforcement must follow reasonable procedures and should not abuse their authority.",
      content: "Both civilians and officers are expected to engage in proportional, procedure-driven interactions during stops, searches, and interrogations.",
      severity: "MEDIUM",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-5-4",
      category_id: "cat-5",
      rule_number: "5.4",
      title: "Police Corruption",
      description: "Police corruption is permitted only if specifically authorized by No Mix RP management.",
      content: "Unauthorized corrupt behavior (selling police weapons, dropping charges without approval, aiding gangs illegally) without management sign-off will result in immediate termination and potential bans.",
      severity: "CRITICAL",
      order_index: 4,
      is_active: true,
    },
    {
      id: "r-5-5",
      category_id: "cat-5",
      rule_number: "5.5",
      title: "Police Equipment Protection",
      description: "Do not steal, duplicate, spawn, or obtain restricted police equipment through exploits or unauthorized methods.",
      content: "Restricted law enforcement weapons, armor, and specialized gear are strictly regulated.",
      severity: "HIGH",
      order_index: 5,
      is_active: true,
    },

    // 6. Medical / Hospital RP
    {
      id: "r-6-1",
      category_id: "cat-6",
      rule_number: "6.1",
      title: "Respect Medical Personnel",
      description: "Do not intentionally attack, harass, or obstruct EMS and hospital personnel without a legitimate RP reason.",
      content: "On-duty medical staff are neutral life-savers. Assaulting or taking EMS hostage during active medical triage is strictly prohibited.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-6-2",
      category_id: "cat-6",
      rule_number: "6.2",
      title: "Medical Roleplay Participation",
      description: "Players are expected to participate realistically in medical scenarios.",
      content: "Describe your injuries honestly using /me and voice dialogue when evaluated by paramedics or doctors at Mount Zonah Medical.",
      severity: "MEDIUM",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-6-3",
      category_id: "cat-6",
      rule_number: "6.3",
      title: "No Fake Medical Knowledge",
      description: "Do not use unrealistic medical actions simply to avoid RP consequences.",
      content: "You cannot claim to have treated bullet wounds or severed arteries by yourself in a ditch without certified medical tools.",
      severity: "MEDIUM",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-6-4",
      category_id: "cat-6",
      rule_number: "6.4",
      title: "EMS Priorities",
      description: "Medical personnel may prioritize active emergencies, critical patients, mass-casualty incidents, and life-threatening situations.",
      content: "Understand that EMS resources are distributed based on urgency of care in the city.",
      severity: "LOW",
      order_index: 4,
      is_active: true,
    },

    // 7. Criminal & Gang RP
    {
      id: "r-7-1",
      category_id: "cat-7",
      rule_number: "7.1",
      title: "Criminal RP Must Have Purpose",
      description: "Criminal activity should create roleplay rather than simply generate money or kills.",
      content: "Meaningful storylines, relationships, and rivalries should drive criminal endeavors rather than continuous mindless grinding.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-7-2",
      category_id: "cat-7",
      rule_number: "7.2",
      title: "No Random Robbery",
      description: "Do not repeatedly rob random players without legitimate RP interaction.",
      content: "Chain robbing civilians at ATMs or job spots with zero prior dialogue or backstory is forbidden.",
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-7-3",
      category_id: "cat-7",
      rule_number: "7.3",
      title: "Hostages",
      description: "Hostage situations must involve meaningful RP and may not be created solely to force unrealistic demands.",
      content: "Fake/collaborative hostages who are friends working together to game police negotiations are strictly prohibited.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-7-4",
      category_id: "cat-7",
      rule_number: "7.4",
      title: "Gang Wars",
      description: "Gang conflicts must have legitimate RP reasons. Randomly attacking another gang without established conflict is prohibited.",
      content: "Formal territory disputes must have established narrative buildup and clear terms agreed upon or overseen by management.",
      severity: "HIGH",
      order_index: 4,
      is_active: true,
    },
    {
      id: "r-7-5",
      category_id: "cat-7",
      rule_number: "7.5",
      title: "Excessive Violence",
      description: "Violence should be proportional to the situation and should contribute to the RP.",
      content: "Torture, execution roleplay, and extreme violence require explicit mutual consent and storyline justification.",
      severity: "HIGH",
      order_index: 5,
      is_active: true,
    },

    // 8. Vehicle Rules
    {
      id: "r-8-1",
      category_id: "cat-8",
      rule_number: "8.1",
      title: "Realistic Driving",
      description: "Drive appropriately for the vehicle type and situation.",
      content: "Driving supercars through mountain cliff sides, launching vehicles off crane ramps in serious chases, or ignoring high-speed impacts is Fail RP.",
      severity: "MEDIUM",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-8-2",
      category_id: "cat-8",
      rule_number: "8.2",
      title: "Unrealistic Vehicle Use",
      description: "Do not intentionally use vehicles in ways that are clearly unrealistic solely to gain an advantage.",
      content: "Using vehicles to block building doors entirely or climb sheer building roofs is prohibited.",
      severity: "MEDIUM",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-8-3",
      category_id: "cat-8",
      rule_number: "8.3",
      title: "Vehicle Ramming",
      description: "Intentional ramming is prohibited unless justified by the RP situation.",
      content: "Head-on collision ramming at 100+ MPH is suicidal Fail RP. Tactical pitting must be performed at realistic speeds.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-8-4",
      category_id: "cat-8",
      rule_number: "8.4",
      title: "Vehicle Theft",
      description: "Vehicle theft must involve roleplay and should not be used to randomly inconvenience players.",
      content: "Do not steal emergency vehicles or unoccupied player vehicles without legitimate narrative purpose.",
      severity: "MEDIUM",
      order_index: 4,
      is_active: true,
    },

    // 9. Economy & Property
    {
      id: "r-9-1",
      category_id: "cat-9",
      rule_number: "9.1",
      title: "Zero Exploits Tolerance",
      description: "Using bugs, glitches, duplication methods, or other exploits to obtain money, items, vehicles, or advantages is strictly prohibited.",
      content: "Any player caught duping items or exploiting job payout loops will be permanently banned and wiped.",
      severity: "CRITICAL",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-9-2",
      category_id: "cat-9",
      rule_number: "9.2",
      title: "Exploit Reporting",
      description: "If you discover an exploit, report it to staff immediately instead of abusing it.",
      content: "Prompt reporting of severe economy bugs is rewarded. Concealing bugs for private gain results in bans.",
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-9-3",
      category_id: "cat-9",
      rule_number: "9.3",
      title: "Real Money Trading (RMT)",
      description: "Selling in-game money, items, vehicles, properties, or accounts for unauthorized real-world currency is prohibited.",
      content: "All parties involved in real money transactions for in-game assets will be permanently removed from the community.",
      severity: "CRITICAL",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-9-4",
      category_id: "cat-9",
      rule_number: "9.4",
      title: "Account Sharing",
      description: "Do not share your FiveM, Discord, or No Mix RP account with another person.",
      content: "You are solely responsible for all actions taken on your registered whitelist account.",
      severity: "HIGH",
      order_index: 4,
      is_active: true,
    },

    // 10. Cheating & Third-Party Software
    {
      id: "r-10-1",
      category_id: "cat-10",
      rule_number: "10.1",
      title: "Prohibited Third-Party Software",
      description: "The use of cheats, trainers, injectors, aimbots, ESP, god modes, or unauthorized menus is strictly prohibited.",
      content: "Any software or modified game file designed to provide an unfair advantage or bypass No Mix RP security will result in an immediate, permanent hardware ban. Automated anti-cheat flags suspicious activity for review.",
      severity: "CRITICAL",
      order_index: 1,
      is_active: true,
    },

    // 11. Bugs & Exploits
    {
      id: "r-11-1",
      category_id: "cat-11",
      rule_number: "11.1",
      title: "Bugs & Exploits Policy",
      description: "If you discover a bug: DO NOT ABUSE IT. Report it immediately.",
      content: "Knowingly abusing an exploit may result in a permanent ban, even if you did not originally discover it. Help us maintain a fair server environment.",
      severity: "CRITICAL",
      order_index: 1,
      is_active: true,
    },

    // 12. Staff & Administration
    {
      id: "r-12-1",
      category_id: "cat-12",
      rule_number: "12.1",
      title: "Staff Power Abuse",
      description: "Staff members may not use their powers or permissions for personal benefit.",
      content: "Staff actions are fully audited. Spawning items or using teleportation for in-character advantage is strictly prohibited.",
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-12-2",
      category_id: "cat-12",
      rule_number: "12.2",
      title: "Staff Decisions & Inquiries",
      description: "Do not argue with staff during active RP situations.",
      content: "Use the ticket or appeal system if you believe a decision was incorrect. Never derail ongoing roleplay scenes to dispute calls.",
      severity: "HIGH",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-12-3",
      category_id: "cat-12",
      rule_number: "12.3",
      title: "Fake Staff & Impersonation",
      description: "Do not impersonate No Mix RP staff members.",
      content: "Claiming to be an administrator or recruiter to intimidate players is grounds for immediate punishment.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-12-4",
      category_id: "cat-12",
      rule_number: "12.4",
      title: "Staff Interference",
      description: "Do not intentionally interrupt an ongoing staff investigation or moderation action.",
      content: "Give staff space when they are handling player reports or pauses in-game.",
      severity: "MEDIUM",
      order_index: 4,
      is_active: true,
    },

    // 13. Streaming & Content Creation
    {
      id: "r-13-1",
      category_id: "cat-13",
      rule_number: "13.1",
      title: "Streaming Permissions",
      description: "Players are allowed to stream No Mix RP unless restricted by a specific event or staff instruction.",
      content: "Broadcasting your gameplay on Twitch, YouTube, Kick, etc. is welcomed provided you adhere to all server rules.",
      severity: "LOW",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-13-2",
      category_id: "cat-13",
      rule_number: "13.2",
      title: "Stream Sniping",
      description: "Using a livestream, video, or recording to obtain information about another player's location or actions is prohibited.",
      content: "Stream sniping is treated as severe Metagaming and will result in an immediate ban.",
      severity: "CRITICAL",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-13-3",
      category_id: "cat-13",
      rule_number: "13.3",
      title: "Content & Community Reputation",
      description: "Creators must not intentionally damage the reputation of No Mix RP through fabricated claims, malicious manipulation, or harassment.",
      content: "Constructive feedback through staff tickets is encouraged; malicious smear campaigns are not permitted.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },

    // 14. Voice & Communication
    {
      id: "r-14-1",
      category_id: "cat-14",
      rule_number: "14.1",
      title: "Voice Changers",
      description: "Voice changers may be used when they contribute to RP and do not interfere with communication.",
      content: "Voice changers are permissible for masked identities or distinct accents, provided audio is clean and easily audible.",
      severity: "LOW",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-14-2",
      category_id: "cat-14",
      rule_number: "14.2",
      title: "Soundboards",
      description: "Do not use soundboards or loud audio to disrupt RP.",
      content: "Playing music or meme soundboard clips over proximity voice in public areas is prohibited.",
      severity: "MEDIUM",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-14-3",
      category_id: "cat-14",
      rule_number: "14.3",
      title: "Microphone Quality & Abuse",
      description: "Excessive screaming, background static, loud music, or microphone spam is prohibited.",
      content: "A clear microphone with proper push-to-talk configuration is required.",
      severity: "MEDIUM",
      order_index: 3,
      is_active: true,
    },

    // 15. Reports & Appeals
    {
      id: "r-15-1",
      category_id: "cat-15",
      rule_number: "15.1",
      title: "Player Reports",
      description: "Use the official reporting system to report rule violations.",
      content: "Submit reports through the Discord ticket portal rather than escalating disputes publicly in chat.",
      severity: "LOW",
      order_index: 1,
      is_active: true,
    },
    {
      id: "r-15-2",
      category_id: "cat-15",
      rule_number: "15.2",
      title: "Evidence Requirements",
      description: "Provide relevant evidence whenever possible (Video, Screenshots, Clip timestamps, Player IDs).",
      content: "Unsubstantiated accusations without video footage or logs cannot be fully acted upon by moderation.",
      severity: "LOW",
      order_index: 2,
      is_active: true,
    },
    {
      id: "r-15-3",
      category_id: "cat-15",
      rule_number: "15.3",
      title: "False Reports",
      description: "Do not submit reports with fabricated evidence or intentionally false accusations.",
      content: "Fabricating clips or lying to staff to get another player banned will result in punishment on the reporting party.",
      severity: "HIGH",
      order_index: 3,
      is_active: true,
    },
    {
      id: "r-15-4",
      category_id: "cat-15",
      rule_number: "15.4",
      title: "Ban Appeals",
      description: "Players may appeal punishments through the official No Mix RP appeal system.",
      content: "Appeals are evaluated on an individual basis depending on elapsed time, accountability, and prior record.",
      severity: "LOW",
      order_index: 4,
      is_active: true,
    },

    // 16. Rule Interpretation
    {
      id: "r-16-1",
      category_id: "cat-16",
      rule_number: "16.1",
      title: "Spirit of the Rules & Loophole Exploitation",
      description: "'It's not specifically written in the rules' is not a valid excuse for intentionally abusing a loophole.",
      content: `No rulebook can cover every possible situation. No Mix RP staff may take action against behavior that:
• Intentionally exploits a technical loophole
• Damages the RP experience
• Attempts to circumvent existing rules
• Creates serious disruption
• Violates the spirit of the community`,
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },

    // 17. Punishments
    {
      id: "r-17-1",
      category_id: "cat-17",
      rule_number: "17.1",
      title: "Punishment Escalation Ladder",
      description: "Warning → Kick → Temporary Ban → Whitelist Suspension → Permanent Ban.",
      content: `The severity of the punishment depends on:
• Severity of the violation
• Previous punishments
• Intent
• Repeated offenses
• Impact on other players
• Cooperation with staff

Serious violations (e.g., hate speech, cheating, severe RDM/exploiting) may result in an immediate permanent ban.`,
      severity: "HIGH",
      order_index: 1,
      is_active: true,
    },
  ];

  public faqCategories: FAQCategory[] = [
    { id: "faq-cat-1", name: "Visa & Whitelist", slug: "visa", order_index: 1 },
    { id: "faq-cat-2", name: "Getting Started & FiveM", slug: "fivem", order_index: 2 },
    { id: "faq-cat-3", name: "Rules & Enforcement", slug: "rules", order_index: 3 },
    { id: "faq-cat-4", name: "Economy & Careers", slug: "careers", order_index: 4 },
  ];

  public faqs: FAQItem[] = [
    {
      id: "faq-1",
      category_id: "faq-cat-1",
      question: "What is No Mix RP?",
      answer: "No Mix RP is a serious GTA V Roleplay community built around immersive, realistic, and enjoyable roleplay with custom economy, dynamic police/EMS factions, and active community events.",
      order_index: 1,
      is_active: true,
    },
    {
      id: "faq-2",
      category_id: "faq-cat-1",
      question: "How do I apply for a Visa / Whitelist?",
      answer: "Authenticate on this website using your Discord account, then head over to /apply to fill out the questionnaire. Once submitted, our recruitment staff will review your application.",
      order_index: 2,
      is_active: true,
    },
    {
      id: "faq-3",
      category_id: "faq-cat-1",
      question: "How long does application review take?",
      answer: "Our recruitment team typically reviews visa applications within 12 to 36 hours. You can track your real-time status on the /status page or await automated Discord notifications.",
      order_index: 3,
      is_active: true,
    },
    {
      id: "faq-4",
      category_id: "faq-cat-1",
      question: "What happens if my application is rejected?",
      answer: "If rejected, constructive feedback from the reviewer will be visible in your private status portal. You are welcome to revise and re-apply once your cooldown period expires.",
      order_index: 4,
      is_active: true,
    },
    {
      id: "faq-5",
      category_id: "faq-cat-2",
      question: "What are the technical requirements to play?",
      answer: "You need a legitimate copy of Grand Theft Auto V on PC (Steam, Epic Games, or Rockstar Games launcher), the FiveM client installed, and a clear microphone.",
      order_index: 1,
      is_active: true,
    },
    {
      id: "faq-6",
      category_id: "faq-cat-4",
      question: "How do I join Police, EMS, or start a business?",
      answer: "Once your Visa is approved, join our Discord and check the department recruitment channels, or apply in-character through city hall and precincts during public hiring drives.",
      order_index: 1,
      is_active: true,
    }
  ];

  public newsCategories: NewsCategory[] = [
    { id: "news-cat-1", name: "Major Update", slug: "major-update", color: "#00F0FF" },
    { id: "news-cat-2", name: "Community Event", slug: "community-event", color: "#FF2A55" },
    { id: "news-cat-3", name: "Law & Order", slug: "law-and-order", color: "#3B82F6" },
    { id: "news-cat-4", name: "Economy & Tuning", slug: "economy-tuning", color: "#10B981" },
  ];

  public newsArticles: NewsArticle[] = [
    {
      id: "art-1",
      title: "No Mix RP 2.0: Cyber-Urban Horizon Update",
      slug: "nomix-2-0-cyber-urban-horizon",
      excerpt: "Rebuilt vehicle handling physics, complete real estate furnishing overhaul, and high-tier black market networks.",
      content: `Welcome to the newest era of No Mix RP. Our engineering and design teams have spent months rebuilding the core engine to deliver unmatched immersion.

### What is New in 2.0:
- **Custom Vehicle Handling 3.0**: Realistic drivetrain loss, downforce calculations, and manual transmission clutch dynamics for tuner builds.
- **Dynamic Real Estate**: Buy any property in Los Santos, customize room layouts with over 1,200 modular props, and install private vaults.
- **Deep Criminal Progression**: Overhauled multi-stage bank heists requiring thermal charges, radio frequency scramblers, and underground hacking minigames.
- **Civilian Careers**: Dynamic logistics supply chain, luxury vehicle dealership management, and player-curated nightclub venues.`,
      cover_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
      category_id: "news-cat-1",
      category: { id: "news-cat-1", name: "Major Update", slug: "major-update", color: "#00F0FF" },
      author_name: "Lead Developer",
      is_published: true,
      published_at: "2026-09-15T18:00:00Z",
      created_at: "2026-09-15T18:00:00Z",
    },
    {
      id: "art-2",
      title: "Grand Vinewood Drift Series: Season 1 Announcement",
      slug: "grand-vinewood-drift-series-season-1",
      excerpt: "Los Santos elite street racers clash for a $250,000 cash prize pool and exclusive vehicle pink slips.",
      content: `Get your tires warmed up! The Vinewood Racing Syndicate in partnership with Los Santos Customs announces Season 1 of the Grand Vinewood Drift Series.

### Event Schedule & Details:
- **Date**: Saturday, 8:00 PM EST
- **Location**: Vinewood Hills Observatory Route
- **Prize**: $250,000 in clean funds + Custom Tuned Benefactor Schafter GTR Pink Slip.
- **Safety**: Medical standbys provided by Mount Zonah EMS. Law enforcement will enforce strict perimeter boundaries.`,
      cover_image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
      category_id: "news-cat-2",
      category: { id: "news-cat-2", name: "Community Event", slug: "community-event", color: "#FF2A55" },
      author_name: "Event Coordinator",
      is_published: true,
      published_at: "2026-09-12T14:30:00Z",
      created_at: "2026-09-12T14:30:00Z",
    },
    {
      id: "art-3",
      title: "San Andreas State Police & LSPD Fleet Upgrade",
      slug: "lspd-fleet-upgrade-air-support",
      excerpt: "State police commission new pursuit interceptor units and advanced thermal-capable air support helicopters.",
      content: `To combat escalating organized crime and high-speed highway evasion, the Mayor's Office has officially funded the LSPD Interceptor Program.

### Fleet Enhancements:
- **Vapid Torrence Interceptor V8**: Specially tuned for freeway pursuit intervention.
- **Air Support Division EC135**: Equipped with thermal night-vision tracking and high-intensity spotlights.
- **Tactical CAD System**: Real-time GPS unit sync and warrant lookup.`,
      cover_image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop",
      category_id: "news-cat-3",
      category: { id: "news-cat-3", name: "Law & Order", slug: "law-and-order", color: "#3B82F6" },
      author_name: "Chief of Police",
      is_published: true,
      published_at: "2026-09-08T20:15:00Z",
      created_at: "2026-09-08T20:15:00Z",
    }
  ];

  public applications: Application[] = [
    {
      id: "app-seed-001",
      application_number: "APP-001042",
      user_id: "usr-demo-applicant",
      discord_id: "789123456789012345",
      discord_username: "SpectreRider",
      character_name: "Marcus Vance",
      character_age: 29,
      character_gender: "Male",
      status: "UNDER_REVIEW",
      submitted_at: "2026-09-18T10:15:00Z",
      created_at: "2026-09-18T10:15:00Z",
      updated_at: "2026-09-18T14:00:00Z",
      answers: [
        { id: "a1", application_id: "app-seed-001", question_key: "age", answer_text: "24", created_at: "2026-09-18T10:15:00Z" },
        { id: "a2", application_id: "app-seed-001", question_key: "country", answer_text: "United States", created_at: "2026-09-18T10:15:00Z" },
        { id: "a3", application_id: "app-seed-001", question_key: "timezone", answer_text: "EST (UTC-5)", created_at: "2026-09-18T10:15:00Z" },
        { id: "a4", application_id: "app-seed-001", question_key: "fivem_id", answer_text: "fivem:spectrerider99", created_at: "2026-09-18T10:15:00Z" },
        { id: "a5", application_id: "app-seed-001", question_key: "played_before", answer_text: "Yes, experienced player", created_at: "2026-09-18T10:15:00Z" },
        { id: "a6", application_id: "app-seed-001", question_key: "previous_servers", answer_text: "Over 800 hours across ProdigyRP and NoPixel WL. Focused on business ownership and vehicle tuning.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a7", application_id: "app-seed-001", question_key: "whitelist_experience", answer_text: "Manager at Hayes Auto and Lead Mechanic.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a8", application_id: "app-seed-001", question_key: "char_name", answer_text: "Marcus Vance", created_at: "2026-09-18T10:15:00Z" },
        { id: "a9", application_id: "app-seed-001", question_key: "char_age", answer_text: "29", created_at: "2026-09-18T10:15:00Z" },
        { id: "a10", application_id: "app-seed-001", question_key: "char_gender", answer_text: "Male", created_at: "2026-09-18T10:15:00Z" },
        { id: "a11", application_id: "app-seed-001", question_key: "char_background", answer_text: "Marcus grew up in industrial Liberty City working in shipping docks. After a syndicate fallout, he relocated west to Los Santos to open a legitimate automotive styling studio.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a12", application_id: "app-seed-001", question_key: "char_personality", answer_text: "Charismatic, loyal to friends, but stubborn and struggles with gambling temptation when cornered.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a13", application_id: "app-seed-001", question_key: "char_goals", answer_text: "Build a high-end luxury vehicle import brand and invest in commercial nightclub real estate.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a14", application_id: "app-seed-001", question_key: "def_rdm", answer_text: "RDM is attacking, damaging, or killing another player without prior verbal interaction, valid motive, or narrative escalation.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a15", application_id: "app-seed-001", question_key: "def_vdm", answer_text: "VDM is using any vehicle as an offensive weapon to ram, kill, or incapacitate players without roleplay context.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a16", application_id: "app-seed-001", question_key: "def_meta", answer_text: "Metagaming is taking information obtained out of character (such as streams or Discord DMs) and acting upon it in-game.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a17", application_id: "app-seed-001", question_key: "def_power", answer_text: "Powergaming is forcing actions on players without giving them a chance to counter (/me knocks out instantly) or roleplaying superhuman physical abilities.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a18", application_id: "app-seed-001", question_key: "def_failrp", answer_text: "Fail RP is failing to value human life, acting out of character, or ignoring immersion. If bugs happen, RP through it and ticket afterward.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a19", application_id: "app-seed-001", question_key: "scenario_police_stop", answer_text: "I pull over immediately, turn off the engine, keep my hands visible on the steering wheel, roleplay my character subtle nervousness in voice, and try to talk my way through the inspection calmly rather than instantly pulling a weapon.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a20", application_id: "app-seed-001", question_key: "scenario_hostage", answer_text: "I value my life completely, follow the robbers instructions, roleplay authentic fear, and cooperate with police negotiators when on scene.", created_at: "2026-09-18T10:15:00Z" },
        { id: "a21", application_id: "app-seed-001", question_key: "scenario_loss", answer_text: "I accept the loss as exciting narrative progression, roleplay the frustration in character, and create a revenge arc instead of complaining out of character.", created_at: "2026-09-18T10:15:00Z" },
      ],
      notes: [
        {
          id: "note-1",
          application_id: "app-seed-001",
          staff_id: "usr-demo-staff",
          staff_name: "NomixRecruiter",
          note: "Strong character backstory and solid understanding of Fear RP and NLR.",
          created_at: "2026-09-18T14:10:00Z",
        }
      ],
      events: [
        {
          id: "evt-1",
          application_id: "app-seed-001",
          actor_name: "SpectreRider",
          event_type: "APPLICATION_SUBMITTED",
          metadata: { app_number: "APP-001042" },
          created_at: "2026-09-18T10:15:00Z",
        },
        {
          id: "evt-2",
          application_id: "app-seed-001",
          actor_name: "NomixRecruiter",
          event_type: "APPLICATION_REVIEW_STARTED",
          metadata: { status: "UNDER_REVIEW" },
          created_at: "2026-09-18T14:00:00Z",
        }
      ]
    }
  ];

  // Helper Methods
  public getRulesWithCategories(): RuleCategory[] {
    return this.ruleCategories.map((cat) => ({
      ...cat,
      rules: this.rules.filter((r) => r.category_id === cat.id && r.is_active),
    }));
  }

  public getFaqsWithCategories(): FAQCategory[] {
    return this.faqCategories.map((cat) => ({
      ...cat,
      faqs: this.faqs.filter((f) => f.category_id === cat.id && f.is_active),
    }));
  }

  public getNews(): NewsArticle[] {
    return this.newsArticles.filter((n) => n.is_published);
  }

  public getNewsBySlug(slug: string): NewsArticle | undefined {
    return this.newsArticles.find((n) => n.slug === slug);
  }

  public getApplications(): Application[] {
    return this.applications;
  }

  public getApplicationById(id: string): Application | undefined {
    return this.applications.find((a) => a.id === id || a.application_number === id);
  }

  public getApplicationByUserId(userId: string): Application | undefined {
    return this.applications.find((a) => a.user_id === userId);
  }

  public getApplicationByDiscordId(discordId: string): Application | undefined {
    return this.applications.find((a) => a.discord_id === discordId);
  }

  public createApplication(data: {
    user_id: string;
    discord_id: string;
    discord_username: string;
    character_name: string;
    character_age: number;
    character_gender: string;
    answers: Record<string, string>;
  }): Application {
    const appCount = this.applications.length + 1043;
    const application_number = `APP-${String(appCount).padStart(6, "0")}`;
    const id = `app-${Date.now()}`;
    const now = new Date().toISOString();

    const formattedAnswers = Object.entries(data.answers).map(([key, value]) => ({
      id: `ans-${Math.random().toString(36).substring(2, 9)}`,
      application_id: id,
      question_key: key,
      answer_text: String(value),
      created_at: now,
    }));

    const newApp: Application = {
      id,
      application_number,
      user_id: data.user_id,
      discord_id: data.discord_id,
      discord_username: data.discord_username,
      character_name: data.character_name,
      character_age: data.character_age,
      character_gender: data.character_gender,
      status: "PENDING",
      submitted_at: now,
      created_at: now,
      updated_at: now,
      answers: formattedAnswers,
      notes: [],
      events: [
        {
          id: `evt-${Date.now()}`,
          application_id: id,
          actor_name: data.discord_username,
          event_type: "APPLICATION_SUBMITTED",
          metadata: { app_number: application_number },
          created_at: now,
        }
      ],
    };

    this.applications.unshift(newApp);
    return newApp;
  }

  public updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    reviewer: { id: string; name: string },
    rejection_reason?: string
  ): { success: boolean; application?: Application; message?: string } {
    const app = this.applications.find((a) => a.id === id || a.application_number === id);
    if (!app) {
      return { success: false, message: "Application not found." };
    }

    if (app.status === "APPROVED" && status === "APPROVED") {
      return { success: false, message: "This application is already approved." };
    }

    const now = new Date().toISOString();
    app.status = status;
    app.reviewer_id = reviewer.id;
    app.reviewer_name = reviewer.name;
    app.reviewed_at = now;
    app.updated_at = now;

    if (status === "REJECTED") {
      app.rejection_reason = rejection_reason || "Application does not meet server roleplay criteria.";
    } else if (status === "APPROVED") {
      app.rejection_reason = undefined;
    }

    const eventType = status === "APPROVED" ? "APPLICATION_APPROVED" : status === "REJECTED" ? "APPLICATION_REJECTED" : "APPLICATION_REVIEW_STARTED";

    if (!app.events) app.events = [];
    app.events.push({
      id: `evt-${Date.now()}`,
      application_id: app.id,
      actor_id: reviewer.id,
      actor_name: reviewer.name,
      event_type: eventType,
      metadata: { status, rejection_reason },
      created_at: now,
    });

    return { success: true, application: app };
  }

  public addStaffNote(id: string, staff: { id: string; name: string }, noteText: string): StaffNote | null {
    const app = this.applications.find((a) => a.id === id || a.application_number === id);
    if (!app) return null;

    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      application_id: app.id,
      staff_id: staff.id,
      staff_name: staff.name,
      note: noteText,
      created_at: new Date().toISOString(),
    };

    if (!app.notes) app.notes = [];
    app.notes.push(newNote);

    if (!app.events) app.events = [];
    app.events.push({
      id: `evt-${Date.now()}`,
      application_id: app.id,
      actor_id: staff.id,
      actor_name: staff.name,
      event_type: "STAFF_NOTE_ADDED",
      metadata: { note_id: newNote.id },
      created_at: new Date().toISOString(),
    });

    return newNote;
  }

  public getServerStatus(): ServerStatusData {
    return {
      online: true,
      players: 142,
      max_players: 200,
      ping: 38,
      queue: 6,
      uptime: "99.8%",
      server_name: "No Mix RP | Season 2",
      is_mock: true,
    };
  }
}

// Global singleton instance
export const mockDb = new DatabaseStore();
