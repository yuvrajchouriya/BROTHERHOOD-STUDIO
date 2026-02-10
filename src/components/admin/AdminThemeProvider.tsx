import { ReactNode } from "react";
import "@/styles/admin-theme.css";

interface AdminThemeProviderProps {
  children: ReactNode;
}

const AdminThemeProvider = ({ children }: AdminThemeProviderProps) => {
  return (
    <div className="admin-theme min-h-screen bg-[hsl(222,47%,5%)] text-[hsl(215,20%,88%)]">
      {/* Mesh background overlay */}
      <div className="fixed inset-0 pointer-events-none admin-mesh-bg opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AdminThemeProvider;
