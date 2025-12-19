import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  FileText,
  Clock,
  Send,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const metrics = [
  {
    label: "Propostas Criadas",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: FileText,
    color: "primary",
  },
  {
    label: "Propostas Pendentes",
    value: "8",
    change: "-3%",
    trend: "down",
    icon: Clock,
    color: "warning",
  },
  {
    label: "Contratos Enviados",
    value: "16",
    change: "+8%",
    trend: "up",
    icon: Send,
    color: "accent",
  },
  {
    label: "Contratos Assinados",
    value: "12",
    change: "+15%",
    trend: "up",
    icon: CheckCircle2,
    color: "success",
  },
];

const recentProposals = [
  { client: "Tech Corp", value: "R$ 45.000", status: "aceita", date: "18/12/2024" },
  { client: "StartUp XYZ", value: "R$ 12.500", status: "enviada", date: "17/12/2024" },
  { client: "Empresa ABC", value: "R$ 28.000", status: "rascunho", date: "16/12/2024" },
  { client: "Consultoria Plus", value: "R$ 65.000", status: "enviada", date: "15/12/2024" },
];

const statusColors: Record<string, string> = {
  rascunho: "status-draft",
  enviada: "status-sent",
  aceita: "status-accepted",
};

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Dashboard"
        subtitle="Visão geral do sistema"
      />

      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="flex items-center gap-1 text-sm">
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>
                        {metric.change}
                      </span>
                      <span className="text-muted-foreground">vs mês anterior</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    metric.color === "primary" ? "bg-primary/10 text-primary" :
                    metric.color === "warning" ? "bg-warning/10 text-warning" :
                    metric.color === "accent" ? "bg-accent text-accent-foreground" :
                    "bg-success/10 text-success"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Simple Visual Chart */}
            <div className="h-64 flex items-end gap-4 px-4">
              {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"].map((month, i) => {
                const proposalHeight = [60, 45, 75, 55, 80, 90][i];
                const contractHeight = [40, 30, 55, 45, 60, 70][i];
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1 h-48 w-full">
                      <div
                        className="flex-1 bg-primary/80 rounded-t-md transition-all duration-500 hover:bg-primary"
                        style={{ height: `${proposalHeight}%` }}
                      />
                      <div
                        className="flex-1 bg-success/80 rounded-t-md transition-all duration-500 hover:bg-success"
                        style={{ height: `${contractHeight}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{month}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Proposals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Propostas Recentes</h3>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {recentProposals.map((proposal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{proposal.client}</p>
                    <p className="text-xs text-muted-foreground">{proposal.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{proposal.value}</p>
                    <span className={`status-badge ${statusColors[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
