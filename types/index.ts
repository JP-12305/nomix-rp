export type UserRole = 'applicant' | 'staff' | 'admin';

export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ApplicationQuestion {
  id: string;
  step_number: number;
  field_key: string;
  label: string;
  description?: string;
  question_type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  placeholder?: string;
  is_required: boolean;
  min_length?: number;
  order_index: number;
  is_active: boolean;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  question_id?: string;
  question_key: string;
  answer_text: string;
  created_at: string;
}

export interface StaffNote {
  id: string;
  application_id: string;
  staff_id: string;
  staff_name: string;
  note: string;
  created_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  actor_id?: string;
  actor_name?: string;
  event_type: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Application {
  id: string;
  application_number: string;
  user_id: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
  character_age: number;
  character_gender: string;
  status: ApplicationStatus;
  rejection_reason?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  answers?: ApplicationAnswer[];
  notes?: StaffNote[];
  events?: ApplicationEvent[];
}

export interface RuleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  rules?: Rule[];
}

export interface Rule {
  id: string;
  category_id: string;
  rule_number: string;
  title: string;
  description: string;
  content?: string;
  severity: RuleSeverity;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  faqs?: FAQItem[];
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category_id: string;
  category?: NewsCategory;
  author_name: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface ServerStatusData {
  online: boolean;
  players: number;
  max_players: number;
  ping: number;
  queue: number;
  uptime: string;
  server_name: string;
  is_mock: boolean;
}
