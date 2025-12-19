import { useState } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const contracts = [
  {
    id: "1",
    client: "Tech Corp Ltda",
    proposal: "PROP-001",
    value: "R$ 45.000,00",
    date: "18/12/2024",
    status: "assinado",
  },
  {
    id: "2",
    client: "Digital Solutions",
    proposal: "PROP-005",
    value: "R$ 38.500,00",
    date: "17/12/2024",
    status: "visualizado",
  },
  {
    id: "3",
    client: "Empresa ABC",
    proposal: "PROP-003",
    value: "R$ 28.000,00",
    date: "16/12/2024",
    status: "enviado",
  },
  {
    id: "4",
    client: "Consultoria Plus",
    proposal: "PROP-004",
    value: "R$ 65.000,00",
    date: "15/12/2024",
    status: "enviado",
  },
];

const statusColors: Record<string, string> = {
  enviado: "status-sent",
  visualizado: "status-viewed",
  assinado: "status-signed",
};

const statusLabels: Record<string, string> = {
  enviado: "Enviado",
  visualizado: "Visualizado",
  assinado: "Assinado",
};

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContracts = contracts.filter(
    (c) =>
      c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.proposal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Contratos"
        subtitle="Visualize e gerencie contratos gerados"
      />

      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <Card className="p-4 bg-secondary/50 border-secondary">
          <p className="text-sm text-secondary-foreground">
            <strong>Nota:</strong> Contratos são gerados automaticamente a partir de propostas aceitas.
            Utilize a página de Propostas para criar novos contratos.
          </p>
        </Card>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente ou proposta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contracts Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Proposta</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="table-row">
                    <td className="p-4">
                      <p className="font-medium">{contract.client}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground font-mono">
                        {contract.proposal}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{contract.value}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{contract.date}</td>
                    <td className="p-4">
                      <span className={`status-badge ${statusColors[contract.status]}`}>
                        {statusLabels[contract.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Copiar Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <RefreshCw className="w-4 h-4" />
                              Reenviar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="w-4 h-4" />
                              Gerar PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
