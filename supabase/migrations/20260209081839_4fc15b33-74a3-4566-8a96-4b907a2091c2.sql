-- Add unique constraint to prevent duplicate roles (if not exists)
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);

-- Create trigger on auth.users to auto-assign admin role
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_admin_role();

-- Add admin role for existing users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('17b9d570-d542-477e-b240-d50f630a0c22', 'admin'),
  ('521b0e56-8317-4138-8e43-00036e0a92d3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;