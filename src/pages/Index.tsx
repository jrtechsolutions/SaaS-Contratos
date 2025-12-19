import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import logoJR from "@/assets/logo-jr.png";

const features = [
  {
    icon: FileText,
    title: "Propostas Profissionais",
    description: "Crie e envie propostas comerciais personalizadas com visual moderno.",
  },
  {
    icon: FileSignature,
    title: "Contratos Digitais",
    description: "Gere contratos automaticamente a partir de propostas aceitas.",
  },
  {
    icon: Shield,
    title: "Assinatura Segura",
    description: "Assinatura digital com validade jurídica e armazenamento seguro.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow overflow-hidden">
              <img src={logoJR} alt="JR Technology" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-lg">JR Technology Solutions</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Painel Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-bg-soft">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Sistema de Gestão de Propostas e Contratos
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Propostas e Contratos
              <span className="gradient-text"> Digitais</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Gerencie suas propostas comerciais, gere contratos automaticamente
              e colete assinaturas digitais de forma profissional e segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Link to="/admin">
                <Button size="lg" className="gradient-bg gap-2 px-8">
                  Acessar Painel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/cliente/proposta/1">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <Globe className="w-4 h-4" />
                  Ver Demo Cliente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa para gerenciar propostas e contratos em um só lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="p-6 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-bg-soft">
        <div className="container">
          <Card className="p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8">
              Acesse o painel administrativo e comece a criar suas propostas agora mesmo.
            </p>
            <Link to="/admin">
              <Button size="lg" className="gradient-bg gap-2 px-8">
                Acessar Painel Admin
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center overflow-hidden">
                <img src={logoJR} alt="JR Technology" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium">JR Technology Solutions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} JR Technology Solutions. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
