import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileSignature,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const proposals = [
  {
    id: "1",
    client: "Tech Corp Ltda",
    email: "contato@techcorp.com.br",
    value: "R$ 45.000,00",
    date: "18/12/2024",
    status: "aceita",
  },
  {
    id: "2",
    client: "StartUp XYZ",
    email: "financeiro@startupxyz.com",
    value: "R$ 12.500,00",
    date: "17/12/2024",
    status: "enviada",
  },
  {
    id: "3",
    client: "Empresa ABC",
    email: "comercial@empresaabc.com.br",
    value: "R$ 28.000,00",
    date: "16/12/2024",
    status: "rascunho",
  },
  {
    id: "4",
    client: "Consultoria Plus",
    email: "admin@consultoriaplus.com",
    value: "R$ 65.000,00",
    date: "15/12/2024",
    status: "enviada",
  },
  {
    id: "5",
    client: "Digital Solutions",
    email: "contato@digitalsolutions.io",
    value: "R$ 38.500,00",
    date: "14/12/2024",
    status: "aceita",
  },
];

const statusColors: Record<string, string> = {
  rascunho: "status-draft",
  enviada: "status-sent",
  aceita: "status-accepted",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
};

export default function Proposals() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProposals = proposals.filter(
    (p) =>
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Propostas"
        subtitle="Gerencie suas propostas comerciais"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <Link to="/admin/propostas/nova">
            <Button className="gradient-bg gap-2">
              <Plus className="w-4 h-4" />
              Criar Proposta
            </Button>
          </Link>
        </div>

        {/* Proposals Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="table-row">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{proposal.client}</p>
                        <p className="text-sm text-muted-foreground">{proposal.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">{proposal.value}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{proposal.date}</td>
                    <td className="p-4">
                      <span className={`status-badge ${statusColors[proposal.status]}`}>
                        {statusLabels[proposal.status]}
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
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            {proposal.status === "aceita" && (
                              <DropdownMenuItem className="gap-2">
                                <FileSignature className="w-4 h-4" />
                                Gerar Contrato
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Excluir
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
