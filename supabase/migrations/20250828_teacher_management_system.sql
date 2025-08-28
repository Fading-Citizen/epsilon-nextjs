-- Migration: Create teacher management tables and chat system
-- Date: 2025-08-28
-- Description: Adds teachers, students, groups, and messages tables with RLS policies

-- Create teachers table (extending user profiles)
create table if not exists public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique,
  specialization text,
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create students table with teacher affiliation
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text,
  enrollment_date date default current_date,
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  teacher_id uuid references public.teachers(id) on delete set null,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  last_activity timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create groups table with teacher ownership
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#3b82f6',
  is_active boolean default true,
  teacher_id uuid references public.teachers(id) on delete set null,
  student_count integer default 0,
  course_count integer default 0,
  permissions text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create group memberships (many-to-many students <-> groups)
create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (group_id, student_id)
);

-- Create messages table for chat system
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_students_teacher_id on public.students(teacher_id);
create index if not exists idx_students_status on public.students(status);
create index if not exists idx_groups_teacher_id on public.groups(teacher_id);
create index if not exists idx_groups_active on public.groups(is_active);
create index if not exists idx_messages_channel on public.messages(channel);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_messages_channel_created on public.messages(channel, created_at desc);
create index if not exists idx_group_members_group on public.group_members(group_id);
create index if not exists idx_group_members_student on public.group_members(student_id);

-- Enable Row Level Security
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.messages enable row level security;

-- RLS Policies for teachers table
create policy "Teachers can view all teachers" on public.teachers
  for select using (auth.role() = 'authenticated');

create policy "Teachers can update their own profile" on public.teachers
  for update using (auth.uid() = id);

create policy "Teachers can insert their own profile" on public.teachers
  for insert with check (auth.uid() = id);

-- RLS Policies for students table
create policy "Teachers can view all students" on public.students
  for select using (
    exists (select 1 from public.teachers where id = auth.uid())
  );

create policy "Teachers can manage their own students" on public.students
  for all using (
    exists (select 1 from public.teachers where id = auth.uid() and id = students.teacher_id)
  );

create policy "Students can view their own profile" on public.students
  for select using (user_id = auth.uid());

-- RLS Policies for groups table
create policy "Teachers can view all groups" on public.groups
  for select using (
    exists (select 1 from public.teachers where id = auth.uid())
  );

create policy "Teachers can manage their own groups" on public.groups
  for all using (
    exists (select 1 from public.teachers where id = auth.uid() and id = groups.teacher_id)
  );

-- RLS Policies for group members
create policy "Teachers can view group memberships" on public.group_members
  for select using (
    exists (
      select 1 from public.groups g 
      join public.teachers t on g.teacher_id = t.id 
      where g.id = group_members.group_id and t.id = auth.uid()
    )
  );

create policy "Teachers can manage group memberships" on public.group_members
  for all using (
    exists (
      select 1 from public.groups g 
      join public.teachers t on g.teacher_id = t.id 
      where g.id = group_members.group_id and t.id = auth.uid()
    )
  );

-- RLS Policies for messages table
create policy "Users can view general channel messages" on public.messages
  for select using (channel = 'general');

create policy "Users can view private channel messages they participate in" on public.messages
  for select using (
    channel like 'dm_%' and position(auth.uid()::text in channel) > 0
  );

create policy "Authenticated users can send messages to general channel" on public.messages
  for insert with check (
    auth.uid() = sender_id and channel = 'general'
  );

create policy "Users can send messages to private channels they participate in" on public.messages
  for insert with check (
    auth.uid() = sender_id 
    and channel like 'dm_%' 
    and position(auth.uid()::text in channel) > 0
  );

-- Create triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_teachers_updated_at before update on public.teachers
  for each row execute function update_updated_at_column();

create trigger update_students_updated_at before update on public.students
  for each row execute function update_updated_at_column();

create trigger update_groups_updated_at before update on public.groups
  for each row execute function update_updated_at_column();

-- Function to update group student count
create or replace function update_group_student_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.groups 
    set student_count = student_count + 1 
    where id = new.group_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.groups 
    set student_count = student_count - 1 
    where id = old.group_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_group_student_count_trigger
  after insert or delete on public.group_members
  for each row execute function update_group_student_count();
