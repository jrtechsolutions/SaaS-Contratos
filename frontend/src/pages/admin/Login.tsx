import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-api";
import { Loader2, Lock, Mail } from "lucide-react";
import logoJR from "@/assets/logo-jr.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/admin");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-xl gradient-bg flex items-center justify-center shadow-glow overflow-hidden mb-4">
              <img 
                src={logoJR} 
                alt="JR Technology Solutions" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-xl text-foreground">
                JR Technology
              </span>
              <span className="text-sm text-muted-foreground">Solutions</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Área de Acesso</h1>
          <p className="text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          {loginMutation.isError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Erro ao fazer login. Verifique suas credenciais."}
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-bg"
            disabled={loginMutation.isPending || !email || !password}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Não tem uma conta?{" "}
            <span className="text-primary font-medium">
              Entre em contato com o administrador
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

