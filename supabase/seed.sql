-- ==============================================================================
-- NO MIX RP SEED DATA (OFFICIAL SERVER RULES & REGULATIONS)
-- ==============================================================================

-- 1. SERVER SETTINGS
INSERT INTO public.server_settings (key, value) VALUES 
('general', '{"server_name": "No Mix RP", "slogan": "YOUR CITY. YOUR STORY. YOUR LEGACY.", "max_slots": 200, "cooldown_days": 3, "connect_url": "fivem://connect/play.nomixrp.com"}'::jsonb),
('discord', '{"guild_id": "123456789012345678", "staff_role_id": "123456789012345679", "verified_role_id": "123456789012345680", "apps_channel_id": "123456789012345681", "approved_channel_id": "123456789012345682", "rejected_channel_id": "123456789012345683"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. 17 OFFICIAL RULE CATEGORIES
INSERT INTO public.rule_categories (id, name, slug, description, order_index) VALUES
('10000000-0000-0000-0000-000000000001', '1. General Community Rules', 'general-community', 'Core standards of behavior, mutual respect, anti-hate speech, and staff directives.', 1),
('10000000-0000-0000-0000-000000000002', '2. Discord Verification', 'discord-verification', 'Rules regarding Discord membership, single account policy, and ban evasion prevention.', 2),
('10000000-0000-0000-0000-000000000003', '3. Roleplay Rules', 'roleplay-rules', 'Serious RP standards: In-character mandate, Fail RP, RDM, VDM, Metagaming, Powergaming, Fear RP, and Combat Logging.', 3),
('10000000-0000-0000-0000-000000000004', '4. New Life Rule (NLR)', 'new-life-rule', 'Guidelines governing memory loss and scene return after legitimate character death.', 4),
('10000000-0000-0000-0000-000000000005', '5. Police & Law Enforcement RP', 'police-law-enforcement', 'Legitimate police interaction, cop baiting bans, corruption guidelines, and restricted equipment.', 5),
('10000000-0000-0000-0000-000000000006', '6. Medical / Hospital RP', 'medical-hospital', 'Respect for EMS personnel, realistic medical injury roleplay, and hospital triage priorities.', 6),
('10000000-0000-0000-0000-000000000007', '7. Criminal & Gang RP', 'criminal-gang', 'Purpose-driven crime, robbery restrictions, hostage guidelines, gang wars, and proportional violence.', 7),
('10000000-0000-0000-0000-000000000008', '8. Vehicle Rules', 'vehicle-rules', 'Realistic driving standards, unrealistic vehicle usage, vehicle ramming, and vehicle theft rules.', 8),
('10000000-0000-0000-0000-000000000009', '9. Economy & Property', 'economy-property', 'Strict prohibition on money glitches, item duplication, Real Money Trading (RMT), and account sharing.', 9),
('10000000-0000-0000-0000-000000000010', '10. Cheating & Third-Party Software', 'cheating-software', 'Zero tolerance for trainers, injectors, aimbots, ESP, god modes, and unauthorized mod menus.', 10),
('10000000-0000-0000-0000-000000000011', '11. Bugs & Exploits', 'bugs-exploits', 'Mandatory reporting of discovered bugs and prohibition on exploit abuse.', 11),
('10000000-0000-0000-0000-000000000012', '12. Staff & Administration', 'staff-administration', 'Staff authority, decision appeals, anti-impersonation, and non-interference with moderation.', 12),
('10000000-0000-0000-0000-000000000013', '13. Streaming & Content Creation', 'streaming-content', 'Broadcasting permissions, stream sniping bans, and community reputation standards.', 13),
('10000000-0000-0000-0000-000000000014', '14. Voice & Communication', 'voice-communication', 'Voice changer standards, soundboard restrictions, and microphone spam prevention.', 14),
('10000000-0000-0000-0000-000000000015', '15. Reports & Appeals', 'reports-appeals', 'Player report procedures, evidence requirements, and ban appeal channels.', 15),
('10000000-0000-0000-0000-000000000016', '16. Rule Interpretation', 'rule-interpretation', 'Spirit of the community and strict prohibition on intentionally exploiting technical loopholes.', 16),
('10000000-0000-0000-0000-000000000017', '17. Punishments', 'punishments', 'Disciplinary ladder: Warning → Kick → Temporary Ban → Whitelist Suspension → Permanent Ban.', 17)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. OFFICIAL RULES
INSERT INTO public.rules (category_id, rule_number, title, description, content, severity, order_index) VALUES
-- 1. General Community Rules
('10000000-0000-0000-0000-000000000001', '1.1', 'Respect Everyone', 'Treat all members, players, staff, and departments with respect.', 'Harassment, bullying, discrimination, threats, personal attacks, or targeted abuse will not be tolerated.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000001', '1.2', 'No Hate Speech', 'Racist, homophobic, sexist, religiously targeted, or otherwise hateful content is prohibited.', 'Hate speech results in an immediate permanent ban without appeal.', 'CRITICAL', 2),
('10000000-0000-0000-0000-000000000001', '1.3', 'No Excessive Toxicity', 'Trash talk and in-character arguments are acceptable within reasonable RP limits. Personal attacks outside RP are not.', 'Keep all conflict strictly in character. Toxic behavior outside RP is prohibited.', 'HIGH', 3),
('10000000-0000-0000-0000-000000000001', '1.4', 'No Spamming', 'Do not spam messages, emojis, mentions, sounds, images, or commands.', 'Spamming disrupts the community and will result in communication mutes or kicks.', 'LOW', 4),
('10000000-0000-0000-0000-000000000001', '1.5', 'No Unauthorised Advertising', 'Advertising other FiveM servers, Discord communities, websites, services, or products without permission is prohibited.', 'Direct message advertising or public promotion of other communities results in a ban.', 'HIGH', 5),
('10000000-0000-0000-0000-000000000001', '1.6', 'No NSFW Content', 'Pornographic, sexually explicit, or excessively graphic content is prohibited.', 'Posting adult or graphic content results in immediate permanent ban.', 'CRITICAL', 6),
('10000000-0000-0000-0000-000000000001', '1.7', 'Follow Staff Instructions', 'Staff instructions must be followed. If you disagree with a decision, use the appropriate appeal or support system.', 'Do not argue with staff during active situations. Comply and appeal via support tickets.', 'HIGH', 7),

-- 2. Discord Verification
('10000000-0000-0000-0000-000000000002', '2.1', 'Verification Required', 'All members must complete the official No Mix RP verification process before accessing the full Discord community.', 'Complete verification to gain citizen access and whitelist participation.', 'MEDIUM', 1),
('10000000-0000-0000-0000-000000000002', '2.2', 'One Account', 'Do not use alternate Discord accounts to bypass restrictions, punishments, or bans.', 'Players are permitted exactly one primary Discord and FiveM account.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000002', '2.3', 'Ban Evasion', 'Creating or using another account to evade a Discord or No Mix RP punishment will result in further action.', 'Ban evasion leads to permanent blacklisting of all associated identifiers.', 'CRITICAL', 3),
('10000000-0000-0000-0000-000000000002', '2.4', 'False Information', 'Do not intentionally provide false information during verification, applications, or staff investigations.', 'Providing false age or history will lead to whitelist revocation.', 'HIGH', 4),

-- 3. Roleplay Rules
('10000000-0000-0000-0000-000000000003', '3.1', 'Stay In Character', 'Remain in character during active RP situations unless a staff member instructs otherwise.', 'No Mix RP is a serious roleplay server. Value realistic and immersive interactions at all times.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000003', '3.2', 'Fail RP', 'Do not perform actions that are clearly unrealistic or intended to break immersion.', 'Surviving unrealistic crashes without consequences, ignoring serious injuries, performing unrealistic stunts during serious situations, or treating the game like an arcade environment is prohibited.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000003', '3.3', 'Random Deathmatch — RDM', 'You may not kill or attack another player without a valid roleplay reason.', 'Meaningful verbal interaction and escalation must precede any hostile force.', 'CRITICAL', 3),
('10000000-0000-0000-0000-000000000003', '3.4', 'Vehicle Deathmatch — VDM', 'Using a vehicle as a weapon against another player without a valid RP reason is prohibited.', 'Using vehicles to ram or kill pedestrians without roleplay context is banned.', 'CRITICAL', 4),
('10000000-0000-0000-0000-000000000003', '3.5', 'Meta Gaming', 'Do not use information obtained outside the game to influence your character actions.', 'Using Discord info in RP, watching streams to locate players, or using real names seen on Discord is Metagaming.', 'CRITICAL', 5),
('10000000-0000-0000-0000-000000000003', '3.6', 'Power Gaming', 'Do not force actions or outcomes onto another player without giving them a reasonable opportunity to respond.', 'Roleplaying impossible physical feats or forcing unavoidable /me outcomes is powergaming.', 'HIGH', 6),
('10000000-0000-0000-0000-000000000003', '3.7', 'Fear RP / Value of Life', 'Your character must value their life.', 'If you are held at gunpoint or placed in a clearly dangerous situation, you must respond realistically.', 'CRITICAL', 7),
('10000000-0000-0000-0000-000000000003', '3.8', 'Combat Logging', 'Leaving the server to avoid an active RP situation, arrest, death, robbery, or other consequence is prohibited.', 'Disconnecting during active scenes results in bans.', 'CRITICAL', 8),
('10000000-0000-0000-0000-000000000003', '3.9', 'RP Avoidance', 'Do not intentionally avoid roleplay by hiding, disconnecting, switching characters, or exploiting game mechanics.', 'Engage in scenes even when your character experiences defeat.', 'HIGH', 9),

-- 4. New Life Rule
('10000000-0000-0000-0000-000000000004', '4.1', 'New Life Rule (NLR)', 'Guidelines governing memory loss and scene return after legitimate character death.', 'If killed/respawned: do not immediately return to the scene, do not use info from your previous life, and do not seek revenge based on lost knowledge.', 'MEDIUM', 1),

-- 5. Police & Law Enforcement RP
('10000000-0000-0000-0000-000000000005', '5.1', 'Respect Law Enforcement RP', 'Police, Sheriff Office, and other law enforcement personnel must be treated as legitimate RP characters.', 'Treat officers as legitimate characters maintaining city stability.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000005', '5.2', 'No Cop Baiting', 'Do not intentionally provoke police solely to create a pursuit or gunfight without a legitimate RP reason.', 'Baiting chases or burnouts in front of precincts without RP context is prohibited.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000005', '5.3', 'Realistic Police Interaction', 'Law enforcement must follow reasonable procedures and should not abuse their authority.', 'Proportional procedures must be followed during stops, detentions, and searches.', 'MEDIUM', 3),
('10000000-0000-0000-0000-000000000005', '5.4', 'Police Corruption', 'Police corruption is permitted only if specifically authorized by No Mix RP management.', 'Unauthorized corruption without management sign-off is strictly prohibited.', 'CRITICAL', 4),
('10000000-0000-0000-0000-000000000005', '5.5', 'Police Equipment', 'Do not steal, duplicate, spawn, or obtain restricted police equipment through exploits or unauthorized methods.', 'Restricted department equipment is strictly regulated.', 'HIGH', 5),

-- 6. Medical / Hospital RP
('10000000-0000-0000-0000-000000000006', '6.1', 'Respect Medical Personnel', 'Do not intentionally attack, harass, or obstruct EMS and hospital personnel without a legitimate RP reason.', 'On-duty medical staff are neutral life-savers.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000006', '6.2', 'Medical RP', 'Players are expected to participate realistically in medical scenarios.', 'Roleplay injuries honestly when evaluated by paramedics or doctors.', 'MEDIUM', 2),
('10000000-0000-0000-0000-000000000006', '6.3', 'No Fake Medical Knowledge', 'Do not use unrealistic medical actions simply to avoid RP consequences.', 'Do not claim impossible medical recovery without certified staff.', 'MEDIUM', 3),
('10000000-0000-0000-0000-000000000006', '6.4', 'EMS Priorities', 'Medical personnel may prioritize active emergencies, critical patients, and mass-casualty incidents.', 'EMS resources are triaged based on urgency of care.', 'LOW', 4),

-- 7. Criminal & Gang RP
('10000000-0000-0000-0000-000000000007', '7.1', 'Criminal RP Must Have Purpose', 'Criminal activity should create roleplay rather than simply generate money or kills.', 'Meaningful storylines and rivalries should drive criminal endeavors.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000007', '7.2', 'No Random Robbery', 'Do not repeatedly rob random players without legitimate RP interaction.', 'Chain robbing civilians with zero prior dialogue or motive is forbidden.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000007', '7.3', 'Hostages', 'Hostage situations must involve meaningful RP and may not be created solely to force unrealistic demands.', 'Fake or collaborative hostages are strictly prohibited.', 'HIGH', 3),
('10000000-0000-0000-0000-000000000007', '7.4', 'Gang Wars', 'Gang conflicts must have legitimate RP reasons. Randomly attacking another gang without established conflict is prohibited.', 'Territory wars require narrative buildup.', 'HIGH', 4),
('10000000-0000-0000-0000-000000000007', '7.5', 'Excessive Violence', 'Violence should be proportional to the situation and should contribute to the RP.', 'Extreme torture/violence requires explicit mutual consent.', 'HIGH', 5),

-- 8. Vehicle Rules
('10000000-0000-0000-0000-000000000008', '8.1', 'Realistic Driving', 'Drive appropriately for the vehicle and situation.', 'Supercars driving off-road or ignoring massive crash damage is Fail RP.', 'MEDIUM', 1),
('10000000-0000-0000-0000-000000000008', '8.2', 'Unrealistic Vehicle Use', 'Do not intentionally use vehicles in ways that are clearly unrealistic solely to gain an advantage.', 'Using cars to block interior building doors or climb roofs is prohibited.', 'MEDIUM', 2),
('10000000-0000-0000-0000-000000000008', '8.3', 'Vehicle Ramming', 'Intentional ramming is prohibited unless justified by the RP situation.', 'Head-on ramming at high speed is prohibited.', 'HIGH', 3),
('10000000-0000-0000-0000-000000000008', '8.4', 'Vehicle Theft', 'Vehicle theft must involve roleplay and should not be used to randomly inconvenience players.', 'Theft must have narrative context.', 'MEDIUM', 4),

-- 9. Economy & Property
('10000000-0000-0000-0000-000000000009', '9.1', 'Exploits', 'Using bugs, glitches, duplication methods, or other exploits to obtain money, items, vehicles, or advantages is strictly prohibited.', 'Duping or money glitches result in permanent ban and wipe.', 'CRITICAL', 1),
('10000000-0000-0000-0000-000000000009', '9.2', 'Exploit Reporting', 'If you discover an exploit, report it to staff instead of abusing it.', 'Prompt exploit reporting is rewarded.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000009', '9.3', 'Real Money Trading', 'Selling in-game money, items, vehicles, properties, or accounts for unauthorized real-world currency is prohibited.', 'RMT results in permanent blacklist for all parties.', 'CRITICAL', 3),
('10000000-0000-0000-0000-000000000009', '9.4', 'Account Sharing', 'Do not share your FiveM, Discord, or No Mix RP account with another person.', 'You are responsible for all actions on your whitelist account.', 'HIGH', 4),

-- 10. Cheating & Third-Party Software
('10000000-0000-0000-0000-000000000010', '10.1', 'Prohibited Software', 'The use of cheats, trainers, injectors, aimbots, ESP, god modes, or unauthorized menus is strictly prohibited.', 'Software providing unfair advantage results in permanent hardware ban.', 'CRITICAL', 1),

-- 11. Bugs & Exploits
('10000000-0000-0000-0000-000000000011', '11.1', 'Bugs & Exploits Policy', 'If you discover a bug: DO NOT ABUSE IT. Report it to staff immediately.', 'Abusing exploits results in permanent ban even if you did not discover it.', 'CRITICAL', 1),

-- 12. Staff & Administration
('10000000-0000-0000-0000-000000000012', '12.1', 'Staff Abuse', 'Staff members may not use their powers for personal benefit.', 'Staff permissions are strictly audited.', 'HIGH', 1),
('10000000-0000-0000-0000-000000000012', '12.2', 'Staff Decisions', 'Do not argue with staff during active RP situations. Use a ticket or appeal system.', 'Disputes must be raised through tickets, not in-game.', 'HIGH', 2),
('10000000-0000-0000-0000-000000000012', '12.3', 'Fake Staff', 'Do not impersonate No Mix RP staff members.', 'Impersonating moderation is forbidden.', 'HIGH', 3),
('10000000-0000-0000-0000-000000000012', '12.4', 'Staff Interference', 'Do not intentionally interrupt an ongoing staff investigation or moderation action.', 'Do not obstruct staff duties.', 'MEDIUM', 4),

-- 13. Streaming & Content Creation
('10000000-0000-0000-0000-000000000013', '13.1', 'Streaming', 'Players are allowed to stream No Mix RP unless restricted by a specific event or staff instruction.', 'Streaming is permitted following all server guidelines.', 'LOW', 1),
('10000000-0000-0000-0000-000000000013', '13.2', 'Stream Sniping', 'Using a livestream, video, or recording to obtain information about another player location or actions is prohibited.', 'Stream sniping is Metagaming and results in immediate ban.', 'CRITICAL', 2),
('10000000-0000-0000-0000-000000000013', '13.3', 'Content & Reputation', 'Creators must not intentionally damage the reputation of No Mix RP through fabricated claims, malicious manipulation, or harassment.', 'Constructive feedback in tickets is welcomed.', 'HIGH', 3),

-- 14. Voice & Communication
('10000000-0000-0000-0000-000000000014', '14.1', 'Voice Changers', 'Voice changers may be used when they contribute to RP and do not interfere with communication.', 'Voice changers allowed if clear and intelligible.', 'LOW', 1),
('10000000-0000-0000-0000-000000000014', '14.2', 'Soundboards', 'Do not use soundboards or loud audio to disrupt RP.', 'Meme soundboards or mic spam is prohibited.', 'MEDIUM', 2),
('10000000-0000-0000-0000-000000000014', '14.3', 'Microphone Abuse', 'Excessive screaming, music, noise, or microphone spam is prohibited.', 'Clean audio quality required.', 'MEDIUM', 3),

-- 15. Reports & Appeals
('10000000-0000-0000-0000-000000000015', '15.1', 'Player Reports', 'Use the official reporting system to report rule violations.', 'Report violations through Discord ticket system.', 'LOW', 1),
('10000000-0000-0000-0000-000000000015', '15.2', 'Evidence', 'Provide relevant evidence whenever possible (Video, Screenshots, Clip timestamps, Player IDs).', 'Clips and logs required for report resolution.', 'LOW', 2),
('10000000-0000-0000-0000-000000000015', '15.3', 'False Reports', 'Do not submit reports with fabricated evidence or intentionally false accusations.', 'Falsified reports result in punishment for reporting party.', 'HIGH', 3),
('10000000-0000-0000-0000-000000000015', '15.4', 'Ban Appeals', 'Players may appeal punishments through the official No Mix RP appeal system.', 'Appeals evaluated based on accountability and elapsed time.', 'LOW', 4),

-- 16. Rule Interpretation
('10000000-0000-0000-0000-000000000016', '16.1', 'Spirit of the Rules & Loophole Exploitation', '\"It is not specifically written in the rules\" is not a valid excuse for intentionally abusing a loophole.', 'Staff take action against loophole abuse, RP damage, or spirit violations.', 'HIGH', 1),

-- 17. Punishments
('10000000-0000-0000-0000-000000000017', '17.1', 'Punishment Ladder', 'Warning → Kick → Temporary Ban → Whitelist Suspension → Permanent Ban.', 'Severity depends on violation severity, previous punishments, intent, repeated offenses, and impact on players.', 'HIGH', 1)
ON CONFLICT DO NOTHING;
