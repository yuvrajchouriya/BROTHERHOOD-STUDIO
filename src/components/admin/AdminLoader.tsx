import { Loader2 } from "lucide-react";

interface AdminLoaderProps {
    label?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const AdminLoader = ({ label, className = "", size = "md" }: AdminLoaderProps) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2
                className={`${sizeClasses[size]} animate-spin text-[hsl(190,100%,50%)] drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]`}
            />
            {label && (
                <span className="text-[hsl(215,15%,65%)] text-sm font-medium tracking-wide animate-pulse uppercase">
                    {label}
                </span>
            )}
        </div>
    );
};

export default AdminLoader;
