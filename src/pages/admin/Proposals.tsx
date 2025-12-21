import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileSignature,
  Trash2,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const proposals = [
  {
    id: "abc123",
    client: "Tech Corp Ltda",
    email: "contato@techcorp.com.br",
    value: "R$ 45.000,00",
    date: "18/12/2024",
    status: "aceita",
    contractGenerated: true,
  },
  {
    id: "def456",
    client: "StartUp XYZ",
    email: "financeiro@startupxyz.com",
    value: "R$ 12.500,00",
    date: "17/12/2024",
    status: "enviada",
    contractGenerated: false,
  },
  {
    id: "ghi789",
    client: "Empresa ABC",
    email: "comercial@empresaabc.com.br",
    value: "R$ 28.000,00",
    date: "16/12/2024",
    status: "rascunho",
    contractGenerated: false,
  },
  {
    id: "jkl012",
    client: "Consultoria Plus",
    email: "admin@consultoriaplus.com",
    value: "R$ 65.000,00",
    date: "15/12/2024",
    status: "enviada",
    contractGenerated: false,
  },
  {
    id: "mno345",
    client: "Digital Solutions",
    email: "contato@digitalsolutions.io",
    value: "R$ 38.500,00",
    date: "14/12/2024",
    status: "aceita",
    contractGenerated: true,
  },
  {
    id: "pqr678",
    client: "Inovação Tech",
    email: "contato@inovacaotech.com.br",
    value: "R$ 18.000,00",
    date: "12/12/2024",
    status: "cancelada",
    contractGenerated: false,
  },
];

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

export default function Proposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedProposalLink, setSelectedProposalLink] = useState("");

  const filteredProposals = proposals.filter(
    (p) =>
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = (proposalId: string) => {
    const link = `${window.location.origin}/cliente/proposta/${proposalId}`;
    setSelectedProposalLink(link);
    setLinkModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedProposalLink);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = (clientName: string) => {
    const message = encodeURIComponent(
      `Olá ${clientName}! Sua proposta comercial está pronta. Acesse: ${selectedProposalLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareEmail = (clientEmail: string, clientName: string) => {
    const subject = encodeURIComponent("Proposta Comercial - JR Technology Solutions");
    const body = encodeURIComponent(
      `Olá ${clientName},\n\nSua proposta comercial está pronta para visualização.\n\nAcesse o link: ${selectedProposalLink}\n\nAtenciosamente,\nJR Technology Solutions`
    );
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, "_blank");
  };

  const isEditable = (status: string) => status !== "aceita" && status !== "cancelada";

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
                      <div className="flex flex-col gap-1">
                        <span className={`status-badge ${statusColors[proposal.status]}`}>
                          {statusLabels[proposal.status]}
                        </span>
                        {proposal.contractGenerated && (
                          <span className="text-xs text-success flex items-center gap-1">
                            <FileSignature className="w-3 h-3" />
                            Contrato gerado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              Visualizar
                            </DropdownMenuItem>
                            
                            {isEditable(proposal.status) && (
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                Editar
                              </DropdownMenuItem>
                            )}

                            {proposal.status !== "rascunho" && (
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleCopyLink(proposal.id)}
                              >
                                <LinkIcon className="w-4 h-4" />
                                Copiar Link
                              </DropdownMenuItem>
                            )}

                            {proposal.status === "aceita" && proposal.contractGenerated && (
                              <DropdownMenuItem className="gap-2">
                                <FileSignature className="w-4 h-4" />
                                Ver Contrato
                              </DropdownMenuItem>
                            )}

                            {proposal.status === "enviada" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <Ban className="w-4 h-4" />
                                  Cancelar Proposta
                                </DropdownMenuItem>
                              </>
                            )}

                            {proposal.status === "rascunho" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* Modal de Link */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link da Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                readOnly
                value={selectedProposalLink}
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => shareWhatsApp("Cliente")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => shareEmail("", "Cliente")}
              >
                <ExternalLink className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
