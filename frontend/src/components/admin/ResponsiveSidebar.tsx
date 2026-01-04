import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  FileCode2,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import logoJR from "@/assets/logo-jr.png";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { auth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Propostas", path: "/admin/propostas" },
  { icon: FileSignature, label: "Contratos", path: "/admin/contratos" },
  { icon: FileCode2, label: "Modelos", path: "/admin/modelos" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

interface ResponsiveSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveSidebar({ open, onOpenChange }: ResponsiveSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    auth.clearAuth();
    queryClient.clear();
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
    if (onOpenChange) onOpenChange(false);
  };

  const handleLinkClick = () => {
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-3 group" onClick={handleLinkClick}>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow overflow-hidden">
            <img src={logoJR} alt="JR Technology" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              JR Technology
            </span>
            <span className="text-xs text-muted-foreground">Solutions</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
              onClick={handleLinkClick}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  // Mobile: Drawer lateral
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">Menu de Navegação</SheetHeader>
          <div className="h-full flex flex-col">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/Tablet: Sidebar fixa
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border/50 flex flex-col hidden lg:flex">
      <SidebarContent />
    </aside>
  );
}

