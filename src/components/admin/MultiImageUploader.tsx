import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";
import { optimizeImage } from "@/lib/imageUtils";

// crypto.randomUUID() only works on HTTPS — fallback for HTTP/mobile
const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};


interface MultiImageUploaderProps {
  value: string;
  onChange: (urls: string) => void;
  folder: string;
  label?: string;
  showPreviews?: boolean;
}

const MultiImageUploader = ({
  value,
  onChange,
  folder,
  label = "Image URLs (one per line)",
  showPreviews = true,
}: MultiImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Optimize image before upload
        const optimizedBlob = await optimizeImage(file);

        // Use .webp extension for optimized images
        const fileName = `${generateId()}.webp`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, optimizedBlob, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Add uploaded URLs to textarea
      onChange(value ? `${value}\n${uploadedUrls.join('\n')}` : uploadedUrls.join('\n'));
      toast({ title: `${uploadedUrls.length} image(s) uploaded successfully` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      toast({ variant: "destructive", title: "Upload failed", description: message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Parse URLs for preview
  const imageUrls = value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const removeUrl = (indexToRemove: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    onChange(newUrls.join('\n'));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <textarea
        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
      />

      {/* Image Previews */}
      {showPreviews && imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeUrl(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
