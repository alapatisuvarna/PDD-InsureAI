-- InsureAI Complete Database Schema
-- Run this entire script in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  occupation text,
  annual_income numeric(12,2),
  address jsonb default '{}',
  nominee jsonb default '{}',
  kyc_status text default 'pending' check (kyc_status in ('pending', 'submitted', 'verified', 'rejected')),
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'agent', 'admin')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- INSURANCE PROVIDERS TABLE
-- ============================================
create table if not exists public.insurance_providers (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  logo_url text,
  description text,
  claim_settlement_ratio numeric(5,2),
  solvency_ratio numeric(5,2),
  established_year integer,
  headquarters text,
  customer_support text,
  website text,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- ============================================
-- POLICIES TABLE
-- ============================================
create table if not exists public.policies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider_id uuid references public.insurance_providers(id),
  policy_number text not null,
  policy_type text not null check (policy_type in ('health', 'life', 'vehicle', 'travel', 'property', 'business')),
  policy_name text not null,
  description text,
  premium_amount numeric(12,2) not null,
  coverage_amount numeric(15,2) not null,
  start_date date not null,
  end_date date not null,
  status text default 'active' check (status in ('active', 'expired', 'cancelled', 'pending')),
  deductible numeric(12,2) default 0,
  waiting_period integer default 0,
  riders text[] default '{}',
  benefits text[] default '{}',
  exclusions text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- POLICY DOCUMENTS TABLE
-- ============================================
create table if not exists public.policy_documents (
  id uuid default uuid_generate_v4() primary key,
  policy_id uuid references public.policies(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  file_type text,
  uploaded_at timestamptz default now() not null
);

-- ============================================
-- CLAIMS TABLE
-- ============================================
create table if not exists public.claims (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  policy_id uuid references public.policies(id) on delete set null,
  claim_number text not null unique,
  claim_type text not null,
  description text not null,
  claim_amount numeric(12,2) not null,
  settled_amount numeric(12,2),
  status text default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled')),
  incident_date date not null,
  submitted_date timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- CLAIM DOCUMENTS TABLE
-- ============================================
create table if not exists public.claim_documents (
  id uuid default uuid_generate_v4() primary key,
  claim_id uuid references public.claims(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  file_type text,
  uploaded_at timestamptz default now() not null
);

-- ============================================
-- CLAIM TIMELINE TABLE
-- ============================================
create table if not exists public.claim_timeline (
  id uuid default uuid_generate_v4() primary key,
  claim_id uuid references public.claims(id) on delete cascade not null,
  status text not null,
  message text not null,
  created_by text,
  created_at timestamptz default now() not null
);

-- ============================================
-- PREMIUM PAYMENTS TABLE
-- ============================================
create table if not exists public.premium_payments (
  id uuid default uuid_generate_v4() primary key,
  policy_id uuid references public.policies(id) on delete cascade not null,
  amount numeric(12,2) not null,
  payment_date timestamptz not null,
  payment_method text,
  transaction_id text,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  receipt_url text,
  created_at timestamptz default now() not null
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('reminder', 'alert', 'info', 'success', 'warning')),
  is_read boolean default false,
  action_url text,
  related_id uuid,
  related_type text,
  created_at timestamptz default now() not null
);

-- ============================================
-- RISK ASSESSMENTS TABLE
-- ============================================
create table if not exists public.risk_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  health_score integer check (health_score between 0 and 100),
  driving_score integer check (driving_score between 0 and 100),
  financial_score integer check (financial_score between 0 and 100),
  lifestyle_score integer check (lifestyle_score between 0 and 100),
  overall_score integer check (overall_score between 0 and 100),
  risk_category text check (risk_category in ('low', 'moderate', 'high', 'critical')),
  factors jsonb default '[]',
  recommendations text[] default '{}',
  created_at timestamptz default now() not null
);

-- ============================================
-- RECOMMENDATIONS TABLE
-- ============================================
create table if not exists public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  assessment_id uuid references public.risk_assessments(id) on delete set null,
  policy_type text not null,
  provider_name text not null,
  product_name text not null,
  recommended_coverage numeric(15,2),
  estimated_premium numeric(12,2),
  match_score integer check (match_score between 0 and 100),
  reasons text[] default '{}',
  features text[] default '{}',
  ai_summary text,
  is_saved boolean default false,
  created_at timestamptz default now() not null
);

-- ============================================
-- CHAT SESSIONS TABLE
-- ============================================
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  messages jsonb default '[]',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_policies_user_id on public.policies(user_id);
create index if not exists idx_policies_status on public.policies(status);
create index if not exists idx_policies_end_date on public.policies(end_date);
create index if not exists idx_claims_user_id on public.claims(user_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_chat_sessions_user_id on public.chat_sessions(user_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);

-- ============================================
-- TRIGGERS — auto-update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_policies_updated before update on public.policies
  for each row execute function public.handle_updated_at();

create trigger on_claims_updated before update on public.claims
  for each row execute function public.handle_updated_at();

create trigger on_chat_sessions_updated before update on public.chat_sessions
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.insurance_providers enable row level security;
alter table public.policies enable row level security;
alter table public.policy_documents enable row level security;
alter table public.claims enable row level security;
alter table public.claim_documents enable row level security;
alter table public.claim_timeline enable row level security;
alter table public.premium_payments enable row level security;
alter table public.notifications enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.recommendations enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

-- Insurance Providers RLS (public read, admin write)
create policy "Anyone can view active providers" on public.insurance_providers for select using (is_active = true);
create policy "Admins can manage providers" on public.insurance_providers for all using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

-- Policies RLS
create policy "Users can view own policies" on public.policies for select using (auth.uid() = user_id);
create policy "Users can insert own policies" on public.policies for insert with check (auth.uid() = user_id);
create policy "Users can update own policies" on public.policies for update using (auth.uid() = user_id);
create policy "Users can delete own policies" on public.policies for delete using (auth.uid() = user_id);
create policy "Admins and agents can view all policies" on public.policies for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role in ('admin', 'agent'))
);

-- Policy Documents RLS
create policy "Users can manage own policy docs" on public.policy_documents for all using (
  exists (select 1 from public.policies where id = policy_id and user_id = auth.uid())
);

-- Claims RLS
create policy "Users can view own claims" on public.claims for select using (auth.uid() = user_id);
create policy "Users can insert own claims" on public.claims for insert with check (auth.uid() = user_id);
create policy "Users can update own draft claims" on public.claims for update using (
  auth.uid() = user_id and status = 'draft'
);
create policy "Admins can manage all claims" on public.claims for all using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

-- Claim Documents RLS
create policy "Users can manage own claim docs" on public.claim_documents for all using (
  exists (select 1 from public.claims where id = claim_id and user_id = auth.uid())
);

-- Claim Timeline RLS
create policy "Users can view own claim timeline" on public.claim_timeline for select using (
  exists (select 1 from public.claims where id = claim_id and user_id = auth.uid())
);
create policy "Anyone can insert timeline" on public.claim_timeline for insert with check (true);

-- Notifications RLS
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Anyone can insert notifications" on public.notifications for insert with check (true);

-- Risk Assessments RLS
create policy "Users can manage own risk assessments" on public.risk_assessments for all using (auth.uid() = user_id);

-- Recommendations RLS
create policy "Users can manage own recommendations" on public.recommendations for all using (auth.uid() = user_id);

-- Chat Sessions RLS
create policy "Users can manage own chat sessions" on public.chat_sessions for all using (auth.uid() = user_id);

-- Audit Logs RLS
create policy "Admins can view audit logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);
create policy "Anyone can insert audit logs" on public.audit_logs for insert with check (true);

-- Premium Payments RLS
create policy "Users can view own payments" on public.premium_payments for select using (
  exists (select 1 from public.policies where id = policy_id and user_id = auth.uid())
);

-- ============================================
-- STORAGE BUCKETS (run in Storage section)
-- ============================================
-- insert into storage.buckets (id, name, public) values ('policy-documents', 'policy-documents', true);
-- insert into storage.buckets (id, name, public) values ('claim-documents', 'claim-documents', true);
-- insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false);
-- insert into storage.buckets (id, name, public) values ('profile-avatars', 'profile-avatars', true);

-- ============================================
-- SEED DATA — Insurance Providers
-- ============================================
insert into public.insurance_providers (name, description, claim_settlement_ratio, solvency_ratio, established_year, headquarters, website) values
  ('ICICI Lombard', 'India''s leading private sector general insurance company', 97.80, 2.35, 2001, 'Mumbai', 'https://www.icicilombard.com'),
  ('HDFC ERGO', 'Joint venture between HDFC and ERGO International', 98.05, 1.87, 2002, 'Mumbai', 'https://www.hdfcergo.com'),
  ('Star Health', 'India''s first standalone health insurance company', 99.06, 1.72, 2006, 'Chennai', 'https://www.starhealth.in'),
  ('SBI General', 'General insurance arm of State Bank of India', 93.20, 2.10, 2009, 'Mumbai', 'https://www.sbigeneral.in'),
  ('Bajaj Allianz', 'JV between Bajaj Finserv and Allianz SE', 95.78, 2.54, 2001, 'Pune', 'https://www.bajajallianz.com'),
  ('New India Assurance', 'India''s largest general insurance company', 87.45, 1.92, 1919, 'Mumbai', 'https://www.newindia.co.in'),
  ('Tata AIG', 'Joint venture between Tata Group and AIG', 96.40, 2.28, 2001, 'Mumbai', 'https://www.tataaig.com'),
  ('Max Life Insurance', 'Leading non-participating term life insurer', 99.51, 2.62, 2000, 'New Delhi', 'https://www.maxlifeinsurance.com'),
  ('HDFC Life', 'Leading long-term life insurance solutions', 99.39, 1.88, 2000, 'Mumbai', 'https://www.hdfclife.com'),
  ('LIC of India', 'India''s largest life insurer', 98.62, 1.75, 1956, 'Mumbai', 'https://www.licindia.in')
on conflict (name) do nothing;
