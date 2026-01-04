import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  usePropostas,
  useDeleteProposta,
  useUpdateProposta,
  useContratos,
} from "@/hooks/use-api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Proposta } from "@/lib/api";

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

export default function Proposals() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedProposalLink, setSelectedProposalLink] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<Proposta | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propostaToDelete, setPropostaToDelete] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [propostaToCancel, setPropostaToCancel] = useState<string | null>(null);

  const { data: propostas, isLoading, error } = usePropostas();
  const { data: contratos } = useContratos();
  const deleteProposta = useDeleteProposta();
  const updateProposta = useUpdateProposta();

  // Verificar quais propostas têm contratos gerados
  const propostasComContratos = useMemo(() => {
    if (!contratos) return new Set<string>();
    return new Set(contratos.map((c) => c.proposta_id));
  }, [contratos]);

  const filteredProposals = useMemo(() => {
    if (!propostas) return [];
    if (!searchTerm) return propostas;

    const term = searchTerm.toLowerCase();
    return propostas.filter(
      (p) =>
        p.cliente_nome.toLowerCase().includes(term) ||
        p.cliente_email.toLowerCase().includes(term) ||
        (p.cliente_empresa && p.cliente_empresa.toLowerCase().includes(term))
    );
  }, [propostas, searchTerm]);

  const handleCopyLink = (proposta: Proposta) => {
    const link = `${window.location.origin}/cliente/proposta/${proposta.id}`;
    setSelectedProposalLink(link);
    setSelectedProposal(proposta);
    setLinkModalOpen(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/propostas/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/admin/propostas/${id}`);
  };

  const handleViewContract = (propostaId: string) => {
    const contrato = contratos?.find((c) => c.proposta_id === propostaId);
    if (contrato) {
      navigate(`/admin/contratos/${contrato.id}`);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPropostaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propostaToDelete) return;
    try {
      await deleteProposta.mutateAsync(propostaToDelete);
      setDeleteDialogOpen(false);
      setPropostaToDelete(null);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleCancelClick = (id: string) => {
    setPropostaToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!propostaToCancel) return;
    try {
      await updateProposta.mutateAsync({
        id: propostaToCancel,
        data: { status: "cancelada" },
      });
      setCancelDialogOpen(false);
      setPropostaToCancel(null);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedProposalLink);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    if (!selectedProposal) return;
    const message = encodeURIComponent(
      `Olá ${selectedProposal.cliente_nome}! Sua proposta comercial está pronta. Acesse: ${selectedProposalLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareEmail = () => {
    if (!selectedProposal) return;
    const subject = encodeURIComponent("Proposta Comercial - JR Technology Solutions");
    const body = encodeURIComponent(
      `Olá ${selectedProposal.cliente_nome},\n\nSua proposta comercial está pronta para visualização.\n\nAcesse o link: ${selectedProposalLink}\n\nAtenciosamente,\nJR Technology Solutions`
    );
    window.open(
      `mailto:${selectedProposal.cliente_email}?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  const isEditable = (status: string) => status !== "aceita" && status !== "cancelada";

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Propostas"
          subtitle="Gerencie suas propostas comerciais"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando propostas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Propostas"
          subtitle="Gerencie suas propostas comerciais"
        />
        <div className="p-6">
          <Card className="p-6 text-center">
            <p className="text-destructive">Erro ao carregar propostas</p>
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
        title="Propostas"
        subtitle="Gerencie suas propostas comerciais"
      />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
          <div className="flex gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 h-10 sm:h-auto"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <Link to="/admin/propostas/nova" className="w-full sm:w-auto">
            <Button className="gradient-bg gap-2 w-full sm:w-auto h-10 sm:h-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Proposta</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </Link>
        </div>

        {/* Proposals - Cards (Mobile) / Table (Desktop) */}
        {filteredProposals.length > 0 ? (
          <>
            {/* Mobile: Cards */}
            <div className="lg:hidden space-y-3">
              {filteredProposals.map((proposta) => {
                const hasContract = propostasComContratos.has(proposta.id);
                return (
                  <Card key={proposta.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {proposta.cliente_nome}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {proposta.cliente_email}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleView(proposta.id)}
                          >
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </DropdownMenuItem>
                          {isEditable(proposta.status) && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleEdit(proposta.id)}
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {proposta.status !== "rascunho" && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleCopyLink(proposta)}
                            >
                              <LinkIcon className="w-4 h-4" />
                              Copiar Link
                            </DropdownMenuItem>
                          )}
                          {proposta.status === "aceita" && hasContract && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleViewContract(proposta.id)}
                            >
                              <FileSignature className="w-4 h-4" />
                              Ver Contrato
                            </DropdownMenuItem>
                          )}
                          {proposta.status === "enviada" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleCancelClick(proposta.id)}
                                disabled={updateProposta.isPending}
                              >
                                <Ban className="w-4 h-4" />
                                Cancelar
                              </DropdownMenuItem>
                            </>
                          )}
                          {proposta.status === "rascunho" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleDeleteClick(proposta.id)}
                                disabled={deleteProposta.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor</span>
                        <span className="font-semibold">
                          {formatCurrency(proposta.valor_total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(proposta.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`status-badge inline-block ${
                              statusColors[proposta.status] || ""
                            }`}
                          >
                            {statusLabels[proposta.status] || proposta.status}
                          </span>
                          {hasContract && (
                            <span className="text-xs text-success flex items-center gap-1">
                              <FileSignature className="w-3 h-3" />
                              Contrato gerado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <Card className="overflow-hidden hidden lg:block">
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
                    {filteredProposals.map((proposta) => {
                      const hasContract = propostasComContratos.has(proposta.id);
                      return (
                        <tr key={proposta.id} className="table-row">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {proposta.cliente_nome}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {proposta.cliente_email}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">
                              {formatCurrency(proposta.valor_total)}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(proposta.created_at)}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`status-badge ${
                                  statusColors[proposta.status] || ""
                                }`}
                              >
                                {statusLabels[proposta.status] || proposta.status}
                              </span>
                              {hasContract && (
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
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => handleView(proposta.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                    Visualizar
                                  </DropdownMenuItem>

                                  {isEditable(proposta.status) && (
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => handleEdit(proposta.id)}
                                    >
                                      <Edit className="w-4 h-4" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}

                                  {proposta.status !== "rascunho" && (
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => handleCopyLink(proposta)}
                                    >
                                      <LinkIcon className="w-4 h-4" />
                                      Copiar Link
                                    </DropdownMenuItem>
                                  )}

                                  {proposta.status === "aceita" && hasContract && (
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => handleViewContract(proposta.id)}
                                    >
                                      <FileSignature className="w-4 h-4" />
                                      Ver Contrato
                                    </DropdownMenuItem>
                                  )}

                                  {proposta.status === "enviada" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="gap-2 text-destructive"
                                        onClick={() => handleCancelClick(proposta.id)}
                                        disabled={updateProposta.isPending}
                                      >
                                        <Ban className="w-4 h-4" />
                                        Cancelar Proposta
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {proposta.status === "rascunho" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="gap-2 text-destructive"
                                        onClick={() => handleDeleteClick(proposta.id)}
                                        disabled={deleteProposta.isPending}
                                      >
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhuma proposta encontrada com os filtros aplicados"
                : "Nenhuma proposta cadastrada ainda"}
            </p>
          </Card>
        )}
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
                onClick={shareWhatsApp}
                disabled={!selectedProposal}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={shareEmail}
                disabled={!selectedProposal}
              >
                <ExternalLink className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta proposta? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProposta.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de cancelamento */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar proposta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta proposta? Ela não poderá mais
              ser editada ou aceita pelo cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateProposta.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Proposta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
