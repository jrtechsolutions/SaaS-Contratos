import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import logoJR from "@/assets/logo-jr.png";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

interface OutletContext {
  onMenuClick?: () => void;
}

export function AdminTopbar({ title, subtitle, onMenuClick: propOnMenuClick }: AdminTopbarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = auth.getUser();
  const isMobile = useIsMobile();
  const outletContext = useOutletContext<OutletContext>();
  
  // Priorizar prop, depois contexto, depois função vazia
  const onMenuClick = propOnMenuClick || outletContext?.onMenuClick || (() => {});

  const handleLogout = () => {
    auth.clearAuth();
    queryClient.clear();
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Logo/Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger Menu (Mobile) */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Logo (Mobile) */}
        {isMobile ? (
          <Link to="/admin" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-glow overflow-hidden">
              <img src={logoJR} alt="JR Technology" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-foreground leading-tight">
                JR Technology
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">Solutions</span>
            </div>
          </Link>
        ) : (
          /* Page Title (Desktop/Tablet) */
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search (Desktop/Tablet) */}
        {!isMobile && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="input-field pl-9 w-48 lg:w-64 h-9"
            />
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 h-10">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isMobile && (
                <span className="font-medium hidden sm:inline truncate max-w-[120px]">
                  {user?.full_name || "Admin"}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || "Usuário"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
