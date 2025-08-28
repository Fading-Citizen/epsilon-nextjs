-- Admin enhancements migration (run in Supabase SQL editor)
-- Adds teacher_id & is_active to profiles, hardens RLS, aligns with new AdminPanel

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_teacher_id ON public.profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Helper functions assumed (is_admin, is_teacher) already exist.
-- Recreate RLS policies for profiles

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Profiles insert" ON public.profiles;
CREATE POLICY "Profiles insert" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Admin puede crear cualquier perfil
    is_admin() OR 
    -- Usuario autenticado sólo puede crear su propio perfil como student
    (auth.uid() = id AND role = 'student')
  );

DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles
  FOR UPDATE USING (
    -- Admin actualiza cualquiera
    is_admin() OR 
    -- Usuario sólo su propio registro
    auth.uid() = id
  ) WITH CHECK (
    -- Admin sin restricción; usuario no puede cambiar su rol a admin/teacher
    is_admin() OR (
      auth.uid() = id AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Profiles delete" ON public.profiles;
CREATE POLICY "Profiles delete" ON public.profiles
  FOR DELETE USING (is_admin());

-- NOTE: If you previously had separate teachers/students tables you may later consolidate.
-- AdminPanel now relies on profiles.teacher_id for student->teacher assignment.

-- Soft deactivate trigger (optional) - keep simple (no trigger needed now).

-- End migration.
