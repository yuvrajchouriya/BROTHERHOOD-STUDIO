import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_WHATSAPP = "919301781585";

const FloatingWhatsApp = () => {
  // Fetch WhatsApp number from site_settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('whatsapp_number')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const whatsappNumber = siteSettings?.whatsapp_number || DEFAULT_WHATSAPP;

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello Brotherhood Studio, I would like to know more about your services."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl sm:bottom-8 sm:right-8"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={28} fill="currentColor" />
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
    </button>
  );
};

export default FloatingWhatsApp;
