import { Outlet } from "react-router-dom";
import logoJR from "@/assets/logo-jr.png";

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-20 border-b border-border/50 bg-card">
        <div className="container h-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow overflow-hidden">
              <img src={logoJR} alt="JR Technology" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-foreground">JR Technology</span>
              <span className="text-sm text-muted-foreground">Solutions</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 bg-card mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} JR Technology Solutions. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
