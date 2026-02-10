import { supabase } from "@/integrations/supabase/client";

export type AdminActionType = 'create' | 'update' | 'delete' | 'view' | 'login' | 'export';
export type AdminModule = 'settings' | 'services' | 'films' | 'analytics' | 'reports' | 'plans' | 'team';

export const logAdminAction = async (
    action_type: AdminActionType,
    module: AdminModule,
    details: any = {}
) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Not logged in

        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action_type,
            module,
            details,
            // ip_address: we can't easily get client IP here without an edge function, 
            // but Supabase might handle it or we skip it for now.
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};
