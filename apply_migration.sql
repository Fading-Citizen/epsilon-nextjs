-- Direct SQL execution script for Supabase
-- Run this in your Supabase SQL Editor at: https://supabase.com/dashboard/project/sjclamcebiqvkbausszz/sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles with roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teachers table (extending user profiles)
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE,
  specialization text,
  department text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id), -- Admin que creó al profesor
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table with admin creation control
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_activity timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id), -- Admin que creó al estudiante
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table (teachers can create/manage)
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  thumbnail_url text,
  duration_hours integer DEFAULT 0,
  price decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course enrollments (teachers assign students)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  enrolled_by uuid REFERENCES auth.users(id), -- Profesor que asignó
  enrollment_date timestamptz DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at timestamptz,
  grade decimal(5,2),
  UNIQUE(course_id, student_id)
);
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  is_active boolean DEFAULT true,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  student_count integer DEFAULT 0,
  course_count integer DEFAULT 0,
  permissions text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group memberships (many-to-many students <-> groups)
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, student_id)
);

-- Create messages table for chat system
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teachers(is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_created_by ON public.teachers(created_by);
CREATE INDEX IF NOT EXISTS idx_students_created_by ON public.students(created_by);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON public.groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_active ON public.groups(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON public.messages(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student ON public.group_members(student_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for teachers table (Admin manages)
DROP POLICY IF EXISTS "Everyone can view teachers" ON public.teachers;
CREATE POLICY "Everyone can view teachers" ON public.teachers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can manage teachers" ON public.teachers;
CREATE POLICY "Only admins can manage teachers" ON public.teachers
  FOR ALL USING (is_admin());

-- RLS Policies for students table (Admin creates, Teachers assign)
DROP POLICY IF EXISTS "Everyone can view students" ON public.students;
CREATE POLICY "Everyone can view students" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can create students" ON public.students;
CREATE POLICY "Only admins can create students" ON public.students
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins and assigned teachers can update students" ON public.students;
CREATE POLICY "Admins and assigned teachers can update students" ON public.students
  FOR UPDATE USING (
    is_admin() OR 
    (is_teacher() AND teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "Only admins can delete students" ON public.students;
CREATE POLICY "Only admins can delete students" ON public.students
  FOR DELETE USING (is_admin());

-- RLS Policies for courses table (Teachers manage their own)
DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (
    status = 'published' OR 
    teacher_id = auth.uid() OR 
    is_admin()
  );

DROP POLICY IF EXISTS "Teachers can manage their own courses" ON public.courses;
CREATE POLICY "Teachers can manage their own courses" ON public.courses
  FOR ALL USING (
    is_teacher() AND teacher_id = auth.uid()
  );

DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;
CREATE POLICY "Teachers can create courses" ON public.courses
  FOR INSERT WITH CHECK (
    is_teacher() AND teacher_id = auth.uid()
  );

-- RLS Policies for course enrollments (Teachers assign students)
DROP POLICY IF EXISTS "Users can view relevant enrollments" ON public.course_enrollments;
CREATE POLICY "Users can view relevant enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.teacher_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()) OR
    is_admin()
  );

DROP POLICY IF EXISTS "Teachers can manage enrollments" ON public.course_enrollments;
CREATE POLICY "Teachers can manage enrollments" ON public.course_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.teacher_id = auth.uid())
  );
DROP POLICY IF EXISTS "Teachers can view all groups" ON public.groups;
CREATE POLICY "Teachers can view all groups" ON public.groups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Teachers can manage their own groups" ON public.groups;
CREATE POLICY "Teachers can manage their own groups" ON public.groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND id = groups.teacher_id)
  );

-- RLS Policies for group members
DROP POLICY IF EXISTS "Teachers can view group memberships" ON public.group_members;
CREATE POLICY "Teachers can view group memberships" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups g 
      JOIN public.teachers t ON g.teacher_id = t.id 
      WHERE g.id = group_members.group_id AND t.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can manage group memberships" ON public.group_members;
CREATE POLICY "Teachers can manage group memberships" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.groups g 
      JOIN public.teachers t ON g.teacher_id = t.id 
      WHERE g.id = group_members.group_id AND t.id = auth.uid()
    )
  );

-- RLS Policies for messages table
DROP POLICY IF EXISTS "Users can view general channel messages" ON public.messages;
CREATE POLICY "Users can view general channel messages" ON public.messages
  FOR SELECT USING (channel = 'general');

DROP POLICY IF EXISTS "Teacher student chat access" ON public.messages;
CREATE POLICY "Teacher student chat access" ON public.messages
  FOR SELECT USING (
    channel LIKE 'dm_%' AND (
      -- Teacher can see chats with their assigned students
      EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.teacher_id = auth.uid() 
        AND s.user_id::text = ANY(string_to_array(replace(channel, 'dm_', ''), '_'))
      )
      OR
      -- Student can see chat with their assigned teacher
      EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.user_id = auth.uid() 
        AND s.teacher_id::text = ANY(string_to_array(replace(channel, 'dm_', ''), '_'))
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can send messages to general channel" ON public.messages;
CREATE POLICY "Authenticated users can send messages to general channel" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'general'
  );

DROP POLICY IF EXISTS "Teacher student chat insert" ON public.messages;
CREATE POLICY "Teacher student chat insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND channel LIKE 'dm_%' 
    AND (
      -- Teacher can send messages to their assigned students
      EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.teacher_id = auth.uid() 
        AND s.user_id::text = ANY(string_to_array(replace(channel, 'dm_', ''), '_'))
      )
      OR
      -- Student can send messages to their assigned teacher
      EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.user_id = auth.uid() 
        AND s.teacher_id::text = ANY(string_to_array(replace(channel, 'dm_', ''), '_'))
      )
    )
  );

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update group student count
CREATE OR REPLACE FUNCTION update_group_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups 
    SET student_count = student_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups 
    SET student_count = student_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_group_student_count_trigger ON public.group_members;
CREATE TRIGGER update_group_student_count_trigger
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_student_count();

-- Note: Sample teachers data should be inserted after creating actual users
-- For now, we'll create a helper function to insert sample data when users exist

-- Create a function to safely insert sample students and groups
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS TEXT AS $$
DECLARE
  sample_teacher_id uuid;
  sample_student_id uuid;
  sample_group_id uuid;
BEGIN
  -- Check if we have any authenticated users that could be teachers
  SELECT auth.uid() INTO sample_teacher_id;
  
  IF sample_teacher_id IS NOT NULL THEN
    -- Insert current user as a teacher if not exists
    INSERT INTO public.teachers (id, name, email, specialization) 
    VALUES (sample_teacher_id, 'Current User (Teacher)', 'teacher@epsilon.com', 'General')
    ON CONFLICT (id) DO UPDATE SET 
      name = EXCLUDED.name,
      specialization = EXCLUDED.specialization;
    
    -- Insert sample students
    INSERT INTO public.students (name, email, teacher_id, status, progress) VALUES
      ('Ana García Rodríguez', 'ana.garcia@epsilon.com', sample_teacher_id, 'active', 85),
      ('Carlos López Mesa', 'carlos.lopez@epsilon.com', sample_teacher_id, 'active', 62),
      ('María Fernández Silva', 'maria.fernandez@epsilon.com', sample_teacher_id, 'inactive', 45)
    ON CONFLICT (email) DO NOTHING;
    
    -- Insert sample groups
    INSERT INTO public.groups (name, description, color, teacher_id, is_active) VALUES
      ('Premium', 'Estudiantes con acceso completo a todos los cursos', '#8b5cf6', sample_teacher_id, true),
      ('Básico', 'Acceso estándar a cursos fundamentales', '#10b981', sample_teacher_id, true),
      ('Matemáticas Avanzado', 'Grupo especializado para matemáticas avanzadas', '#3b82f6', sample_teacher_id, true)
    ON CONFLICT DO NOTHING;
    
    RETURN 'Sample data inserted successfully for teacher: ' || sample_teacher_id;
  ELSE
    RETURN 'No authenticated user found. Sample data not inserted. Please login and run: SELECT insert_sample_data();';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create alternative sample data insertion (without FK constraints)
-- This creates orphaned records that can be adopted by teachers later
DO $$
BEGIN
  -- Insert some sample students without teacher assignment
  INSERT INTO public.students (name, email, status, progress, teacher_id) VALUES
    ('Ana García Rodríguez', 'ana.garcia@epsilon.com', 'active', 85, NULL),
    ('Carlos López Mesa', 'carlos.lopez@epsilon.com', 'active', 62, NULL),
    ('María Fernández Silva', 'maria.fernandez@epsilon.com', 'inactive', 45, NULL),
    ('Pedro Sánchez Torres', 'pedro.sanchez@epsilon.com', 'active', 78, NULL),
    ('Lucía Morales Vega', 'lucia.morales@epsilon.com', 'active', 91, NULL)
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert some sample groups without teacher assignment
  INSERT INTO public.groups (name, description, color, is_active, teacher_id) VALUES
    ('Premium', 'Estudiantes con acceso completo a todos los cursos', '#8b5cf6', true, NULL),
    ('Básico', 'Acceso estándar a cursos fundamentales', '#10b981', true, NULL),
    ('Matemáticas Avanzado', 'Grupo especializado para matemáticas avanzadas', '#3b82f6', true, NULL),
    ('Física General', 'Estudiantes de cursos de física general', '#f59e0b', true, NULL)
  ON CONFLICT DO NOTHING;
  
  -- Insert some sample messages in general channel
  INSERT INTO public.messages (channel, sender_id, content) VALUES
    ('general', '00000000-0000-0000-0000-000000000000', 'Bienvenidos al chat general de Epsilon Academy'),
    ('general', '00000000-0000-0000-0000-000000000000', 'Aquí pueden hacer preguntas y colaborar entre todos')
  ON CONFLICT DO NOTHING;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors for sample data
    NULL;
END $$;

-- Success message
SELECT 'Migration completed successfully! Tables, indexes, and RLS policies created. Sample data available.' as result;

-- Additional RLS policies for complete role-based access control

-- Groups RLS policies (role-based access)
DROP POLICY IF EXISTS "Admin can manage all groups" ON public.groups;
CREATE POLICY "Admin can manage all groups" ON public.groups
FOR ALL
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Teachers can manage their own groups" ON public.groups;
CREATE POLICY "Teachers can manage their own groups" ON public.groups
FOR ALL
TO authenticated
USING (
  is_teacher() AND 
  teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Students can view their groups" ON public.groups;
CREATE POLICY "Students can view their groups" ON public.groups
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'student'
  ) AND 
  id IN (
    SELECT group_id 
    FROM public.group_members gm
    JOIN public.students s ON gm.student_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- Group members RLS policies
DROP POLICY IF EXISTS "Admin can manage all group members" ON public.group_members;
CREATE POLICY "Admin can manage all group members" ON public.group_members
FOR ALL
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Teachers can manage their group members" ON public.group_members;
CREATE POLICY "Teachers can manage their group members" ON public.group_members
FOR ALL
TO authenticated
USING (
  is_teacher() AND 
  group_id IN (
    SELECT id 
    FROM public.groups 
    WHERE teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Students can view their group memberships" ON public.group_members;
CREATE POLICY "Students can view their group memberships" ON public.group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = group_members.student_id 
    AND user_id = auth.uid()
  )
);

-- Enhanced Messages RLS policies (role-based access)
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;
CREATE POLICY "Admin can view all messages" ON public.messages
FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT
TO authenticated
USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Teacher-Student DM access" ON public.messages;
CREATE POLICY "Teacher-Student DM access" ON public.messages
FOR SELECT
TO authenticated
USING (
  channel LIKE 'dm_teacher_student_%' AND
  (
    -- Teacher can view messages with their students
    (is_teacher() AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.teacher_id = auth.uid()
      AND (
        channel LIKE '%_' || s.user_id || '_%' OR
        channel LIKE '%_' || auth.uid() || '_%'
      )
    )) OR
    -- Student can view messages with their assigned teacher
    (EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.user_id = auth.uid()
      AND s.teacher_id IS NOT NULL
      AND (
        channel LIKE '%_' || s.teacher_id || '_%' OR
        channel LIKE '%_' || auth.uid()
      )
    ))
  )
);

DROP POLICY IF EXISTS "Users can send appropriate messages" ON public.messages;
CREATE POLICY "Users can send appropriate messages" ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  (
    -- General channel for all authenticated users
    channel = 'general' OR
    -- Teacher-Student DM channels (check teacher-student relationship)
    (
      channel LIKE 'dm_teacher_student_%' AND
      (
        (is_teacher() AND EXISTS (
          SELECT 1 FROM public.students s
          WHERE s.teacher_id = auth.uid() 
          AND channel LIKE '%_' || s.user_id || '_%'
        )) OR
        (EXISTS (
          SELECT 1 FROM public.students s
          WHERE s.user_id = auth.uid() 
          AND s.teacher_id IS NOT NULL 
          AND channel LIKE '%_' || s.teacher_id || '_%'
        ))
      )
    )
  )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete appropriate messages" ON public.messages;
CREATE POLICY "Users can delete appropriate messages" ON public.messages
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid() OR 
  is_admin()
);

-- Additional indexes for better performance with role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teachers(is_active);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher ON public.groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student ON public.group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Final success message
SELECT 'Complete role-based migration applied successfully! All RLS policies and indexes are in place.' as final_result;
