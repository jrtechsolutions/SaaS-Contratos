import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useContratos, useContrato } from "@/hooks/use-api";
import { Contrato } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { FileText, CheckCircle2 } from "lucide-react";

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

export default function Contracts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedContractLink, setSelectedContractLink] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const { data: contratos, isLoading, error } = useContratos();
  const { data: contratoDetalhes, isLoading: loadingContrato } = useContrato(
    selectedContractId || ""
  );

  const filteredContracts = useMemo(() => {
    if (!contratos) return [];
    if (!searchTerm) return contratos;

    const term = searchTerm.toLowerCase();
    return contratos.filter(
      (c) =>
        c.proposta?.cliente_nome.toLowerCase().includes(term) ||
        c.proposta?.cliente_email.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term)
    );
  }, [contratos, searchTerm]);

  const handleView = (id: string) => {
    setSelectedContractId(id);
    setViewModalOpen(true);
  };

  const handleCopyLink = (contrato: Contrato) => {
    const link = `${window.location.origin}/cliente/contrato/${contrato.id}`;
    setSelectedContractLink(link);
    setSelectedContract(contrato);
    setLinkModalOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedContractLink);
    toast.success("Link copiado!");
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')}/contratos/${id}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF baixado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao baixar PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Contratos"
          subtitle="Visualize e gerencie contratos gerados"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando contratos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Contratos"
          subtitle="Visualize e gerencie contratos gerados"
        />
        <div className="p-6">
          <Card className="p-6 text-center">
            <p className="text-destructive">Erro ao carregar contratos</p>
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
            {filteredContracts.length > 0 ? (
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
                  {filteredContracts.map((contrato) => (
                    <tr key={contrato.id} className="table-row">
                      <td className="p-4">
                        <p className="font-medium">
                          {contrato.proposta?.cliente_nome || "—"}
                        </p>
                        {contrato.proposta?.cliente_email && (
                          <p className="text-sm text-muted-foreground">
                            {contrato.proposta.cliente_email}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {contrato.proposta_id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">
                          {contrato.proposta?.valor_total
                            ? formatCurrency(contrato.proposta.valor_total)
                            : "—"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatDate(contrato.created_at)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`status-badge ${
                            statusColors[contrato.status] || ""
                          }`}
                        >
                          {statusLabels[contrato.status] || contrato.status}
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleView(contrato.id)}
                              >
                                <Eye className="w-4 h-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleCopyLink(contrato)}
                              >
                                <LinkIcon className="w-4 h-4" />
                                Copiar Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {contrato.status === "assinado" && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleDownloadPDF(contrato.id)}
                                >
                                  <Download className="w-4 h-4" />
                                  Baixar PDF
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Nenhum contrato encontrado com os filtros aplicados"
                    : "Nenhum contrato gerado ainda"}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Modal de Link */}
        <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Link do Contrato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={selectedContractLink}
                  className="input-field text-sm flex-1"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização do Contrato */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Visualização do Contrato
              </DialogTitle>
              <DialogDescription>
                {contratoDetalhes?.proposta?.cliente_nome && (
                  <span>
                    Contrato de {contratoDetalhes.proposta.cliente_nome}
                    {contratoDetalhes.proposta.cliente_empresa &&
                      ` - ${contratoDetalhes.proposta.cliente_empresa}`}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {loadingContrato ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Carregando contrato...</p>
                </div>
              </div>
            ) : contratoDetalhes ? (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {/* Informações do Contrato */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-medium">
                        {contratoDetalhes.proposta?.cliente_nome || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-medium">
                        {contratoDetalhes.proposta?.valor_total
                          ? formatCurrency(contratoDetalhes.proposta.valor_total)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">
                        <span
                          className={`status-badge ${
                            statusColors[contratoDetalhes.status] || ""
                          }`}
                        >
                          {statusLabels[contratoDetalhes.status] ||
                            contratoDetalhes.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {formatDate(contratoDetalhes.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo do Contrato */}
                  <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-muted/30 p-4 rounded-lg overflow-x-auto">
                        {contratoDetalhes.texto_contrato}
                      </pre>
                    </div>

                    {/* Assinatura se existir */}
                    {contratoDetalhes.status === "assinado" &&
                      contratoDetalhes.assinatura_cliente && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <h3 className="font-semibold">Assinatura do Cliente</h3>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-lg bg-muted/30 border border-border">
                              <img
                                src={contratoDetalhes.assinatura_cliente}
                                alt="Assinatura do cliente"
                                className="max-w-xs h-auto"
                              />
                            </div>
                            {contratoDetalhes.data_assinatura && (
                              <p className="text-sm text-muted-foreground">
                                Assinado em: {formatDate(contratoDetalhes.data_assinatura)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Erro ao carregar contrato</p>
              </div>
            )}

            {/* Footer do Modal */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
              {contratoDetalhes?.status === "assinado" && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (selectedContractId) {
                      handleDownloadPDF(selectedContractId);
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setViewModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
