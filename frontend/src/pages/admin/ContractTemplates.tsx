import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useModelos, useDeleteModelo, useCreateModelo } from "@/hooks/use-api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export default function ContractTemplates() {
  const navigate = useNavigate();
  const { data: modelos, isLoading, error } = useModelos();
  const deleteModelo = useDeleteModelo();
  const createModelo = useCreateModelo();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeloToDelete, setModeloToDelete] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    navigate(`/admin/modelos/${id}`);
  };

  const handleDuplicate = async (modelo: any) => {
    try {
      await createModelo.mutateAsync({
        nome: `${modelo.nome} (Cópia)`,
        template_texto: modelo.template_texto,
        variaveis: modelo.variaveis || [],
      });
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setModeloToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modeloToDelete) return;

    try {
      await deleteModelo.mutateAsync(modeloToDelete);
      setDeleteDialogOpen(false);
      setModeloToDelete(null);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Modelos de Contrato"
          subtitle="Gerencie seus templates de contrato"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando modelos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Modelos de Contrato"
          subtitle="Gerencie seus templates de contrato"
        />
        <div className="p-6">
          <Card className="p-6 text-center">
            <p className="text-destructive">Erro ao carregar modelos</p>
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
        title="Modelos de Contrato"
        subtitle="Gerencie seus templates de contrato"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between">
          <p className="text-muted-foreground">
            {modelos?.length || 0} modelo(s) disponível(is)
          </p>
          <Link to="/admin/modelos/novo">
            <Button className="gradient-bg gap-2">
              <Plus className="w-4 h-4" />
              Criar Modelo
            </Button>
          </Link>
        </div>

        {/* Templates Grid */}
        {modelos && modelos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelos.map((modelo) => {
              const variablesCount = Array.isArray(modelo.variaveis)
                ? modelo.variaveis.length
                : 0;

              return (
                <Card key={modelo.id} className="p-6 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleEdit(modelo.id)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => handleDuplicate(modelo)}
                          disabled={createModelo.isPending}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={() => handleDeleteClick(modelo.id)}
                          disabled={deleteModelo.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{modelo.nome}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {modelo.template_texto.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(modelo.created_at)}</span>
                    </div>
                    <span className="status-badge bg-accent text-accent-foreground">
                      {variablesCount} variável{variablesCount !== 1 ? "is" : ""}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum modelo encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro modelo de contrato para começar
            </p>
            <Link to="/admin/modelos/novo">
              <Button className="gradient-bg gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Modelo
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo? Esta ação não pode
              ser desfeita. Se houver propostas vinculadas a este modelo, a
              exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteModelo.isPending ? (
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
    </div>
  );
}
