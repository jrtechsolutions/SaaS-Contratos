import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  FileText,
  Clock,
  Send,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/hooks/use-api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  rascunho: "status-draft",
  enviada: "status-sent",
  aceita: "status-accepted",
  cancelada: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
  cancelada: "Cancelada",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useDashboard();

  // Calcular métricas com dados reais
  const metrics = dashboardData
    ? [
        {
          label: "Propostas Criadas",
          value: dashboardData.totalPropostas.toString(),
          change: "", // Pode ser calculado comparando com período anterior
          trend: "up" as const,
          icon: FileText,
          color: "primary" as const,
        },
        {
          label: "Propostas Pendentes",
          value: dashboardData.propostasPendentes.toString(),
          change: "",
          trend: dashboardData.propostasPendentes > 0 ? ("up" as const) : ("down" as const),
          icon: Clock,
          color: "warning" as const,
        },
        {
          label: "Contratos Enviados",
          value: dashboardData.contratosEnviados.toString(),
          change: "",
          trend: "up" as const,
          icon: Send,
          color: "accent" as const,
        },
        {
          label: "Contratos Assinados",
          value: dashboardData.contratosAssinados.toString(),
          change: "",
          trend: "up" as const,
          icon: CheckCircle2,
          color: "success" as const,
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar title="Dashboard" subtitle="Visão geral do sistema" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar title="Dashboard" subtitle="Visão geral do sistema" />
        <div className="p-6">
          <Card className="p-6 text-center">
            <p className="text-destructive">Erro ao carregar dados do dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <AdminTopbar title="Dashboard" subtitle="Visão geral do sistema" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="metric-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                    {metric.change && (
                      <div className="flex items-center gap-1 text-sm">
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                        <span
                          className={
                            metric.trend === "up" ? "text-success" : "text-destructive"
                          }
                        >
                          {metric.change}
                        </span>
                        <span className="text-muted-foreground">vs mês anterior</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      metric.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : metric.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : metric.color === "accent"
                        ? "bg-accent text-accent-foreground"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Evolução Mensal</h3>
                <p className="text-sm text-muted-foreground">Propostas e contratos</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Propostas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Contratos</span>
                </div>
              </div>
            </div>

            {/* Simple Visual Chart - Placeholder por enquanto */}
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Gráfico de evolução mensal em desenvolvimento</p>
            </div>
          </Card>

          {/* Recent Proposals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Propostas Recentes</h3>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {dashboardData?.recentProposals && dashboardData.recentProposals.length > 0 ? (
                dashboardData.recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {proposal.cliente_nome || proposal.cliente_empresa || "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(proposal.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(proposal.valor_total)}
                      </p>
                      <span className={`status-badge ${statusColors[proposal.status] || ""}`}>
                        {statusLabels[proposal.status] || proposal.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhuma proposta recente</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
