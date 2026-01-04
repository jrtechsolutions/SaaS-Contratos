import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ResponsiveSidebar } from "./ResponsiveSidebar";
import { ProtectedRoute } from "../ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <ResponsiveSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : 'lg:ml-64'
        }`}>
          <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
