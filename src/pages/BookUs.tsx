import { useEffect, useRef, useState } from "react";
import { useTracking } from "@/hooks/useTracking";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle, Instagram, Youtube, Facebook } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_WHATSAPP = "919301781585";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15, "Phone number too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  eventType: z.string().min(1, "Please select an event type"),
  eventDate: z.date({ required_error: "Please select an event date" }),
  location: z.string().trim().min(2, "Please enter event location").max(200, "Location too long"),
  hearAboutUs: z.string().optional(),
  story: z.string().max(1000, "Story too long").optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const eventTypes = [
  "Wedding Photography",
  "Pre-Wedding Shoot",
  "Event Photography",
  "Candid Photography",
  "Cinematography",
  "Drone Shoot",
  "Reel Creation",
  "Music Album Shoot",
  "Destination Shoot",
  "Filmmaking",
  "Other",
];

const hearAboutUsOptions = [
  "Instagram",
  "Friend / Reference",
  "Google",
  "Other",
];

const BookUs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useTracking();

  // Fetch WhatsApp number from site_settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const whatsappNumber = siteSettings?.whatsapp_number || DEFAULT_WHATSAPP;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      eventType: "",
      location: "",
      hearAboutUs: "",
      story: "",
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    // Hero animation
    const hero = heroRef.current;
    if (hero) {
      gsap.fromTo(
        hero.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }

    // Form fields animation
    const formElement = formRef.current;
    if (formElement) {
      const fields = formElement.querySelectorAll(".form-field");
      gsap.fromTo(
        fields,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formElement,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      // Save to database first
      const { error } = await supabase.from('enquiries').insert({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        event_type: data.eventType,
        event_date: format(data.eventDate, "yyyy-MM-dd"),
        location: data.location,
        source: data.hearAboutUs || null,
        message: data.story || null,
        status: 'New',
      });

      if (error) {
        console.error('Error saving enquiry:', error);
        toast.error('Failed to save enquiry. Please try again.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Enquiry saved! Redirecting to WhatsApp...');

      // Format the WhatsApp message
      const message = `Hello Brotherhood Studio,

We would like to book a shoot.

*Name:* ${data.name}
*Event:* ${data.eventType}
*Date:* ${format(data.eventDate, "PPP")}
*Location:* ${data.location}
*Phone:* ${data.phone}${data.email ? `\n*Email:* ${data.email}` : ""}${data.story ? `\n\n*Our Story:* ${data.story}` : ""}`;

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");

      // Reset form after successful submission
      form.reset();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppDirect = () => {
    const message = encodeURIComponent(
      "Hello Brotherhood Studio, I would like to know more about your services."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex min-h-[40vh] flex-col items-center justify-center pt-24 sm:min-h-[45vh]">
        <div ref={heroRef} className="container mx-auto px-6 text-center">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Looking to Capture a Memory with Us?
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/60 sm:text-lg">
            Fill in the details below, and we'll get back with a story crafted
            just for you.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-12 sm:py-20">
        <div ref={formRef} className="container mx-auto max-w-2xl px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Your Name / Couple Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="border-foreground/20 bg-background/50 text-foreground placeholder:text-foreground/40 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Contact Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="border-foreground/20 bg-background/50 text-foreground placeholder:text-foreground/40 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (Optional) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Email ID{" "}
                      <span className="normal-case text-foreground/40">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="border-foreground/20 bg-background/50 text-foreground placeholder:text-foreground/40 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Type */}
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Event Type *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-foreground/20 bg-background/50 text-foreground focus:border-primary">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-foreground/20 bg-background">
                        {eventTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-foreground focus:bg-primary/10"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Date */}
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="form-field flex flex-col">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Event Date *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start border-foreground/20 bg-background/50 text-left font-normal text-foreground hover:bg-background/70",
                              !field.value && "text-foreground/40"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border-foreground/20 bg-background p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Event Location *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City / Venue"
                        className="border-foreground/20 bg-background/50 text-foreground placeholder:text-foreground/40 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* How did you hear about us */}
              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      How did you hear about us?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-foreground/20 bg-background/50 text-foreground focus:border-primary">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-foreground/20 bg-background">
                        {hearAboutUsOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="text-foreground focus:bg-primary/10"
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Story */}
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="text-sm uppercase tracking-wider text-foreground/70">
                      Tell us about your story
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your love story, special requests, or anything you'd like us to know..."
                        className="min-h-[120px] resize-none border-foreground/20 bg-background/50 text-foreground placeholder:text-foreground/40 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <p className="mt-2 text-xs text-foreground/40">
                      If there's anything special you'd like us to know, feel
                      free to share.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="form-field pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border border-primary/50 bg-transparent py-6 text-sm uppercase tracking-widest text-primary transition-all duration-500 hover:bg-primary hover:text-background hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                >
                  {isSubmitting ? "Sending..." : "Send Enquiry"}
                </Button>
              </div>
            </form>
          </Form>

          {/* WhatsApp Quick Connect */}
          <div className="mt-12 border-t border-foreground/10 pt-12 text-center">
            <p className="text-sm text-foreground/50">
              Prefer a quick conversation?
            </p>
            <Button
              onClick={openWhatsAppDirect}
              variant="outline"
              className="mt-4 gap-2 border-primary/30 bg-transparent text-primary transition-all duration-300 hover:border-primary hover:bg-primary/10"
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp</span>
            </Button>
          </div>

          {/* Social Media Links */}
          <div className="mt-12 border-t border-foreground/10 pt-12 text-center">
            <p className="mb-6 text-sm uppercase tracking-widest text-foreground/50">
              Connect With Us
            </p>
            <div className="flex items-center justify-center gap-6">
              {siteSettings?.instagram_url && (
                <a
                  href={siteSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#E4405F] transition-all duration-300 hover:border-[#E4405F] hover:bg-[#E4405F]/10"
                  aria-label="Instagram"
                >
                  <Instagram className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.youtube_url && (
                <a
                  href={siteSettings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#FF0000] transition-all duration-300 hover:border-[#FF0000] hover:bg-[#FF0000]/10"
                  aria-label="YouTube"
                >
                  <Youtube className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.facebook_url && (
                <a
                  href={siteSettings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#1877F2] transition-all duration-300 hover:border-[#1877F2] hover:bg-[#1877F2]/10"
                  aria-label="Facebook"
                >
                  <Facebook className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${siteSettings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#25D366] transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366]/10"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
            </div>
          </div>

          {/* Minimal Contact Note */}
          <div className="mt-12 text-center">
            <p className="text-xs leading-relaxed text-foreground/40">
              We currently accept a limited number of weddings each season
              <br />
              to ensure quality and attention to every story.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookUs;
